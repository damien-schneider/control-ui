import { syntaxTree } from "@codemirror/language";
import { type ChangeSpec, EditorSelection, type EditorState, type SelectionRange, type StateCommand } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import type { MarkdownMark } from "../../engine";

export type TextChange = { from: number; to: number; insert: string };
type Span = { from: number; to: number };
type InlineFormat = { node: string; marker: string };

const formats: Record<MarkdownMark, InlineFormat> = {
  bold: { node: "StrongEmphasis", marker: "**" },
  italic: { node: "Emphasis", marker: "*" },
  strike: { node: "Strikethrough", marker: "~~" },
  code: { node: "InlineCode", marker: "`" },
};

/** Quote, list, task and heading markers that open a line before its text. */
export const blockPrefix = /^\s*(?:(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?|>\s?|#{1,6}\s+)*/;
const codeBlockName = /^(?:FencedCode|CodeBlock)$/;
const proseBlockName = /^(?:Paragraph|ATXHeading\d|SetextHeading\d|Task|TableCell)$/;
const sides: readonly (-1 | 1)[] = [1, -1];
const boldItalicRun = 3;

export function enclosingNode(state: EditorState, span: Span, name: string): SyntaxNode | null {
  const tree = syntaxTree(state);
  for (const side of sides) {
    for (let node: SyntaxNode | null = tree.resolveInner(span.from, side); node; node = node.parent) {
      if (node.name === name && node.from <= span.from && node.to >= span.to) return node;
    }
  }
  return null;
}

function closest(node: SyntaxNode, pattern: RegExp): SyntaxNode | null {
  for (let current: SyntaxNode | null = node; current; current = current.parent) {
    if (pattern.test(current.name)) return current;
  }
  return null;
}

export function codeBlockAt(state: EditorState, pos: number): SyntaxNode | null {
  for (const side of sides) {
    const block = closest(syntaxTree(state).resolveInner(pos, side), codeBlockName);
    if (block) return block;
  }
  return null;
}

export function insideCode(state: EditorState, pos: number): boolean {
  if (codeBlockAt(state, pos)) return true;
  const span = enclosingNode(state, { from: pos, to: pos }, "InlineCode");
  return span !== null && span.from < pos && pos < span.to;
}

function holdsProse(state: EditorState, span: Span): boolean {
  const node = syntaxTree(state).resolveInner(span.from, 1);
  if (node.name === "HeaderMark") return false;
  const block = closest(node, proseBlockName);
  return block !== null && span.to <= block.to;
}

function textSegments(state: EditorState, range: SelectionRange): Span[] {
  const segments: Span[] = [];
  for (let pos = range.from; pos <= range.to; ) {
    const line = state.doc.lineAt(pos);
    const prefixEnd = line.from + (blockPrefix.exec(line.text)?.[0].length ?? 0);
    const from = Math.max(range.from, prefixEnd);
    const to = Math.min(range.to, line.to);
    const text = state.sliceDoc(from, to);
    const segment = { from: from + text.length - text.trimStart().length, to: to - (text.length - text.trimEnd().length) };
    if (segment.from < segment.to && holdsProse(state, segment)) segments.push(segment);
    pos = line.to + 1;
  }
  return segments;
}

function formattedAtCaret(state: EditorState, pos: number, format: InlineFormat): SyntaxNode | null {
  const node = enclosingNode(state, { from: pos, to: pos }, format.node);
  if (!node?.firstChild || !node.lastChild) return null;
  return pos >= node.firstChild.to && pos <= node.lastChild.from ? node : null;
}

function rangeIsFormatted(state: EditorState, range: SelectionRange, format: InlineFormat): boolean {
  if (range.empty) return formattedAtCaret(state, range.from, format) !== null;
  const segments = textSegments(state, range);
  return segments.length > 0 && segments.every((segment) => enclosingNode(state, segment, format.node));
}

export function isMarkActive(state: EditorState, mark: MarkdownMark): boolean {
  return state.selection.ranges.every((range) => rangeIsFormatted(state, range, formats[mark]));
}

function markerChanges(node: SyntaxNode): ChangeSpec[] {
  if (!node.firstChild || !node.lastChild) return [];
  return [
    { from: node.from, to: node.firstChild.to },
    { from: node.lastChild.from, to: node.to },
  ];
}

function nodesWithin(state: EditorState, span: Span, name: string): SyntaxNode[] {
  const nodes: SyntaxNode[] = [];
  syntaxTree(state).iterate({
    from: span.from,
    to: span.to,
    enter: (ref) => {
      if (ref.name === name && ref.to > span.from && ref.from < span.to) nodes.push(ref.node);
    },
  });
  return nodes;
}

export function mapInward(state: EditorState, specs: ChangeSpec[], range: SelectionRange) {
  const changes = state.changes(specs);
  const from = changes.mapPos(range.from, 1);
  const to = Math.max(from, changes.mapPos(range.to, -1));
  return { changes, range: range.anchor === range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from) };
}

function markerRuns(state: EditorState, pos: number, char: string) {
  const line = state.doc.lineAt(pos);
  const offset = pos - line.from;
  let before = 0;
  while (line.text.charAt(offset - before - 1) === char) before++;
  let after = 0;
  while (line.text.charAt(offset + after) === char) after++;
  return { before, after };
}

function toggleAtCaret(state: EditorState, range: SelectionRange, format: InlineFormat, formatted: boolean) {
  const pos = range.from;
  if (codeBlockAt(state, pos)) return { range };
  const node = formatted ? formattedAtCaret(state, pos, format) : null;
  if (node?.lastChild && pos === node.lastChild.from) return { range: EditorSelection.cursor(node.to) };
  if (node) return mapInward(state, markerChanges(node), range);
  const { marker } = format;
  const { before, after } = markerRuns(state, pos, marker.charAt(0));
  const emptyPair = before === after && (before === marker.length || (marker === "*" && before === boldItalicRun));
  if (emptyPair) {
    return { changes: { from: pos - marker.length, to: pos + marker.length }, range: EditorSelection.cursor(pos - marker.length) };
  }
  return { changes: { from: pos, insert: marker + marker }, range: EditorSelection.cursor(pos + marker.length) };
}

function toggleSegments(state: EditorState, range: SelectionRange, format: InlineFormat, formatted: boolean) {
  const specs: ChangeSpec[] = [];
  for (const segment of textSegments(state, range)) {
    if (formatted) {
      const node = enclosingNode(state, segment, format.node);
      if (node) specs.push(...markerChanges(node));
      continue;
    }
    const overlapping = nodesWithin(state, segment, format.node);
    const from = Math.min(segment.from, ...overlapping.map((node) => node.from));
    const to = Math.max(segment.to, ...overlapping.map((node) => node.to));
    specs.push(...overlapping.flatMap(markerChanges), { from, insert: format.marker }, { from: to, insert: format.marker });
  }
  return mapInward(state, specs, range);
}

export function toggleMark(mark: MarkdownMark): StateCommand {
  const format = formats[mark];
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const formatted = isMarkActive(state, mark);
    const update = state.changeByRange((range) =>
      range.empty ? toggleAtCaret(state, range, format, formatted) : toggleSegments(state, range, format, formatted),
    );
    dispatch(state.update(update, { scrollIntoView: true, userEvent: "input.format" }));
    return true;
  };
}
