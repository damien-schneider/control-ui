import type { ChainedCommands, Editor } from "@tiptap/core";
import { CellSelection, moveTableColumn, moveTableRow } from "@tiptap/pm/tables";
import { cellStart, type TableAxis, tableAt } from "./table-geometry";

export type ColumnAlign = "left" | "center" | "right";

/** The header row stays first: rows below it move, the header itself never does. */
export const firstMovable = (axis: TableAxis) => (axis === "row" ? 1 : 0);

export function lineCount(editor: Editor, tablePos: number, axis: TableAxis) {
  const found = tableAt(editor.state.doc, tablePos);
  if (!found) return 0;
  return axis === "row" ? found.map.height : found.map.width;
}

export function canMoveLine(count: number, axis: TableAxis, from: number, to: number) {
  return from !== to && from >= firstMovable(axis) && to >= firstMovable(axis) && to < count;
}

function lineStart(editor: Editor, tablePos: number, axis: TableAxis, index: number) {
  return axis === "row" ? cellStart(editor.state.doc, tablePos, index, 0) : cellStart(editor.state.doc, tablePos, 0, index);
}

export function selectLine(editor: Editor, tablePos: number, axis: TableAxis, index: number) {
  const position = lineStart(editor, tablePos, axis, index);
  if (position === null) return;
  const $cell = editor.state.doc.resolve(position);
  editor.view.dispatch(
    editor.state.tr.setSelection(axis === "row" ? CellSelection.rowSelection($cell) : CellSelection.colSelection($cell)),
  );
}

export function moveLine(editor: Editor, tablePos: number, axis: TableAxis, from: number, to: number) {
  const inside = cellStart(editor.state.doc, tablePos, 0, 0);
  if (inside === null || !canMoveLine(lineCount(editor, tablePos, axis), axis, from, to)) return false;
  const command = axis === "row" ? moveTableRow : moveTableColumn;
  return command({ from, to, pos: inside + 1, select: true })(editor.state, editor.view.dispatch);
}

export function runInCell(
  editor: Editor,
  tablePos: number,
  row: number,
  column: number,
  apply: (chain: ChainedCommands) => ChainedCommands,
) {
  const position = cellStart(editor.state.doc, tablePos, row, column);
  if (position === null) return;
  apply(
    editor
      .chain()
      .focus()
      .setTextSelection(position + 2),
  ).run();
}

export function alignColumn(editor: Editor, tablePos: number, column: number, align: ColumnAlign) {
  const position = cellStart(editor.state.doc, tablePos, 0, column);
  if (position === null) return;
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setSelection(CellSelection.colSelection(tr.doc.resolve(position)));
      return true;
    })
    .setCellAttribute("align", align)
    .run();
}
