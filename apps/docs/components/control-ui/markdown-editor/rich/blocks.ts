import type { Editor } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import type { Node as ProseMirrorNode, ResolvedPos, Slice } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import { createDragPreview, type DragPreview } from "../drag/drag-preview";
import type { MarkdownBlocks } from "../engine";

/** A list is not one block to its reader: the deepest list item is the unit you grab, anything else is its top-level block. */
function draggableBlockStart($pos: ResolvedPos): number {
  for (let depth = $pos.depth; depth > 1; depth--) {
    if ($pos.node(depth - 1).type.isInGroup("list")) return $pos.before(depth);
  }
  return $pos.depth > 0 ? $pos.before(1) : $pos.pos;
}

type PreparedDrag = {
  position: number;
  document: ProseMirrorNode;
  selection: NodeSelection;
  html: string;
  text: string;
  slice: Slice;
  source: HTMLElement | null;
  preview: DragPreview | null;
};

function prepare(editor: Editor, position: number): PreparedDrag | null {
  const { view, state } = editor;
  if (!state.doc.nodeAt(position)) return null;
  const selection = NodeSelection.create(state.doc, position);
  const node = view.nodeDOM(position);
  const source = node instanceof HTMLElement ? node : null;
  const { dom, text, slice } = view.serializeForClipboard(selection.content());
  return {
    position,
    document: state.doc,
    selection,
    html: dom.innerHTML,
    text,
    slice,
    source,
    preview: source ? createDragPreview([source], "tiptap") : null,
  };
}

export function createRichBlocks(editor: Editor): MarkdownBlocks {
  let prepared: PreparedDrag | null = null;
  const blockElement = (block: number) => {
    const node = editor.view.nodeDOM(block);
    return node instanceof HTMLElement ? node : null;
  };
  return {
    at(point) {
      const hit = editor.view.posAtCoords({ left: point.x, top: point.y });
      return hit ? draggableBlockStart(editor.state.doc.resolve(hit.pos)) : null;
    },
    atSelection: () => draggableBlockStart(editor.state.selection.$from),
    rect: (block) => blockElement(block)?.getBoundingClientRect() ?? null,
    select: (block) => {
      editor.commands.setNodeSelection(block);
    },
    move(block, direction) {
      const { doc, tr } = editor.state;
      const node = doc.nodeAt(block);
      const adjacent = node && (direction === -1 ? doc.resolve(block).nodeBefore : doc.nodeAt(block + node.nodeSize));
      if (!(node && adjacent)) return null;
      const target = direction === -1 ? block - adjacent.nodeSize : block + adjacent.nodeSize;
      tr.delete(block, block + node.nodeSize).insert(target, node);
      tr.setSelection(NodeSelection.create(tr.doc, target));
      editor.view.dispatch(closeHistory(tr).scrollIntoView());
      return target;
    },
    prepareDrag(block) {
      prepared = prepare(editor, block);
    },
    startDrag(block, transfer) {
      const payload = prepared?.position === block && prepared.document === editor.state.doc ? prepared : prepare(editor, block);
      prepared = null;
      if (!payload) return null;
      const { view } = editor;
      view.dispatch(view.state.tr.setSelection(payload.selection));
      transfer.clearData();
      transfer.setData("text/html", payload.html);
      transfer.setData("text/plain", payload.text);
      transfer.effectAllowed = "copyMove";
      view.dragging = { slice: payload.slice, move: true };
      return { preview: payload.preview, origin: payload.source?.getBoundingClientRect() ?? new DOMRect() };
    },
    endDrag() {
      prepared = null;
      if (!editor.isDestroyed) editor.view.dragging = null;
    },
  };
}
