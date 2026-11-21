import type { MarkdownTableAxis, MarkdownTableTarget } from "../engine";

export type SurfaceBox = { top: number; left: number; width: number; height: number };
export type TableLayout = { table: SurfaceBox; clip: SurfaceBox; row: SurfaceBox; column: SurfaceBox };

/** The header row stays first: rows below it move, the header itself never does. */
export const firstMovable = (axis: MarkdownTableAxis) => (axis === "row" ? 1 : 0);

export function canMoveLine(count: number, axis: MarkdownTableAxis, from: number, to: number) {
  return from !== to && from >= firstMovable(axis) && to >= firstMovable(axis) && to < count;
}

export function tableSize(table: HTMLTableElement) {
  return { rows: table.rows.length, columns: table.rows[0]?.cells.length ?? 0 };
}

export function tableTargetAt(root: HTMLElement, node: EventTarget | null): MarkdownTableTarget | null {
  const cell = node instanceof Element ? node.closest("td, th") : null;
  const row = cell?.parentElement;
  const table = cell?.closest("table");
  if (!(cell instanceof HTMLTableCellElement && row instanceof HTMLTableRowElement && table && root.contains(table))) return null;
  return { table, row: row.rowIndex, column: cell.cellIndex };
}

export function measureTable(surface: HTMLElement, target: MarkdownTableTarget): TableLayout | null {
  const { table } = target;
  const row = table.rows[target.row];
  const head = table.rows[0]?.cells[target.column];
  if (!(table.isConnected && row && head)) return null;
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

function edges(table: HTMLTableElement, axis: MarkdownTableAxis) {
  if (axis === "row") {
    const rows = Array.from(table.rows, (row) => row.getBoundingClientRect());
    return [...rows.map((rect) => rect.top), rows.at(-1)?.bottom ?? 0];
  }
  const cells = Array.from(table.rows[0]?.cells ?? [], (cell) => cell.getBoundingClientRect());
  return [...cells.map((rect) => rect.left), cells.at(-1)?.right ?? 0];
}

/** The gap a dragged row or column would land in; the header row's slot above it is never offered. */
export function nearestGap(table: HTMLTableElement, axis: MarkdownTableAxis, client: number) {
  const lines = edges(table, axis);
  const first = firstMovable(axis);
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

export function toSurface(surface: HTMLElement, axis: MarkdownTableAxis, client: number) {
  const origin = surface.getBoundingClientRect();
  return axis === "row" ? client - origin.top + surface.scrollTop : client - origin.left + surface.scrollLeft;
}
