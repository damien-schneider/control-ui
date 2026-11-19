import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import { cellAround, TableMap } from "@tiptap/pm/tables";
import type { EditorView } from "@tiptap/pm/view";

export type TableAxis = "row" | "column";
export type TableTarget = { tablePos: number; row: number; column: number };
export type SurfaceBox = { top: number; left: number; width: number; height: number };
export type TableLayout = { table: SurfaceBox; clip: SurfaceBox; row: SurfaceBox; column: SurfaceBox };

export function tableTargetFrom($pos: ResolvedPos): TableTarget | null {
  const $cell = cellAround($pos);
  if (!$cell) return null;
  const tableStart = $cell.start(-1);
  const { left, top } = TableMap.get($cell.node(-1)).findCell($cell.pos - tableStart);
  return { tablePos: tableStart - 1, row: top, column: left };
}

export function tableTargetAt(view: EditorView, element: EventTarget | null): TableTarget | null {
  const cell = element instanceof Element ? element.closest("td, th") : null;
  if (!(cell && view.dom.contains(cell))) return null;
  return tableTargetFrom(view.state.doc.resolve(view.posAtDOM(cell, 0)));
}

export function tableAt(doc: ProseMirrorNode, tablePos: number) {
  const table = doc.nodeAt(tablePos);
  if (table?.type.spec.tableRole !== "table") return null;
  return { table, map: TableMap.get(table), tableStart: tablePos + 1 };
}

export function cellStart(doc: ProseMirrorNode, tablePos: number, row: number, column: number) {
  const found = tableAt(doc, tablePos);
  if (!found) return null;
  return found.tableStart + found.map.positionAt(row, column, found.table);
}

export function tableElement(view: EditorView, tablePos: number) {
  const wrapper = view.nodeDOM(tablePos);
  if (!(wrapper instanceof HTMLElement)) return null;
  const table = wrapper instanceof HTMLTableElement ? wrapper : wrapper.firstElementChild;
  return table instanceof HTMLTableElement ? table : null;
}

export function measureTable(surface: HTMLElement, table: HTMLTableElement, target: TableTarget): TableLayout | null {
  const row = table.rows[target.row];
  const head = table.rows[0]?.cells[target.column];
  if (!(row && head)) return null;
  const origin = surface.getBoundingClientRect();
  const box = (rect: DOMRect): SurfaceBox => ({
    top: rect.top - origin.top + surface.scrollTop,
    left: rect.left - origin.left + surface.scrollLeft,
    width: rect.width,
    height: rect.height,
  });
  return {
    table: box(table.getBoundingClientRect()),
    clip: box((table.parentElement ?? table).getBoundingClientRect()),
    row: box(row.getBoundingClientRect()),
    column: box(head.getBoundingClientRect()),
  };
}

function edges(table: HTMLTableElement, axis: TableAxis) {
  if (axis === "row") {
    const rows = Array.from(table.rows, (row) => row.getBoundingClientRect());
    return [...rows.map((rect) => rect.top), rows.at(-1)?.bottom ?? 0];
  }
  const cells = Array.from(table.rows[0]?.cells ?? [], (cell) => cell.getBoundingClientRect());
  return [...cells.map((rect) => rect.left), cells.at(-1)?.right ?? 0];
}

/** The gap a dragged row or column would land in; the header row's slot above it is never offered. */
export function nearestGap(table: HTMLTableElement, axis: TableAxis, client: number) {
  const lines = edges(table, axis);
  const first = axis === "row" ? 1 : 0;
  let gap = first;
  for (let index = first; index < lines.length; index += 1) {
    if (Math.abs(client - (lines[index] ?? 0)) < Math.abs(client - (lines[gap] ?? 0))) gap = index;
  }
  return { gap, line: lines[gap] ?? 0 };
}

export function indexForGap(from: number, gap: number) {
  return gap > from ? gap - 1 : gap;
}

export function isNear(rect: DOMRect, x: number, y: number, reach: number) {
  return x > rect.left - reach && x < rect.right + reach && y > rect.top - reach && y < rect.bottom + reach;
}

/** Converts a viewport coordinate on `axis` into the scrolled surface's coordinate space. */
export function toSurface(surface: HTMLElement, axis: TableAxis, client: number) {
  const origin = surface.getBoundingClientRect();
  return axis === "row" ? client - origin.top + surface.scrollTop : client - origin.left + surface.scrollLeft;
}
