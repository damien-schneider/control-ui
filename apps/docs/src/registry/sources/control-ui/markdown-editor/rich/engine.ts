import { type ChainedCommands, type Editor, posToDOMRect } from "@tiptap/core";
import type { MarkdownManager } from "@tiptap/markdown";
import { Slice } from "@tiptap/pm/model";
import { EditorState, NodeSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import {
  type MarkdownBlockCommand,
  type MarkdownBlockType,
  type MarkdownEditorEngine,
  type MarkdownEditorSnapshot,
  type MarkdownMark,
  markdownHeadingLevels,
} from "../engine";
import type { MarkdownUrlPolicy } from "../url-policy";
import { createRichBlocks } from "./blocks";
import { hasMarkdownContent, requiresMarkdownSource } from "./extensions";
import { createRichTables } from "./tables";
import { createRichUploads } from "./uploads";

type Command = (chain: ChainedCommands) => ChainedCommands;

const markCommands: Record<MarkdownMark, Command> = {
  bold: (chain) => chain.toggleBold(),
  italic: (chain) => chain.toggleItalic(),
  strike: (chain) => chain.toggleStrike(),
  code: (chain) => chain.toggleCode(),
};

const blockCommands: Record<MarkdownBlockType, Command> = {
  bulletList: (chain) => chain.toggleBulletList(),
  orderedList: (chain) => chain.toggleOrderedList(),
  taskList: (chain) => chain.toggleTaskList(),
  blockquote: (chain) => chain.toggleBlockquote(),
  codeBlock: (chain) => chain.toggleCodeBlock(),
};

function replacementCommand(block: MarkdownBlockCommand): Command {
  switch (block.type) {
    case "paragraph":
      return (chain) => chain.clearNodes().setParagraph();
    case "heading":
      return (chain) => chain.clearNodes().setHeading({ level: block.level });
    case "horizontalRule":
      return (chain) => chain.setHorizontalRule();
    case "table":
      return (chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
    default:
      return (chain) => blockCommands[block.type](chain.clearNodes());
  }
}

function rectAt(view: EditorView, position: number) {
  const coords = view.coordsAtPos(position);
  return new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top);
}

/** Plain-text Markdown pastes as formatted content, unless it holds Markdown this editor would lose. */
export function pasteMarkdown(codec: MarkdownManager, isUrlAllowed: MarkdownUrlPolicy) {
  return (view: EditorView, event: ClipboardEvent) => {
    const text = event.clipboardData?.getData("text/plain");
    if (!view.editable || !text || event.clipboardData?.getData("text/html") || requiresMarkdownSource(text, codec, isUrlAllowed))
      return false;
    const document = view.state.schema.nodeFromJSON(codec.parse(text));
    event.preventDefault();
    view.dispatch(view.state.tr.replaceSelection(Slice.maxOpen(document.content)).scrollIntoView());
    return true;
  };
}

export function createRichEngine(
  editor: Editor,
  codec: MarkdownManager,
  isUrlAllowed: MarkdownUrlPolicy,
  initialMarkdown: string,
): MarkdownEditorEngine {
  const listeners = new Set<() => void>();
  let markdown = initialMarkdown;
  let sourceRequired = requiresMarkdownSource(markdown, codec, isUrlAllowed);
  let emptiness = { document: editor.state.doc, isEmpty: !hasMarkdownContent(editor.state.doc) };
  let cache: { state: EditorState; editable: boolean; sourceRequired: boolean; snapshot: MarkdownEditorSnapshot } | null = null;
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const run = (command: Command) => {
    command(editor.chain().focus()).run();
  };

  /** The empty paragraph kept after a closing block is a place to type, not content, so it never reaches the Markdown. */
  function serializeContent() {
    const content = editor.getJSON().content ?? [];
    const last = content.at(-1);
    const placeholder = content.length > 1 && last?.type === "paragraph" && !last.content?.length;
    return codec.serialize({ type: "doc", content: placeholder ? content.slice(0, -1) : content });
  }

  function isEmpty() {
    if (sourceRequired) return markdown.trim() === "";
    if (emptiness.document !== editor.state.doc) emptiness = { document: editor.state.doc, isEmpty: !hasMarkdownContent(editor.state.doc) };
    return emptiness.isEmpty;
  }

  function readSnapshot(): MarkdownEditorSnapshot {
    const { selection, doc } = editor.state;
    const headingLevel = editor.getAttributes("heading").level;
    const href = editor.getAttributes("link").href;
    const link = typeof href === "string" ? href : "";
    return {
      marks: {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
      },
      blocks: {
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        taskList: editor.isActive("taskList"),
        blockquote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
      },
      heading: editor.isActive("heading") ? (markdownHeadingLevels.find((level) => level === headingLevel) ?? null) : null,
      link: editor.isActive("link") ? link : null,
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
      focused: editor.isFocused,
      formattable:
        !(selection instanceof NodeSelection) &&
        !selection.empty &&
        doc.textBetween(selection.from, selection.to).trim() !== "" &&
        !editor.isActive("codeBlock"),
      inlineOnly: editor.isActive("tableCell") || editor.isActive("tableHeader"),
      isEmpty: isEmpty(),
      sourceRequired,
    };
  }

  return {
    element: editor.view.dom,
    sourceView: "textarea",
    subscribe(listener) {
      listeners.add(listener);
      editor.on("transaction", listener);
      return () => {
        listeners.delete(listener);
        editor.off("transaction", listener);
      };
    },
    getSnapshot() {
      const { state, isEditable: editable } = editor;
      if (cache?.state === state && cache.editable === editable && cache.sourceRequired === sourceRequired) return cache.snapshot;
      cache = { state, editable, sourceRequired, snapshot: readSnapshot() };
      return cache.snapshot;
    },
    onChange(listener) {
      const handleUpdate = () => {
        const next = serializeContent();
        if (next === markdown) return;
        markdown = next;
        sourceRequired = requiresMarkdownSource(markdown, codec, isUrlAllowed);
        listener(markdown);
      };
      editor.on("update", handleUpdate);
      return () => {
        editor.off("update", handleUpdate);
      };
    },
    getMarkdown: () => markdown,
    setMarkdown(next) {
      if (next === markdown || editor.isDestroyed) return;
      markdown = next;
      sourceRequired = requiresMarkdownSource(next, codec, isUrlAllowed);
      if (sourceRequired) return notify();
      editor.commands.setContent(next, { contentType: "markdown", emitUpdate: false });
      editor.view.updateState(EditorState.create({ schema: editor.schema, doc: editor.state.doc, plugins: editor.state.plugins }));
      editor.view.dispatch(editor.state.tr);
    },
    setEditable(editable) {
      if (editor.isDestroyed || editor.isEditable === editable) return;
      editor.setEditable(editable, false);
      notify();
    },
    focus: () => {
      editor.commands.focus();
    },
    undo: () => run((chain) => chain.undo()),
    redo: () => run((chain) => chain.redo()),
    toggleMark: (mark) => run(markCommands[mark]),
    toggleBlock: (block) => run(blockCommands[block]),
    setHeading: (level) => run((chain) => (level ? chain.setHeading({ level }) : chain.setParagraph())),
    setLink: (target) =>
      run((chain) => (target ? chain.extendMarkRange("link").setLink({ href: target }) : chain.extendMarkRange("link").unsetLink())),
    insertImage: (image) => run((chain) => chain.setImage(image)),
    selectionRect() {
      const { from, to } = editor.state.selection;
      return editor.isDestroyed ? null : posToDOMRect(editor.view, from, to);
    },
    textBeforeCaret() {
      const { selection } = editor.state;
      const { $from } = selection;
      if (
        !editor.isFocused ||
        !selection.empty ||
        !$from.parent.isTextblock ||
        $from.parent.type.spec.code ||
        editor.isActive("code") ||
        editor.isActive("link")
      )
        return null;
      return { text: $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc"), from: $from.start(), to: $from.pos };
    },
    caretRect: () => (editor.isDestroyed ? null : rectAt(editor.view, editor.state.selection.from)),
    replaceWithBlock: (range, block) => run((chain) => replacementCommand(block)(chain.deleteRange(range))),
    replaceWithMention: (range, mention) =>
      run((chain) =>
        chain.insertContentAt(range, [
          { type: "text", text: `@${mention.label}`, marks: [{ type: "link", attrs: { href: mention.href } }] },
          { type: "text", text: " " },
        ]),
      ),
    positionAt: (point) => editor.view.posAtCoords({ left: point.x, top: point.y })?.pos ?? null,
    uploads: createRichUploads(editor),
    blocks: createRichBlocks(editor),
    tables: createRichTables(editor),
  };
}
