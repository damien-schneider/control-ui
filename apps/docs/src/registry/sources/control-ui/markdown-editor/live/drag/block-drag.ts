import { isolateHistory } from "@codemirror/commands";
import { type EditorState, type Extension, StateEffect, StateField, type Text } from "@codemirror/state";
import { Decoration, EditorView, layer, RectangleMarker, ViewPlugin } from "@codemirror/view";
import { createDragPreview, type DragPreview } from "../../drag/drag-preview";
import type { MarkdownBlocks } from "../../engine";
import { type BlockMove, blockAt, blockStartingAt, dropBlock, type MarkdownBlockUnit, moveBlock, siblingBlocks } from "./block-model";

type BlockDrag = { unit: MarkdownBlockUnit | null; gap: number | null };

const liftBlock = StateEffect.define<MarkdownBlockUnit | null>();
const aimGap = StateEffect.define<number | null>();
const blockMime = "application/x-control-ui-markdown-block";
const lifted = Decoration.line({ class: "cm-md-lifted" });

const blockDrag = StateField.define<BlockDrag>({
  create: () => ({ unit: null, gap: null }),
  update(value, transaction) {
    let next = value;
    if (next.unit && transaction.docChanged) {
      next = { ...next, unit: { from: transaction.changes.mapPos(next.unit.from), to: transaction.changes.mapPos(next.unit.to, -1) } };
    }
    for (const effect of transaction.effects) {
      if (effect.is(liftBlock)) next = { unit: effect.value, gap: null };
      else if (effect.is(aimGap)) next = { ...next, gap: effect.value };
    }
    return next;
  },
  provide: (field) =>
    EditorView.decorations.compute([field], (state) => {
      const { unit } = state.field(field);
      return unit ? Decoration.set(linesOf(state.doc, unit).map((line) => lifted.range(line))) : Decoration.none;
    }),
});

function linesOf(doc: Text, unit: MarkdownBlockUnit) {
  const starts: number[] = [];
  for (let number = doc.lineAt(unit.from).number; number <= doc.lineAt(unit.to).number; number++) starts.push(doc.line(number).from);
  return starts;
}

function blockBox(view: EditorView, unit: MarkdownBlockUnit) {
  return { top: view.documentTop + view.lineBlockAt(unit.from).top, bottom: view.documentTop + view.lineBlockAt(unit.to).bottom };
}

function gapLines(view: EditorView, siblings: readonly MarkdownBlockUnit[]) {
  const boxes = siblings.map((sibling) => blockBox(view, sibling));
  return boxes.map((box, index) => (index === 0 ? box.top : (boxes[index - 1].bottom + box.top) / 2)).concat(boxes.at(-1)?.bottom ?? 0);
}

function nearestGap(view: EditorView, unit: MarkdownBlockUnit, clientY: number) {
  const lines = gapLines(view, siblingBlocks(view.state, unit));
  let gap = 0;
  for (let index = 1; index < lines.length; index++) {
    if (Math.abs(clientY - lines[index]) < Math.abs(clientY - lines[gap])) gap = index;
  }
  return lines.length > 0 ? gap : null;
}

const dropLine = layer({
  above: true,
  class: "cm-md-drop-layer",
  markers(view) {
    const { unit, gap } = view.state.field(blockDrag);
    if (!unit || gap === null) return [];
    const siblings = siblingBlocks(view.state, unit);
    const y = gapLines(view, siblings)[gap];
    const first = siblings[0];
    if (y === undefined || !first) return [];
    const scroller = view.scrollDOM.getBoundingClientRect();
    const content = view.contentDOM.getBoundingClientRect();
    const start = view.coordsAtPos(first.from)?.left ?? content.left;
    const end = content.right - Number.parseFloat(getComputedStyle(view.contentDOM).paddingInlineEnd);
    const left = start - scroller.left + view.scrollDOM.scrollLeft;
    const top = y - scroller.top + view.scrollDOM.scrollTop - 1;
    return [new RectangleMarker("cm-md-drop-line", left, top, Math.max(0, end - start), 2)];
  },
  update: (update) => update.startState.field(blockDrag) !== update.state.field(blockDrag) || update.geometryChanged,
});

function dispatchMove(view: EditorView, move: BlockMove, effects: StateEffect<unknown>[] = []) {
  view.dispatch({
    changes: move.changes,
    selection: move.selection,
    effects,
    annotations: isolateHistory.of("full"),
    scrollIntoView: true,
    userEvent: "move.block",
  });
}

function aimAt(view: EditorView, event: DragEvent) {
  const { unit, gap } = view.state.field(blockDrag);
  if (!unit) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  const next = nearestGap(view, unit, event.clientY);
  if (next !== gap) view.dispatch({ effects: aimGap.of(next) });
}

function leave(view: EditorView, event: DragEvent) {
  const { unit, gap } = view.state.field(blockDrag);
  if (!unit || gap === null || (event.relatedTarget instanceof Node && view.contentDOM.contains(event.relatedTarget))) return;
  view.dispatch({ effects: aimGap.of(null) });
}

function drop(view: EditorView, event: DragEvent) {
  const { unit, gap } = view.state.field(blockDrag);
  if (!unit) return;
  event.preventDefault();
  event.stopPropagation();
  const block = blockStartingAt(view.state, unit.from);
  const move = block && gap !== null ? dropBlock(view.state, block, gap) : null;
  if (move) dispatchMove(view, move, [liftBlock.of(null)]);
  else view.dispatch({ effects: liftBlock.of(null) });
  view.focus();
}

/** Captures block drags before CodeMirror or a table cell editor can treat them as text drops. */
const dropTarget = ViewPlugin.define((view) => {
  const dom = view.contentDOM;
  const over = (event: DragEvent) => aimAt(view, event);
  const out = (event: DragEvent) => leave(view, event);
  const land = (event: DragEvent) => drop(view, event);
  dom.addEventListener("dragover", over, true);
  dom.addEventListener("dragleave", out, true);
  dom.addEventListener("drop", land, true);
  return {
    destroy() {
      dom.removeEventListener("dragover", over, true);
      dom.removeEventListener("dragleave", out, true);
      dom.removeEventListener("drop", land, true);
    },
  };
});

export const blockDragging: Extension = [blockDrag, dropLine, dropTarget];

type PreparedDrag = { unit: MarkdownBlockUnit; document: Text; text: string; preview: DragPreview | null };

function lineElements(view: EditorView, unit: MarkdownBlockUnit) {
  const elements = new Set<HTMLElement>();
  for (const start of linesOf(view.state.doc, unit)) {
    const { node } = view.domAtPos(start);
    const element = node instanceof Element ? node : node.parentElement;
    const line = element?.closest(".cm-line");
    if (line instanceof HTMLElement) elements.add(line);
  }
  return Array.from(elements);
}

function prepare(view: EditorView, block: number): PreparedDrag | null {
  const unit = blockStartingAt(view.state, block);
  if (!unit) return null;
  return {
    unit,
    document: view.state.doc,
    text: view.state.sliceDoc(unit.from, unit.to),
    preview: createDragPreview(lineElements(view, unit), "cm-content"),
  };
}

function rectOf(view: EditorView, state: EditorState, block: number) {
  const unit = blockStartingAt(state, block);
  if (!unit) return null;
  const { top, bottom } = blockBox(view, unit);
  const content = view.contentDOM.getBoundingClientRect();
  return new DOMRect(content.left, top, content.width, bottom - top);
}

export function createLiveBlocks(view: EditorView): MarkdownBlocks {
  let prepared: PreparedDrag | null = null;
  return {
    at(point) {
      const position = view.posAtCoords(point, false);
      return blockAt(view.state, position)?.from ?? null;
    },
    atSelection: () => blockAt(view.state, view.state.selection.main.head)?.from ?? null,
    rect: (block) => rectOf(view, view.state, block),
    select(block) {
      const unit = blockStartingAt(view.state, block);
      if (unit) view.dispatch({ selection: { anchor: unit.from, head: unit.to } });
    },
    move(block, direction) {
      const unit = blockStartingAt(view.state, block);
      const move = unit ? moveBlock(view.state, unit, direction) : null;
      if (!move) return null;
      dispatchMove(view, move);
      return move.selection.anchor;
    },
    prepareDrag(block) {
      prepared = prepare(view, block);
    },
    startDrag(block, transfer) {
      const payload = prepared?.unit.from === block && prepared.document === view.state.doc ? prepared : prepare(view, block);
      prepared = null;
      if (!payload) return null;
      transfer.clearData();
      transfer.setData("text/plain", payload.text);
      transfer.setData(blockMime, "");
      transfer.effectAllowed = "copyMove";
      const origin = rectOf(view, view.state, block) ?? new DOMRect();
      view.dispatch({ effects: liftBlock.of(payload.unit) });
      return { preview: payload.preview, origin };
    },
    endDrag() {
      prepared = null;
      if (view.state.field(blockDrag, false)?.unit) view.dispatch({ effects: liftBlock.of(null) });
    },
  };
}
