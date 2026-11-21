import type { ChainedCommands, Editor } from "@tiptap/core";
import type { ResolvedPos } from "@tiptap/pm/model";
import { CellSelection, cellAround, moveTableColumn, moveTableRow, TableMap } from "@tiptap/pm/tables";
import type { MarkdownTableAxis, MarkdownTables } from "../engine";
import { canMoveLine, tableSize } from "../table/table-geometry";

type RichCell = { tablePos: number; row: number; column: number };

function cellFrom($pos: ResolvedPos): RichCell | null {
  const $cell = cellAround($pos);
  if (!$cell) return null;
  const tableStart = $cell.start(-1);
  const { left, top } = TableMap.get($cell.node(-1)).findCell($cell.pos - tableStart);
  return { tablePos: tableStart - 1, row: top, column: left };
}

/** Tables render as `div.tableWrapper > table`, so the element is the node view's first child. */
function tableElementAt(editor: Editor, tablePos: number) {
  const wrapper = editor.view.nodeDOM(tablePos);
  if (wrapper instanceof HTMLTableElement) return wrapper;
  const table = wrapper instanceof HTMLElement ? wrapper.firstElementChild : null;
  return table instanceof HTMLTableElement ? table : null;
}

function tablePosOf(editor: Editor, table: HTMLTableElement) {
  const cell = table.rows[0]?.cells[0];
  if (!(cell && editor.view.dom.contains(cell))) return null;
  return cellFrom(editor.state.doc.resolve(editor.view.posAtDOM(cell, 0)))?.tablePos ?? null;
}

function cellStart(editor: Editor, tablePos: number, row: number, column: number) {
  const table = editor.state.doc.nodeAt(tablePos);
  if (table?.type.spec.tableRole !== "table") return null;
  return tablePos + 1 + TableMap.get(table).positionAt(row, column, table);
}

export function createRichTables(editor: Editor): MarkdownTables {
  function lineStart(tablePos: number, axis: MarkdownTableAxis, index: number) {
    return axis === "row" ? cellStart(editor, tablePos, index, 0) : cellStart(editor, tablePos, 0, index);
  }
  function inLine(table: HTMLTableElement, axis: MarkdownTableAxis, index: number, apply: (chain: ChainedCommands) => ChainedCommands) {
    const tablePos = tablePosOf(editor, table);
    const position = tablePos === null ? null : lineStart(tablePos, axis, index);
    if (position !== null)
      apply(
        editor
          .chain()
          .focus()
          .setTextSelection(position + 2),
      ).run();
  }
  function inLastCell(table: HTMLTableElement, row: number, apply: (chain: ChainedCommands) => ChainedCommands) {
    const tablePos = tablePosOf(editor, table);
    const position = tablePos === null ? null : cellStart(editor, tablePos, row, tableSize(table).columns - 1);
    if (position !== null)
      apply(
        editor
          .chain()
          .focus()
          .setTextSelection(position + 2),
      ).run();
  }
  return {
    caret() {
      const cell = cellFrom(editor.state.selection.$from);
      const table = cell && tableElementAt(editor, cell.tablePos);
      return cell && table ? { table, row: cell.row, column: cell.column } : null;
    },
    select(table, axis, index) {
      const tablePos = tablePosOf(editor, table);
      const position = tablePos === null ? null : lineStart(tablePos, axis, index);
      if (position === null) return;
      const $cell = editor.state.doc.resolve(position);
      editor.view.dispatch(
        editor.state.tr.setSelection(axis === "row" ? CellSelection.rowSelection($cell) : CellSelection.colSelection($cell)),
      );
    },
    move(table, axis, from, to) {
      const tablePos = tablePosOf(editor, table);
      const inside = tablePos === null ? null : cellStart(editor, tablePos, 0, 0);
      const size = tableSize(table);
      if (inside === null || !canMoveLine(axis === "row" ? size.rows : size.columns, axis, from, to)) return false;
      const command = axis === "row" ? moveTableRow : moveTableColumn;
      return command({ from, to, pos: inside + 1, select: true })(editor.state, editor.view.dispatch);
    },
    insert(table, axis, index, side) {
      inLine(table, axis, index, (chain) => {
        if (axis === "row") return side === "before" ? chain.addRowBefore() : chain.addRowAfter();
        return side === "before" ? chain.addColumnBefore() : chain.addColumnAfter();
      });
    },
    remove(table, axis, index) {
      inLine(table, axis, index, (chain) => (axis === "row" ? chain.deleteRow() : chain.deleteColumn()));
    },
    align(table, column, align) {
      const tablePos = tablePosOf(editor, table);
      const position = tablePos === null ? null : cellStart(editor, tablePos, 0, column);
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
    },
    append(table, axis) {
      if (axis === "row") inLastCell(table, tableSize(table).rows - 1, (chain) => chain.addRowAfter().goToNextCell());
      else inLastCell(table, 0, (chain) => chain.addColumnAfter().goToNextCell());
    },
  };
}
