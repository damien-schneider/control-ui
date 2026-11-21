import { isolateHistory } from "@codemirror/commands";
import { Annotation, type ChangeSpec, EditorSelection, type TransactionSpec } from "@codemirror/state";
import { type EditorView, WidgetType } from "@codemirror/view";
import type { MarkdownTableAxis } from "../../engine";
import { type CellEdit, CellEditor, type CellHost, type CellMove } from "./cell-editor";
import { appendRow, cellAt, type MarkdownTableModel, parseTable, type TableEdit } from "./table-model";

export type TableLine = { axis: MarkdownTableAxis; index: number };
export type TableCellAddress = { row: number; column: number };

/** Marks outer transactions that a cell editor made, so they never bounce back into it. */
export const fromCell = Annotation.define<true>();

const tablesByView = new WeakMap<EditorView, Set<TableView>>();
const tablesByDom = new WeakMap<HTMLElement, TableView>();

export function renderedTables(outer: EditorView): ReadonlySet<TableView> {
  return tablesByView.get(outer) ?? new Set();
}

export function tableViewOf(element: HTMLElement): TableView | null {
  return tablesByDom.get(element) ?? null;
}

function neighbour(move: CellMove, at: TableCellAddress, last: TableCellAddress): TableCellAddress | null {
  const { row, column } = at;
  if (move === "up") return row > 0 ? { row: row - 1, column } : null;
  if (move === "down" || move === "below") return row < last.row ? { row: row + 1, column } : null;
  if (move === "next" || move === "right") {
    if (column < last.column) return { row, column: column + 1 };
    return row < last.row ? { row: row + 1, column: 0 } : null;
  }
  if (column > 0) return { row, column: column - 1 };
  return row > 0 ? { row: row - 1, column: last.column } : null;
}

/** Leaving a table at the document's edge opens a paragraph there, so text can always be written around it. */
function exitBefore(model: MarkdownTableModel): TransactionSpec {
  if (model.from > 0) return { selection: EditorSelection.cursor(model.from - 1) };
  return { changes: { from: 0, insert: "\n\n" }, selection: EditorSelection.cursor(0) };
}

function exitAfter(model: MarkdownTableModel, length: number): TransactionSpec {
  if (model.to < length) return { selection: EditorSelection.cursor(model.to + 1) };
  return { changes: { from: model.to, insert: "\n\n" }, selection: EditorSelection.cursor(model.to + 2) };
}

let renderedTableCount = 0;

export class TableView implements CellHost {
  readonly dom = document.createElement("div");
  readonly table = document.createElement("table");
  private readonly head = this.table.createTHead();
  private readonly body = this.table.createTBody();
  private readonly editors = new Map<HTMLTableCellElement, CellEditor>();
  private text = "";
  private editable = true;
  private readonly id = `cm-md-table-${++renderedTableCount}`;

  constructor(readonly outer: EditorView) {
    this.dom.className = "cm-md-table";
    this.dom.append(this.table);
    this.table.addEventListener("mousedown", this.focusFromPadding);
    tablesByDom.set(this.dom, this);
    tablesByDom.set(this.table, this);
    const tables = tablesByView.get(outer) ?? new Set();
    tables.add(this);
    tablesByView.set(outer, tables);
  }

  /** The table's document range; read it outside view updates only. */
  range() {
    if (!this.dom.isConnected) return null;
    const from = this.outer.posAtDOM(this.dom);
    return { from, to: from + this.text.length };
  }

  model(): MarkdownTableModel | null {
    const range = this.range();
    return range && parseTable(this.outer.state.sliceDoc(range.from, range.to), range.from);
  }

  render(text: string, editable: boolean, line: TableLine | null) {
    this.text = text;
    this.editable = editable;
    const model = parseTable(text);
    if (!model) return;
    this.resize(model.rows.length, model.columns);
    for (const [rowIndex, row] of model.rows.entries()) {
      for (let column = 0; column < model.columns; column++) {
        const element = this.cellElement(rowIndex, column);
        if (!element) continue;
        const selected = line !== null && (line.axis === "row" ? line.index === rowIndex : line.index === column);
        element.classList.toggle("selectedCell", selected);
        element.style.textAlign = model.aligns[column] ?? "";
        this.renderCell(element, rowIndex, column, row.cells[column]?.text ?? null);
      }
    }
    queueMicrotask(this.followSelection);
  }

  private renderCell(element: HTMLTableCellElement, row: number, column: number, text: string | null) {
    const editor = this.editors.get(element);
    if (text === null) {
      editor?.destroy();
      this.editors.delete(element);
      element.dataset.missing = "";
      return;
    }
    delete element.dataset.missing;
    if (!editor) {
      this.editors.set(element, new CellEditor(this, element, row, column, text, this.editable));
      return;
    }
    editor.row = row;
    editor.column = column;
    editor.sync(text);
    editor.setEditable(this.editable);
  }

  private resize(rows: number, columns: number) {
    const head = this.head.rows[0] ?? this.head.insertRow();
    while (this.body.rows.length > rows - 1) this.removeRow(this.body.rows[this.body.rows.length - 1]);
    while (this.body.rows.length < rows - 1) this.body.insertRow();
    for (const row of [head, ...Array.from(this.body.rows)]) {
      while (row.cells.length > columns) this.removeCell(row.cells[row.cells.length - 1]);
      while (row.cells.length < columns) row.append(this.createCell(row === head, row.cells.length));
    }
  }

  private removeRow(row: HTMLTableRowElement) {
    for (const cell of Array.from(row.cells)) this.removeCell(cell);
    row.remove();
  }

  private removeCell(cell: HTMLTableCellElement) {
    this.editors.get(cell)?.destroy();
    this.editors.delete(cell);
    cell.remove();
  }

  private createCell(header: boolean, column: number) {
    const cell = document.createElement(header ? "th" : "td");
    if (header) cell.id = this.columnHeaderId(column);
    return cell;
  }

  columnHeaderId(column: number) {
    return `${this.id}-column-${column}`;
  }

  private cellElement(row: number, column: number): HTMLTableCellElement | null {
    return this.table.rows[row]?.cells[column] ?? null;
  }

  activeCell(): (TableCellAddress & { editor: CellEditor }) | null {
    for (const editor of this.editors.values()) {
      if (editor.view.hasFocus) return { row: editor.row, column: editor.column, editor };
    }
    return null;
  }

  focusCell(row: number, column: number, at: "start" | "end" | number = "end") {
    const element = this.cellElement(row, column);
    const editor = element && this.editors.get(element);
    if (!editor) return false;
    editor.focus(at);
    return true;
  }

  focusAt(pos: number) {
    const model = this.model();
    const address = model && cellAt(model, pos);
    const cell = address && model.rows[address.row]?.cells[address.column];
    if (!(address && cell)) return false;
    return this.focusCell(address.row, address.column, Math.max(0, Math.min(cell.to, pos) - cell.from));
  }

  columnAt(x: number) {
    const cells = Array.from(this.table.rows[0]?.cells ?? []);
    const index = cells.findIndex((cell) => x < cell.getBoundingClientRect().right);
    return index < 0 ? Math.max(0, cells.length - 1) : index;
  }

  /** After the outer document changed, a focused cell takes the outer selection when that selection lies in this table. */
  private followSelection = () => {
    const active = this.activeCell();
    const model = active ? this.model() : null;
    if (!(active && model)) return;
    const { anchor, head } = this.outer.state.selection.main;
    if (head < model.from || head > model.to) return;
    const address = cellAt(model, head);
    const cell = address && model.rows[address.row]?.cells[address.column];
    if (!(address && cell)) return;
    if (address.row !== active.row || address.column !== active.column) {
      this.focusCell(address.row, address.column, head - cell.from);
      return;
    }
    const clamp = (pos: number) => Math.max(cell.from, Math.min(cell.to, pos)) - cell.from;
    active.editor.select(clamp(anchor), clamp(head));
  };

  /** Applies a table edit as one undo step, then puts the caret in the cell it names. */
  apply(edit: TableEdit | null, focus: TableCellAddress | null = edit?.focus ?? null) {
    if (!edit) return false;
    this.outer.dispatch({ changes: edit.changes, annotations: isolateHistory.of("full"), userEvent: "input.table" });
    if (focus) this.focusCell(focus.row, focus.column);
    return true;
  }

  forward(cell: CellEditor, edit: CellEdit) {
    const target = this.model()?.rows[cell.row]?.cells[cell.column];
    if (!target) return;
    if (edit.changes.length !== target.to - target.from) {
      cell.sync(target.text);
      return;
    }
    const changes: ChangeSpec[] = [];
    edit.changes.iterChanges((from, to, _fromB, _toB, inserted) => {
      changes.push({ from: target.from + from, to: target.from + to, insert: inserted.toString() });
    });
    this.outer.dispatch({
      changes,
      selection: EditorSelection.single(target.from + edit.selection.anchor, target.from + edit.selection.head),
      annotations: fromCell.of(true),
      userEvent: edit.userEvent,
    });
  }

  navigate(cell: CellEditor, move: CellMove) {
    const model = this.model();
    if (!model) return false;
    const at = { row: cell.row, column: cell.column };
    const target = neighbour(move, at, { row: model.rows.length - 1, column: model.columns - 1 });
    if (target) return this.focusCell(target.row, target.column, move === "down" || move === "right" ? "start" : "end");
    if (move === "next") return this.apply(appendRow(model), { row: model.rows.length, column: 0 });
    if (move === "below") return this.apply(appendRow(model), { row: model.rows.length, column: at.column });
    if (move === "previous") return true;
    return this.exit(model, move === "up" || move === "left" ? -1 : 1);
  }

  private exit(model: MarkdownTableModel, direction: -1 | 1) {
    const exit = direction < 0 ? exitBefore(model) : exitAfter(model, this.outer.state.doc.length);
    this.outer.dispatch({ ...exit, scrollIntoView: true });
    this.outer.focus();
    return true;
  }

  private focusFromPadding = (event: MouseEvent) => {
    const cell = event.target instanceof HTMLTableCellElement ? event.target : null;
    const editor = cell && this.editors.get(cell);
    if (!editor) return;
    event.preventDefault();
    editor.focus("end");
  };

  destroy() {
    for (const editor of this.editors.values()) editor.destroy();
    this.editors.clear();
    tablesByView.get(this.outer)?.delete(this);
  }
}

export class TableWidget extends WidgetType {
  constructor(
    readonly text: string,
    readonly writable: boolean,
    readonly line: TableLine | null,
  ) {
    super();
  }

  eq(other: TableWidget) {
    return (
      other.text === this.text &&
      other.writable === this.writable &&
      other.line?.axis === this.line?.axis &&
      other.line?.index === this.line?.index
    );
  }

  toDOM(view: EditorView) {
    const table = new TableView(view);
    table.render(this.text, this.writable, this.line);
    return table.dom;
  }

  updateDOM(dom: HTMLElement, view: EditorView) {
    const table = tableViewOf(dom);
    if (table?.outer !== view) return false;
    table.render(this.text, this.writable, this.line);
    return true;
  }

  destroy(dom: HTMLElement) {
    tableViewOf(dom)?.destroy();
  }
}
