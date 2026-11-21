import { syntaxTree } from "@codemirror/language";
import { type ChangeSet, EditorSelection, type EditorState, type Line, type StateCommand, type Transaction } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import type { MarkdownBlockCommand, MarkdownBlockType, MarkdownHeadingLevel, MarkdownTextRange } from "../../engine";
import { codeBlockAt, type TextChange } from "./inline";

type LineParts = { lead: string; list: string; task: string; heading: string; rest: string };
type ListKind = "bulletList" | "orderedList" | "taskList";

const linePattern = /^(\s*(?:>[ \t]?)*[ \t]*)(?:((?:[-*+]|\d+[.)])(?:[ \t]+|$))(\[[ xX]\](?:[ \t]+|$))?)?(#{1,6}(?:[ \t]+|$))?/;
const sides: readonly (-1 | 1)[] = [1, -1];
const fence = "```";
const tableTemplate = createTableMarkdown(3, 2);

function createTableMarkdown(columns: number, bodyRows: number): string {
  const row = `|${"  |".repeat(columns)}`;
  const delimiter = `|${" --- |".repeat(columns)}`;
  return [row, delimiter, ...Array.from({ length: bodyRows }, () => row)].join("\n");
}

function parseLine(text: string): LineParts {
  const match = linePattern.exec(text);
  const lead = match?.[1] ?? "";
  const list = match?.[2] ?? "";
  const task = match?.[3] ?? "";
  const heading = match?.[4] ?? "";
  return { lead, list, task, heading, rest: text.slice(lead.length + list.length + task.length + heading.length) };
}

function listKind(parts: LineParts): ListKind | null {
  if (!parts.list) return null;
  if (parts.task) return "taskList";
  return /^\d/.test(parts.list) ? "orderedList" : "bulletList";
}

const isBlank = (line: Line) => line.text.trim() === "";

function linesBetween(state: EditorState, from: number, to: number): Line[] {
  const first = state.doc.lineAt(from);
  let last = state.doc.lineAt(to);
  if (to > from && to === last.from && last.number > first.number) last = state.doc.line(last.number - 1);
  const lines: Line[] = [];
  for (let number = first.number; number <= last.number; number++) lines.push(state.doc.line(number));
  return lines;
}

function touchedLines(state: EditorState): Line[] {
  const byNumber = new Map<number, Line>();
  for (const range of state.selection.ranges) {
    for (const line of linesBetween(state, range.from, range.to)) byNumber.set(line.number, line);
  }
  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

function contentLines(lines: Line[]): Line[] {
  const filled = lines.filter((line) => !isBlank(line));
  return filled.length > 0 ? filled : lines;
}

function ancestors(state: EditorState, pos: number): SyntaxNode[] {
  const nodes: SyntaxNode[] = [];
  for (const side of sides) {
    for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, side); node; node = node.parent) nodes.push(node);
  }
  return nodes;
}

export function activeBlocks(state: EditorState): Record<MarkdownBlockType, boolean> {
  const nodes = ancestors(state, state.selection.main.head);
  const names = new Set(nodes.map((node) => node.name));
  const item = nodes.find((node) => node.name === "ListItem");
  const task = Boolean(item?.getChild("Task"));
  return {
    bulletList: item?.parent?.name === "BulletList" && !task,
    orderedList: item?.parent?.name === "OrderedList",
    taskList: task,
    blockquote: names.has("Blockquote"),
    codeBlock: names.has("FencedCode") || names.has("CodeBlock"),
  };
}

export function headingLevel(state: EditorState): MarkdownHeadingLevel | null {
  for (const node of ancestors(state, state.selection.main.head)) {
    const level = /^(?:ATXHeading|SetextHeading)([1-6])$/.exec(node.name)?.[1];
    if (level) return toHeadingLevel(Number(level));
  }
  return null;
}

function toHeadingLevel(level: number): MarkdownHeadingLevel | null {
  switch (level) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return level;
    default:
      return null;
  }
}

function dispatchChanges(
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | undefined,
  changes: TextChange[],
  selection?: (set: ChangeSet) => EditorSelection,
): boolean {
  if (!dispatch || changes.length === 0) return true;
  const set = state.changes(changes);
  const mapped = selection
    ? selection(set)
    : EditorSelection.create(
        state.selection.ranges.map((range) => EditorSelection.range(set.mapPos(range.anchor, 1), set.mapPos(range.head, 1))),
        state.selection.mainIndex,
      );
  dispatch(state.update({ changes: set, selection: mapped, scrollIntoView: true, userEvent: "input.format" }));
  return true;
}

function listMarker(kind: ListKind, parts: LineParts, number: number): string {
  if (kind === "orderedList") return `${number}. `;
  if (kind === "bulletList") return "- ";
  return parts.task ? `- ${parts.task.trimEnd()} ` : "- [ ] ";
}

function listChanges(state: EditorState, kind: ListKind): TextChange[] {
  const lines = contentLines(touchedLines(state)).filter((line) => !codeBlockAt(state, line.from));
  const unwrap = lines.length > 0 && lines.every((line) => listKind(parseLine(line.text)) === kind);
  return lines.map((line, index) => {
    const parts = parseLine(line.text);
    const from = line.from + parts.lead.length;
    return { from, to: from + parts.list.length + parts.task.length, insert: unwrap ? "" : listMarker(kind, parts, index + 1) };
  });
}

function quoteChanges(state: EditorState): TextChange[] {
  const lines = touchedLines(state);
  const quoted = (line: Line) => /^\s*>/.test(line.text);
  if (lines.every(quoted)) {
    return lines.map((line) => {
      const match = /^(\s*)> ?/.exec(line.text);
      const indent = match?.[1].length ?? 0;
      return { from: line.from + indent, to: line.from + (match?.[0].length ?? 0), insert: "" };
    });
  }
  const onlyBlank = lines.every(isBlank);
  return lines.map((line) => ({ from: line.from, to: line.from, insert: isBlank(line) && !onlyBlank ? ">" : "> " }));
}

function unwrapCodeBlock(state: EditorState, block: SyntaxNode): TextChange[] {
  if (block.name === "CodeBlock") {
    return linesBetween(state, block.from, block.to).map((line) => {
      const indent = /^ {0,4}/.exec(line.text)?.[0].length ?? 0;
      return { from: line.from, to: line.from + indent, insert: "" };
    });
  }
  const opening = state.doc.lineAt(block.from);
  const changes: TextChange[] = [{ from: opening.from, to: Math.min(opening.to + 1, state.doc.length), insert: "" }];
  const closingMark = block.lastChild;
  if (closingMark && closingMark.name === "CodeMark" && closingMark.from > opening.to) {
    const closing = state.doc.lineAt(closingMark.from);
    changes.push({ from: Math.max(closing.from - 1, opening.to + 1), to: closing.to, insert: "" });
  }
  return changes;
}

function wrapInCodeBlock(state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean {
  const main = state.selection.main;
  const lines = linesBetween(state, main.from, main.to);
  const first = lines[0];
  const last = lines[lines.length - 1];
  if (!first || !last) return true;
  if (lines.every(isBlank)) {
    const changes = [{ from: first.from, to: last.to, insert: `${fence}\n\n${fence}` }];
    return dispatchChanges(state, dispatch, changes, () => EditorSelection.single(first.from + fence.length + 1));
  }
  const changes: TextChange[] = lines.map((line) => {
    const parts = parseLine(line.text);
    const marked = parts.lead.includes(">") || parts.list !== "" || parts.heading !== "";
    const stripped = isBlank(line) || !marked ? 0 : line.length - parts.rest.length;
    return { from: line.from, to: line.from + stripped, insert: line === first ? `${fence}\n` : "" };
  });
  changes.push({ from: last.to, to: last.to, insert: `\n${fence}` });
  const mapPos = (set: ChangeSet, pos: number) => set.mapPos(pos, pos === last.to ? -1 : 1);
  return dispatchChanges(state, dispatch, changes, (set) =>
    EditorSelection.create(
      state.selection.ranges.map((range) => EditorSelection.range(mapPos(set, range.anchor), mapPos(set, range.head))),
      state.selection.mainIndex,
    ),
  );
}

export function toggleBlock(block: MarkdownBlockType): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const code = codeBlockAt(state, state.selection.main.head);
    if (block === "codeBlock")
      return code ? dispatchChanges(state, dispatch, unwrapCodeBlock(state, code)) : wrapInCodeBlock(state, dispatch);
    if (code?.name === "FencedCode") return true;
    return dispatchChanges(state, dispatch, block === "blockquote" ? quoteChanges(state) : listChanges(state, block));
  };
}

const headingMarker = (level: MarkdownHeadingLevel | null) => (level ? `${"#".repeat(level)} ` : "");

function atxChange(line: Line, level: MarkdownHeadingLevel | null): TextChange | null {
  const parts = parseLine(line.text);
  const from = line.from + parts.lead.length + parts.list.length + parts.task.length;
  const insert = headingMarker(level);
  return insert === parts.heading ? null : { from, to: from + parts.heading.length, insert };
}

function setextChanges(state: EditorState, node: SyntaxNode, level: MarkdownHeadingLevel | null): TextChange[] {
  const underline = node.getChild("HeaderMark");
  if (!underline) return [];
  const underlineLine = state.doc.lineAt(underline.from);
  const content = linesBetween(state, node.from, underlineLine.from - 1);
  const changes: TextChange[] = [{ from: underlineLine.from - 1, to: underlineLine.to, insert: "" }];
  const [first, ...rest] = content;
  if (!level || !first) return changes;
  const marker = atxChange(first, level);
  if (marker) changes.push(marker);
  let previous = first;
  for (const line of rest) {
    changes.push({ from: previous.to, to: line.from + parseLine(line.text).lead.length, insert: " " });
    previous = line;
  }
  return changes;
}

function setextAt(state: EditorState, pos: number): SyntaxNode | null {
  for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, 1); node; node = node.parent) {
    if (node.name.startsWith("SetextHeading")) return node;
  }
  return null;
}

function headingChanges(state: EditorState, level: MarkdownHeadingLevel | null): TextChange[] {
  const changes: TextChange[] = [];
  const setexts = new Set<number>();
  for (const line of contentLines(touchedLines(state))) {
    if (codeBlockAt(state, line.from)) continue;
    const setext = setextAt(state, line.from);
    if (!setext) {
      const change = atxChange(line, level);
      if (change) changes.push(change);
    } else if (!setexts.has(setext.from)) {
      setexts.add(setext.from);
      changes.push(...setextChanges(state, setext, level));
    }
  }
  return changes;
}

export function setHeading(level: MarkdownHeadingLevel | null): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    if (codeBlockAt(state, state.selection.main.head)) return true;
    return dispatchChanges(state, dispatch, headingChanges(state, level));
  };
}

function blockPrefixFor(block: MarkdownBlockCommand): string {
  switch (block.type) {
    case "heading":
      return headingMarker(block.level);
    case "bulletList":
      return "- ";
    case "orderedList":
      return "1. ";
    case "taskList":
      return "- [ ] ";
    case "blockquote":
      return "> ";
    default:
      return "";
  }
}

type SlashResult = { insert: string; caret: number };

function standaloneBlock(state: EditorState, line: Line, content: string, block: string): SlashResult {
  const previous = line.number > 1 ? state.doc.line(line.number - 1) : null;
  const next = line.number < state.doc.lines ? state.doc.line(line.number + 1) : null;
  const separated = previous && !isBlank(previous) ? "\n" : "";
  const before = content.trim() ? `${content}\n\n` : separated;
  const after = next && !isBlank(next) ? "\n" : "";
  return { insert: `${before}${block}${after}`, caret: before.length };
}

function slashResult(state: EditorState, line: Line, content: string, caret: number, block: MarkdownBlockCommand): SlashResult {
  if (block.type === "codeBlock") return { insert: `${fence}\n${content}\n${fence}`, caret: fence.length + 1 + content.length };
  if (block.type === "horizontalRule") {
    const rule = standaloneBlock(state, line, content, "---\n");
    return { insert: rule.insert, caret: rule.caret + 4 };
  }
  if (block.type === "table") {
    const table = standaloneBlock(state, line, content, tableTemplate);
    return { insert: table.insert, caret: table.caret + 2 };
  }
  const prefix = blockPrefixFor(block);
  return { insert: prefix + content, caret: prefix.length + caret };
}

export function replaceWithBlock(range: MarkdownTextRange, block: MarkdownBlockCommand): StateCommand {
  return ({ state, dispatch }) => {
    if (state.readOnly) return false;
    const line = state.doc.lineAt(range.from);
    const start = range.from - line.from;
    const text = line.text.slice(0, start) + line.text.slice(Math.min(range.to, line.to) - line.from);
    const parts = parseLine(text);
    const stripped = text.length - parts.rest.length;
    const result = slashResult(state, line, parts.rest, Math.max(0, start - stripped), block);
    if (dispatch) {
      dispatch(
        state.update({
          changes: { from: line.from, to: line.to, insert: result.insert },
          selection: EditorSelection.cursor(line.from + result.caret),
          scrollIntoView: true,
          userEvent: "input.type",
        }),
      );
    }
    return true;
  };
}
