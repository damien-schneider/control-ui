import { syntaxTree } from "@codemirror/language";
import type { EditorState, Text } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import type { TextChange } from "../format/inline";

export type MarkdownBlockUnit = { from: number; to: number };
export type BlockMove = { changes: TextChange[]; selection: { anchor: number; head: number } };

type UnitNode = { unit: MarkdownBlockUnit; node: SyntaxNode };
type Arrangement = { order: number[]; gaps: string[] };

const containerName = /^(?:BulletList|OrderedList|ListItem|Blockquote)$/;
const verbatimBlock = /^(?:FencedCode|CodeBlock|HTMLBlock)$/;

const contains = (unit: MarkdownBlockUnit, pos: number) => unit.from <= pos && pos <= unit.to;

const linePrefix = (doc: Text, pos: number) => doc.sliceString(doc.lineAt(pos).from, pos);

function isBlankInside(text: string, quoteDepth: number): boolean {
  let rest = text;
  for (let depth = 0; depth < quoteDepth; depth++) {
    const marker = /^\s*>/.exec(rest);
    if (marker === null) break;
    rest = rest.slice(marker[0].length);
  }
  return rest.trim() === "";
}

function unitOf(doc: Text, node: SyntaxNode): MarkdownBlockUnit {
  const first = doc.lineAt(node.from);
  const quoteDepth = linePrefix(doc, node.from).split(">").length - 1;
  const end = node.to > node.from && doc.lineAt(node.to).from === node.to ? node.to - 1 : node.to;
  let last = doc.lineAt(end);
  while (last.number > first.number && isBlankInside(last.text, quoteDepth)) last = doc.line(last.number - 1);
  return { from: first.from, to: last.to };
}

// An item sharing its first line with its parent's marker ("1. - a") cannot move on its own.
const isMovableItem = (doc: Text, node: SyntaxNode) =>
  node.name === "ListItem" && node.parent !== null && /^[\s>]*$/.test(linePrefix(doc, node.parent.from));

function deepestItem(doc: Text, node: SyntaxNode, pos: number): SyntaxNode | null {
  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    if (!containerName.test(child.name) || !contains(unitOf(doc, child), pos)) continue;
    return deepestItem(doc, child, pos) ?? (isMovableItem(doc, child) ? child : null);
  }
  return null;
}

function children(node: SyntaxNode): SyntaxNode[] {
  const nodes: SyntaxNode[] = [];
  for (let child = node.firstChild; child !== null; child = child.nextSibling) nodes.push(child);
  return nodes;
}

function isBlankOutsideCode(state: EditorState, pos: number): boolean {
  if (state.doc.lineAt(pos).text.trim() !== "") return false;
  for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, 1); node !== null; node = node.parent) {
    if (verbatimBlock.test(node.name)) return false;
  }
  return true;
}

function locate(state: EditorState, pos: number): UnitNode | null {
  if (isBlankOutsideCode(state, pos)) return null;
  const doc = state.doc;
  const lineEnd = doc.lineAt(pos).to;
  for (let node = syntaxTree(state).topNode.firstChild; node !== null && node.from <= lineEnd; node = node.nextSibling) {
    const unit = unitOf(doc, node);
    if (!contains(unit, pos)) continue;
    const item = deepestItem(doc, node, pos);
    return item === null ? { unit, node } : { unit: unitOf(doc, item), node: item };
  }
  return null;
}

export function blockAt(state: EditorState, pos: number): MarkdownBlockUnit | null {
  return locate(state, pos)?.unit ?? null;
}

export function blockStartingAt(state: EditorState, from: number): MarkdownBlockUnit | null {
  if (from < 0 || from > state.doc.length) return null;
  const unit = blockAt(state, from);
  return unit !== null && unit.from === from ? unit : null;
}

function siblingNodes(state: EditorState, block: MarkdownBlockUnit): UnitNode[] {
  const located = locate(state, block.from);
  if (located === null || located.unit.from !== block.from) return [];
  const container = located.node.name === "ListItem" ? located.node.parent : null;
  const nodes = container === null ? children(syntaxTree(state).topNode) : children(container).filter((node) => node.name === "ListItem");
  return nodes.map((node) => ({ unit: unitOf(state.doc, node), node }));
}

export function siblingBlocks(state: EditorState, block: MarkdownBlockUnit): MarkdownBlockUnit[] {
  return siblingNodes(state, block).map((sibling) => sibling.unit);
}

function gapsBetween(doc: Text, siblings: UnitNode[]): string[] {
  return siblings.slice(1).map((sibling, index) => doc.sliceString(siblings[index].unit.to, sibling.unit.from));
}

function markerDigits(doc: Text, item: SyntaxNode): { offset: number; digits: string } | null {
  const mark = item.firstChild;
  if (mark === null || mark.name !== "ListMark") return null;
  const digits = /^\d+/.exec(doc.sliceString(mark.from, mark.to));
  return digits === null ? null : { offset: mark.from - doc.lineAt(item.from).from, digits: digits[0] };
}

function isOrderedList(siblings: UnitNode[]): boolean {
  const list = siblings[0].node.parent;
  return siblings[0].node.name === "ListItem" && list !== null && list.name === "OrderedList";
}

function arrangedTexts(doc: Text, siblings: UnitNode[], order: number[]): string[] {
  const texts = order.map((index) => doc.sliceString(siblings[index].unit.from, siblings[index].unit.to));
  if (!isOrderedList(siblings)) return texts;
  const start = Number(markerDigits(doc, siblings[0].node)?.digits ?? "1");
  return texts.map((text, position) => {
    const marker = markerDigits(doc, siblings[order[position]].node);
    if (marker === null) return text;
    return text.slice(0, marker.offset) + String(start + position) + text.slice(marker.offset + marker.digits.length);
  });
}

function changedSpan(arrangement: Arrangement, gaps: string[], renumbered: boolean): { first: number; last: number } {
  if (renumbered) return { first: 0, last: arrangement.order.length - 1 };
  let first = arrangement.order.length;
  let last = -1;
  const touch = (low: number, high: number) => {
    first = Math.min(first, low);
    last = Math.max(last, high);
  };
  arrangement.order.forEach((index, position) => {
    if (index !== position) touch(position, position);
  });
  arrangement.gaps.forEach((gap, position) => {
    if (gap !== gaps[position]) touch(position, position + 1);
  });
  return { first, last };
}

function minimalChange(from: number, before: string, after: string): TextChange[] {
  const shorter = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < shorter && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < shorter - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  if (prefix === before.length && prefix === after.length) return [];
  return [{ from: from + prefix, to: from + before.length - suffix, insert: after.slice(prefix, after.length - suffix) }];
}

function applyArrangement(state: EditorState, siblings: UnitNode[], arrangement: Arrangement, moved: number): BlockMove {
  const doc = state.doc;
  const gaps = gapsBetween(doc, siblings);
  const renumbered = isOrderedList(siblings);
  const texts = arrangedTexts(doc, siblings, arrangement.order);
  const { first, last } = changedSpan(arrangement, gaps, renumbered);
  const from = siblings[first].unit.from;
  const to = siblings[last].unit.to;
  let insert = "";
  let selection = { anchor: from, head: from };
  for (let position = first; position <= last; position++) {
    if (position > first) insert += arrangement.gaps[position - 1];
    if (arrangement.order[position] === moved) {
      const anchor = from + insert.length;
      selection = { anchor, head: anchor + texts[position].length };
    }
    insert += texts[position];
  }
  return { changes: minimalChange(from, doc.sliceString(from, to), insert), selection };
}

export function moveBlock(state: EditorState, block: MarkdownBlockUnit, direction: -1 | 1): BlockMove | null {
  const siblings = siblingNodes(state, block);
  const index = siblings.findIndex((sibling) => sibling.unit.from === block.from);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= siblings.length) return null;
  const order = siblings.map((_, position) => position);
  order[index] = target;
  order[target] = index;
  return applyArrangement(state, siblings, { order, gaps: gapsBetween(state.doc, siblings) }, index);
}

export function dropBlock(state: EditorState, block: MarkdownBlockUnit, index: number): BlockMove | null {
  const siblings = siblingNodes(state, block);
  const own = siblings.findIndex((sibling) => sibling.unit.from === block.from);
  if (own < 0 || !Number.isInteger(index) || index < 0 || index > siblings.length || index === own || index === own + 1) return null;
  const gaps = gapsBetween(state.doc, siblings);
  const removedGap = own < gaps.length ? own : own - 1;
  const ownSeparator = gaps[removedGap];
  const restOrder = siblings.map((_, position) => position).filter((position) => position !== own);
  const restGaps = gaps.filter((_, position) => position !== removedGap);
  const target = index > own ? index - 1 : index;
  const order = [...restOrder.slice(0, target), own, ...restOrder.slice(target)];
  return applyArrangement(state, siblings, { order, gaps: gapsAfterDrop(restGaps, ownSeparator, target) }, own);
}

/** The dropped block brings its separator to either end; in the middle it copies the gap before it. */
function gapsAfterDrop(restGaps: string[], ownSeparator: string, target: number): string[] {
  if (target === 0) return [ownSeparator, ...restGaps];
  if (target === restGaps.length + 1) return [...restGaps, ownSeparator];
  return [...restGaps.slice(0, target), restGaps[target - 1], ...restGaps.slice(target)];
}
