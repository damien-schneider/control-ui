import { redo, redoDepth, undo, undoDepth } from "@codemirror/commands";
import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { MarkdownEditorEngine, MarkdownEditorSnapshot, MarkdownTextBeforeCaret } from "../engine";
import { createLiveBlocks } from "./drag/block-drag";
import { activeBlocks, headingLevel, replaceWithBlock, setHeading, toggleBlock } from "./format/blocks";
import { blockPrefix, codeBlockAt, enclosingNode, insideCode, isMarkActive, toggleMark } from "./format/inline";
import { insertImage, linkAt, replaceWithMention, setLink } from "./format/links";
import { type LiveServices, type LiveSettings, liveSetup, reconfigureLive } from "./live-setup";
import { activeTableCell, createLiveTables } from "./table/live-tables";
import { createLiveUploads } from "./upload-placeholders";

export type LiveEditor = {
  readonly engine: MarkdownEditorEngine;
  readonly view: EditorView;
  configure: (settings: Partial<Omit<LiveSettings, "editable">>) => void;
  focusEnd: () => void;
  destroy: () => void;
};

function readSnapshot(state: EditorState, focused: boolean, isEmpty: boolean): MarkdownEditorSnapshot {
  const { main } = state.selection;
  return {
    marks: {
      bold: isMarkActive(state, "bold"),
      italic: isMarkActive(state, "italic"),
      strike: isMarkActive(state, "strike"),
      code: isMarkActive(state, "code"),
    },
    blocks: activeBlocks(state),
    heading: headingLevel(state),
    link: linkAt(state)?.href ?? null,
    canUndo: undoDepth(state) > 0,
    canRedo: redoDepth(state) > 0,
    focused,
    formattable: !main.empty && state.sliceDoc(main.from, main.to).trim() !== "" && codeBlockAt(state, main.from) === null,
    inlineOnly: enclosingNode(state, main, "Table") !== null,
    isEmpty,
    sourceRequired: false,
  };
}

/** Text from the start of the caret's block to the caret, in outer document positions. */
function textBefore(state: EditorState, offset: number): MarkdownTextBeforeCaret | null {
  const { main } = state.selection;
  if (!main.empty || insideCode(state, main.head) || linkAt(state)) return null;
  const line = state.doc.lineAt(main.head);
  const start = line.from + (blockPrefix.exec(line.text)?.[0].length ?? 0);
  if (main.head < start) return null;
  return { text: state.sliceDoc(start, main.head), from: offset + start, to: offset + main.head };
}

function rectBetween(view: EditorView, from: number, to: number): DOMRect | null {
  const start = view.coordsAtPos(from, 1);
  const end = to === from ? start : view.coordsAtPos(to, -1);
  if (!(start && end)) return null;
  const left = Math.min(start.left, end.left);
  return new DOMRect(left, start.top, Math.max(start.right, end.right) - left, end.bottom - start.top);
}

export function createLiveEditor(markdown: string, editable: boolean, services: Omit<LiveServices, "onUpdate">): LiveEditor {
  const listeners = new Set<() => void>();
  const changeListeners = new Set<(markdown: string) => void>();
  let current = markdown;
  let settings: LiveSettings = { editable, preview: true, attributes: { role: "textbox", "aria-multiline": "true" }, placeholder: "" };
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const onUpdate = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      current = update.state.doc.toString();
      for (const listener of changeListeners) listener(current);
    }
    notify();
  });
  const createState = (doc: string) => EditorState.create({ doc, extensions: liveSetup(settings, { ...services, onUpdate }) });
  const view = new EditorView({ state: createState(markdown) });
  const notifyFocus = () => queueMicrotask(notify);
  view.contentDOM.addEventListener("focusin", notifyFocus);
  view.contentDOM.addEventListener("focusout", notifyFocus);

  let emptiness = { doc: view.state.doc, isEmpty: markdown.trim() === "" };
  let cache: { state: EditorState; focused: boolean; snapshot: MarkdownEditorSnapshot } | null = null;
  const focusedCell = () => activeTableCell(view);
  const caretView = () => focusedCell()?.editor ?? view;
  const run = (command: StateCommand) => {
    if (!focusedCell()) view.focus();
    command({ state: view.state, dispatch: (transaction) => view.dispatch(transaction) });
  };

  function configure(next: Partial<LiveSettings>) {
    const merged = { ...settings, ...next };
    const effects = reconfigureLive(settings, merged);
    settings = merged;
    if (effects.length > 0) view.dispatch({ effects });
  }

  const engine: MarkdownEditorEngine = {
    element: view.contentDOM,
    sourceView: "editor",
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      const { state } = view;
      const focused = view.contentDOM.contains(view.root.activeElement);
      if (cache?.state === state && cache.focused === focused) return cache.snapshot;
      if (emptiness.doc !== state.doc) emptiness = { doc: state.doc, isEmpty: state.sliceDoc().trim() === "" };
      cache = { state, focused, snapshot: readSnapshot(state, focused, emptiness.isEmpty) };
      return cache.snapshot;
    },
    onChange(listener) {
      changeListeners.add(listener);
      return () => {
        changeListeners.delete(listener);
      };
    },
    getMarkdown: () => current,
    setMarkdown(next) {
      if (next === current) return;
      current = next;
      view.setState(createState(next));
      notify();
    },
    setEditable: (next) => configure({ editable: next }),
    focus: () => view.focus(),
    undo: () => run(undo),
    redo: () => run(redo),
    toggleMark: (mark) => run(toggleMark(mark)),
    toggleBlock: (block) => run(toggleBlock(block)),
    setHeading: (level) => run(setHeading(level)),
    setLink: (href) => run(setLink(href)),
    insertImage: (image) => run(insertImage(image)),
    selectionRect() {
      const target = caretView();
      const { from, to } = target.state.selection.main;
      return rectBetween(target, from, to);
    },
    textBeforeCaret() {
      const cell = focusedCell();
      if (cell) return textBefore(cell.editor.state, cell.from);
      return view.hasFocus ? textBefore(view.state, 0) : null;
    },
    caretRect() {
      const target = caretView();
      const { head } = target.state.selection.main;
      return rectBetween(target, head, head);
    },
    replaceWithBlock: (range, block) => run(replaceWithBlock(range, block)),
    replaceWithMention: (range, mention) => run(replaceWithMention(range, mention)),
    positionAt: (point) => view.posAtCoords(point),
    uploads: createLiveUploads(view),
    blocks: createLiveBlocks(view),
    tables: createLiveTables(view),
  };

  return {
    engine,
    view,
    configure,
    focusEnd() {
      view.dispatch({ selection: EditorSelection.cursor(view.state.doc.length), scrollIntoView: true });
      view.focus();
    },
    destroy() {
      view.contentDOM.removeEventListener("focusin", notifyFocus);
      view.contentDOM.removeEventListener("focusout", notifyFocus);
      view.destroy();
    },
  };
}
