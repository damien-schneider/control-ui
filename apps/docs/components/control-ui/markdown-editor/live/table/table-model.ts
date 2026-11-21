import type { TextChange } from "../format/inline";

export type TableAlign = "left" | "center" | "right" | null;
export type TableCell = { from: number; to: number; text: string };
export type TableRow = { from: number; to: number; text: string; cells: TableCell[] };
export type MarkdownTableModel = {
  from: number;
  to: number;
  rows: TableRow[];
  delimiter: TableRow;
  aligns: TableAlign[];
  columns: number;
};
export type TableEdit = { changes: TextChange[]; focus?: { row: number; column: number } };

type Segment = { start: number; end: number };
type LineLayout = { prefix: string; suffix: string; segments: Segment[] };
type SourceLine = { from: number; text: string };
type SegmentTransform = (segments: string[], filler: string) => string[];

const emptyCell = "  ";
const plainDelimiter = " --- ";
const delimiterCellPattern = /^\s*:?-+:?\s*$/;

function unescapedPipes(text: string): number[] {
  const pipes: number[] = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === "\\") index++;
    else if (char === "|") pipes.push(index);
  }
  return pipes;
}

function layoutLine(text: string): LineLayout {
  const pipes = unescapedPipes(text);
  const firstContent = text.search(/\S/);
  const lastContent = text.trimEnd().length - 1;
  const firstPipe = pipes.length > 0 ? pipes[0] : -1;
  const lastPipe = pipes.length > 0 ? pipes[pipes.length - 1] : -1;
  const leading = firstPipe >= 0 && firstPipe === firstContent ? firstPipe : -1;
  const trailing = lastPipe >= 0 && lastPipe === lastContent && lastPipe !== leading ? lastPipe : -1;
  const start = leading + 1;
  const end = trailing >= 0 ? trailing : text.length;
  const segments: Segment[] = [];
  let segmentStart = start;
  for (const pipe of pipes) {
    if (pipe <= leading || pipe >= end) continue;
    segments.push({ start: segmentStart, end: pipe });
    segmentStart = pipe + 1;
  }
  segments.push({ start: segmentStart, end });
  return { prefix: text.slice(0, start), suffix: text.slice(end), segments };
}

function contentCell(text: string, offset: number, segment: Segment): TableCell {
  const from = segment.start < segment.end && text[segment.start] === " " ? segment.start + 1 : segment.start;
  const to = segment.end - 1 >= from && text[segment.end - 1] === " " ? segment.end - 1 : segment.end;
  return { from: offset + from, to: offset + to, text: text.slice(from, to) };
}

function rawCell(text: string, offset: number, segment: Segment): TableCell {
  return { from: offset + segment.start, to: offset + segment.end, text: text.slice(segment.start, segment.end) };
}

function parseRow(line: SourceLine, cellOf: typeof contentCell): TableRow {
  const cells = layoutLine(line.text).segments.map((segment) => cellOf(line.text, line.from, segment));
  return { from: line.from, to: line.from + line.text.length, text: line.text, cells };
}

function splitLines(text: string, offset: number): SourceLine[] {
  const lines: SourceLine[] = [];
  let from = offset;
  for (const lineText of text.split("\n")) {
    lines.push({ from, text: lineText });
    from += lineText.length + 1;
  }
  return lines;
}

function alignOf(segment: string): TableAlign {
  const marker = segment.trim();
  const left = marker.startsWith(":");
  const right = marker.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return left ? "left" : null;
}

function isDelimiterRow(row: TableRow, columns: number): boolean {
  return (
    unescapedPipes(row.text).length > 0 && row.cells.length === columns && row.cells.every((cell) => delimiterCellPattern.test(cell.text))
  );
}

export function parseTable(text: string, offset = 0): MarkdownTableModel | null {
  const [headerLine, delimiterLine, ...bodyLines] = splitLines(text, offset);
  if (!headerLine || !delimiterLine || unescapedPipes(headerLine.text).length === 0) return null;
  const header = parseRow(headerLine, contentCell);
  const delimiter = parseRow(delimiterLine, rawCell);
  const columns = header.cells.length;
  if (!isDelimiterRow(delimiter, columns)) return null;
  const blankIndex = bodyLines.findIndex((line) => line.text.trim() === "");
  const body = (blankIndex < 0 ? bodyLines : bodyLines.slice(0, blankIndex)).map((line) => parseRow(line, contentCell));
  const rows = [header, ...body];
  const lastLine = body.length > 0 ? body[body.length - 1] : delimiter;
  return { from: header.from, to: lastLine.to, rows, delimiter, aligns: delimiter.cells.map((cell) => alignOf(cell.text)), columns };
}

function columnAt(row: TableRow, pos: number): number {
  const contentIndex = row.cells.findIndex((cell) => pos >= cell.from && pos <= cell.to);
  if (contentIndex >= 0) return contentIndex;
  const segments = layoutLine(row.text).segments;
  const rawIndex = segments.findIndex((segment) => pos >= row.from + segment.start && pos <= row.from + segment.end);
  if (rawIndex >= 0) return rawIndex;
  return pos < row.from + segments[0].start ? 0 : segments.length - 1;
}

export function cellAt(table: MarkdownTableModel, pos: number): { row: number; column: number } | null {
  const rowIndex = table.rows.findIndex((row) => pos >= row.from && pos <= row.to);
  if (rowIndex < 0) return null;
  return { row: rowIndex, column: columnAt(table.rows[rowIndex], pos) };
}

function joinLine(prefix: string, segments: string[], suffix: string): string {
  const first = segments.length > 0 ? segments[0] : "";
  const last = segments.length > 0 ? segments[segments.length - 1] : "";
  const start = prefix === "" && first.trim() === "" ? "|" : prefix;
  const end = suffix === "" && (last.trim() === "" || (start === "" && segments.length < 2)) ? "|" : suffix;
  return `${start}${segments.join("|")}${end}`;
}

function padded(segments: string[], length: number, filler: string): string[] {
  const missing = Math.max(0, length - segments.length);
  return [...segments, ...Array.from({ length: missing }, () => filler)];
}

function rebuildRow(row: TableRow, filler: string, transform: SegmentTransform): TextChange | null {
  const layout = layoutLine(row.text);
  const segments = layout.segments.map((segment) => row.text.slice(segment.start, segment.end));
  const text = joinLine(layout.prefix, transform(segments, filler), layout.suffix);
  return text === row.text ? null : { from: row.from, to: row.to, insert: text };
}

function columnChanges(table: MarkdownTableModel, transform: SegmentTransform): TextChange[] {
  const [header, ...body] = table.rows;
  const lines = [
    rebuildRow(header, emptyCell, transform),
    rebuildRow(table.delimiter, plainDelimiter, transform),
    ...body.map((row) => rebuildRow(row, emptyCell, transform)),
  ];
  return lines.filter((change): change is TextChange => change !== null);
}

function isIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function newRowText(table: MarkdownTableModel): string {
  const header = layoutLine(table.rows[0].text);
  const cells = Array.from({ length: table.columns }, () => emptyCell);
  return joinLine(header.prefix === "" ? "" : "|", cells, header.suffix === "" ? "" : "|");
}

function lineEndOfRow(table: MarkdownTableModel, index: number): number {
  return index === 0 ? table.delimiter.to : table.rows[index].to;
}

export function moveRow(table: MarkdownTableModel, from: number, to: number): TableEdit | null {
  const length = table.rows.length;
  if (from === to || from < 1 || to < 1 || !isIndex(from, length) || !isIndex(to, length)) return null;
  const texts = table.rows.map((row) => row.text);
  texts.splice(to, 0, ...texts.splice(from, 1));
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const insert = texts.slice(low, high + 1).join("\n");
  return { changes: [{ from: table.rows[low].from, to: table.rows[high].to, insert }], focus: { row: to, column: 0 } };
}

export function moveColumn(table: MarkdownTableModel, from: number, to: number): TableEdit | null {
  if (from === to || !isIndex(from, table.columns) || !isIndex(to, table.columns)) return null;
  const changes = columnChanges(table, (segments, filler) => {
    const next = padded(segments, Math.max(from, to) + 1, filler);
    next.splice(to, 0, ...next.splice(from, 1));
    return next;
  });
  return { changes, focus: { row: 0, column: to } };
}

export function insertRow(table: MarkdownTableModel, index: number, side: "before" | "after"): TableEdit | null {
  if (!isIndex(index, table.rows.length)) return null;
  const text = newRowText(table);
  if (side === "after") {
    const at = lineEndOfRow(table, index);
    return { changes: [{ from: at, to: at, insert: `\n${text}` }], focus: { row: index + 1, column: 0 } };
  }
  if (index === 0) return null;
  const at = table.rows[index].from;
  return { changes: [{ from: at, to: at, insert: `${text}\n` }], focus: { row: index, column: 0 } };
}

function insertColumnAt(table: MarkdownTableModel, at: number): TableEdit {
  const changes = columnChanges(table, (segments, filler) => {
    const next = padded(segments, at, filler);
    next.splice(at, 0, filler);
    return next;
  });
  return { changes, focus: { row: 0, column: at } };
}

export function insertColumn(table: MarkdownTableModel, index: number, side: "before" | "after"): TableEdit | null {
  if (!isIndex(index, table.columns)) return null;
  return insertColumnAt(table, side === "before" ? index : index + 1);
}

export function deleteRow(table: MarkdownTableModel, index: number): TableEdit | null {
  if (index < 1 || !isIndex(index, table.rows.length)) return null;
  return { changes: [{ from: lineEndOfRow(table, index - 1), to: table.rows[index].to, insert: "" }] };
}

export function deleteColumn(table: MarkdownTableModel, index: number): TableEdit | null {
  if (table.columns < 2 || !isIndex(index, table.columns)) return null;
  const changes = columnChanges(table, (segments) => {
    if (segments.length <= index) return segments;
    const next = segments.filter((_, column) => column !== index);
    return next.length > 0 ? next : [emptyCell];
  });
  return { changes };
}

function delimiterSegment(align: TableAlign): string {
  if (align === "left") return " :--- ";
  if (align === "center") return " :---: ";
  if (align === "right") return " ---: ";
  return plainDelimiter;
}

export function alignColumn(table: MarkdownTableModel, index: number, align: TableAlign): TableEdit | null {
  if (!isIndex(index, table.columns)) return null;
  const segment = table.delimiter.cells[index];
  const insert = delimiterSegment(align);
  return { changes: segment.text === insert ? [] : [{ from: segment.from, to: segment.to, insert }] };
}

export function appendRow(table: MarkdownTableModel): TableEdit {
  return { changes: [{ from: table.to, to: table.to, insert: `\n${newRowText(table)}` }], focus: { row: table.rows.length, column: 0 } };
}

export function appendColumn(table: MarkdownTableModel): TableEdit {
  return insertColumnAt(table, table.columns);
}

export function createTableMarkdown(columns: number, bodyRows: number): string {
  const count = Math.max(1, Math.floor(columns));
  const line = (segment: string) => `|${Array.from({ length: count }, () => segment).join("|")}|`;
  const body = Array.from({ length: Math.max(0, Math.floor(bodyRows)) }, () => line(emptyCell));
  return [line(emptyCell), line(plainDelimiter), ...body].join("\n");
}

export function escapeCellText(text: string): string {
  return text.replace(/\r\n|\r|\n/g, " ").replace(/\\[\s\S]|\|/g, (match) => (match === "|" ? "\\|" : match));
}
