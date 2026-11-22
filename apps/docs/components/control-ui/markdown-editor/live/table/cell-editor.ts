import { redo, undo } from "@codemirror/commands";
import { defineLanguageFacet, Language, languageDataProp } from "@codemirror/language";
import {
  Annotation,
  type ChangeSet,
  Compartment,
  EditorSelection,
  EditorState,
  type Extension,
  Facet,
  Prec,
  type SelectionRange,
  Transaction,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { GFM, parser } from "@lezer/markdown";
import { editingKeymap, markdownMarkKeymap } from "../format/keymap";
import { livePreview, markdownUrlPolicy } from "../preview/live-preview";
import { recipeTheme } from "../preview/recipe-theme";
import { escapeCellText } from "./table-model";

export type CellMove = "next" | "previous" | "below" | "up" | "down" | "left" | "right";
export type CellEdit = { changes: ChangeSet; selection: SelectionRange; userEvent: string | undefined };

export type CellHost = {
  readonly outer: EditorView;
  forward: (cell: CellEditor, edit: CellEdit) => void;
  navigate: (cell: CellEditor, move: CellMove) => boolean;
  columnHeaderId: (column: number) => string;
};

/** The consumer's extensions, which every cell editor gets after its own. */
export const cellExtensions = Facet.define<Extension>();

const cellData = defineLanguageFacet();
/** A table cell holds one line of inline Markdown, so every block syntax is left out of its parser. */
const cellLanguage = new Language(
  cellData,
  parser.configure([
    GFM,
    {
      remove: [
        "LinkReference",
        "IndentedCode",
        "FencedCode",
        "Blockquote",
        "HorizontalRule",
        "BulletList",
        "OrderedList",
        "ATXHeading",
        "HTMLBlock",
        "SetextHeading",
        "Table",
        "TaskList",
      ],
      props: [languageDataProp.add({ Document: cellData })],
    },
  ]),
  [],
  "markdown-cell",
);

const fromTable = Annotation.define<true>();

function oddBackslashesBefore(state: EditorState, pos: number) {
  let count = 0;
  while (pos - count > 0 && state.sliceDoc(pos - count - 1, pos - count) === "\\") count++;
  return count % 2 === 1;
}

/** A pipe would end the cell and a newline the row, so typed and pasted ones are escaped or flattened. */
const cellInput = EditorState.transactionFilter.of((transaction) => {
  if (!transaction.docChanged || transaction.annotation(fromTable)) return transaction;
  const { startState } = transaction;
  let rewritten = false;
  const changes: { from: number; to: number; insert: string }[] = [];
  transaction.changes.iterChanges((from, to, _fromB, _toB, inserted) => {
    const text = inserted.toString();
    const prefix = oddBackslashesBefore(startState, from) ? "\\" : "";
    const insert = escapeCellText(prefix + text).slice(prefix.length);
    rewritten ||= insert !== text;
    changes.push({ from, to, insert });
  });
  if (!rewritten) return transaction;
  const changeSet = startState.changes(changes);
  return {
    changes: changeSet,
    selection: EditorSelection.cursor(changeSet.mapPos(startState.selection.main.to, 1)),
    effects: transaction.effects,
    userEvent: transaction.annotation(Transaction.userEvent),
    scrollIntoView: transaction.scrollIntoView,
  };
});

function atVerticalEdge(view: EditorView, forward: boolean) {
  const range = view.state.selection.main;
  if (!range.empty) return false;
  const moved = view.moveVertically(range, forward);
  return moved.head === range.head || moved.head === (forward ? view.state.doc.length : 0);
}

function cellKeymap(cell: CellEditor) {
  const { host } = cell;
  const go = (move: CellMove) => () => host.navigate(cell, move);
  const caret = (view: EditorView) => (view.state.selection.main.empty ? view.state.selection.main.head : null);
  return Prec.highest(
    keymap.of([
      { key: "Tab", run: go("next"), shift: go("previous") },
      { key: "Enter", run: go("below"), shift: () => true },
      { key: "ArrowUp", run: (view) => atVerticalEdge(view, false) && host.navigate(cell, "up") },
      { key: "ArrowDown", run: (view) => atVerticalEdge(view, true) && host.navigate(cell, "down") },
      { key: "ArrowLeft", run: (view) => caret(view) === 0 && host.navigate(cell, "left") },
      { key: "ArrowRight", run: (view) => caret(view) === view.state.doc.length && host.navigate(cell, "right") },
      { key: "Mod-z", run: () => undo(host.outer), preventDefault: true },
      { key: "Mod-y", run: () => redo(host.outer), preventDefault: true },
      { key: "Mod-Shift-z", run: () => redo(host.outer), preventDefault: true },
    ]),
  );
}

function editability(editable: boolean): Extension {
  return [EditorView.editable.of(editable), EditorState.readOnly.of(!editable)];
}

/** The outer editor redraws its DOM selection on "select.pointer", which would pull focus out of the cell. */
function forwardedUserEvent(event: string | undefined) {
  return event === "select.pointer" ? "select" : event;
}

/** The outer document stays the truth: edits go out to it, and its text comes back in. */
export class CellEditor {
  readonly view: EditorView;
  private readonly editable = new Compartment();

  constructor(
    readonly host: CellHost,
    parent: HTMLElement,
    public row: number,
    public column: number,
    text: string,
    editable: boolean,
  ) {
    this.view = new EditorView({
      parent,
      state: EditorState.create({ doc: text, extensions: this.extensions(editable) }),
      dispatchTransactions: (transactions, view) => {
        const fromUser = transactions.every((transaction) => !transaction.annotation(fromTable));
        const docChanged = transactions.some((transaction) => transaction.docChanged);
        view.update(transactions);
        if (!fromUser || !(docChanged || view.hasFocus)) return;
        host.forward(this, {
          changes: transactions.map((transaction) => transaction.changes).reduce((all, next) => all.compose(next)),
          selection: view.state.selection.main,
          userEvent: forwardedUserEvent(transactions.at(-1)?.annotation(Transaction.userEvent)),
        });
      },
    });
  }

  private extensions(editable: boolean): Extension {
    return [
      cellLanguage,
      livePreview,
      markdownUrlPolicy.of(this.host.outer.state.facet(markdownUrlPolicy)),
      recipeTheme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-multiline": "false", "aria-labelledby": this.host.columnHeaderId(this.column) }),
      this.editable.of(editability(editable)),
      cellInput,
      cellKeymap(this),
      markdownMarkKeymap,
      editingKeymap,
      this.host.outer.state.facet(cellExtensions),
    ];
  }

  get text() {
    return this.view.state.doc.toString();
  }

  /** Takes the cell's text from the outer document, changing only what differs so the caret stays put. */
  sync(text: string) {
    const current = this.text;
    if (current === text) return;
    let start = 0;
    while (start < current.length && start < text.length && current[start] === text[start]) start++;
    let end = 0;
    while (end < current.length - start && end < text.length - start && current.at(-1 - end) === text.at(-1 - end)) end++;
    this.view.dispatch({
      changes: { from: start, to: current.length - end, insert: text.slice(start, text.length - end) },
      annotations: fromTable.of(true),
    });
  }

  setEditable(editable: boolean) {
    if (this.view.state.facet(EditorView.editable) === editable) return;
    this.view.dispatch({ effects: this.editable.reconfigure(editability(editable)), annotations: fromTable.of(true) });
  }

  select(anchor: number, head = anchor) {
    const length = this.view.state.doc.length;
    const clamp = (pos: number) => Math.max(0, Math.min(length, pos));
    const selection = EditorSelection.single(clamp(anchor), clamp(head));
    if (this.view.state.selection.eq(selection)) return;
    this.view.dispatch({ selection, annotations: fromTable.of(true) });
  }

  focus(at: "start" | "end" | number) {
    const length = this.view.state.doc.length;
    const edges = { start: 0, end: length };
    const position = Math.max(0, Math.min(length, typeof at === "number" ? at : edges[at]));
    this.view.focus();
    this.view.dispatch({ selection: EditorSelection.cursor(position), userEvent: "select" });
  }

  destroy() {
    this.view.destroy();
  }
}
