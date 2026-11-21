import type { ChangeSpec, StateCommand, Text } from "@codemirror/state";

type ListItem = { indent: number; content: number };

const listItemPattern = /^([ \t]*)(?:[-*+]|\d{1,9}[.)])[ \t]/;
const indentOf = (text: string) => text.length - text.trimStart().length;

function listItemAt(doc: Text, number: number): ListItem | null {
  const match = listItemPattern.exec(doc.line(number).text);
  return match ? { indent: match[1]?.length ?? 0, content: match[0].length } : null;
}

/** The nearest earlier item the predicate accepts, searching only within the same list. */
function earlierItem(doc: Text, number: number, accept: (item: ListItem) => boolean | null): ListItem | null {
  for (let previous = number - 1; previous >= 1; previous--) {
    const text = doc.line(previous).text;
    if (text.trim() === "") continue;
    const item = listItemAt(doc, previous);
    if (!item) {
      if (indentOf(text) === 0) return null;
      continue;
    }
    const verdict = accept(item);
    if (verdict !== false) return verdict ? item : null;
  }
  return null;
}

function lastNestedLine(doc: Text, number: number, indent: number) {
  let last = number;
  for (let next = number + 1; next <= doc.lines; next++) {
    const text = doc.line(next).text;
    if (text.trim() === "") continue;
    if (indentOf(text) <= indent) break;
    last = next;
  }
  return last;
}

function shiftLines(doc: Text, first: number, last: number, delta: number): ChangeSpec[] {
  const changes: ChangeSpec[] = [];
  for (let number = first; number <= last; number++) {
    const line = doc.line(number);
    if (line.text.trim() === "") continue;
    if (delta > 0) changes.push({ from: line.from, insert: " ".repeat(delta) });
    else changes.push({ from: line.from, to: line.from + Math.min(-delta, indentOf(line.text)) });
  }
  return changes;
}

/** Tab nests a list item under the one before it; Shift-Tab moves it out one level. Otherwise Tab keeps moving focus. */
export function indentListItem(direction: 1 | -1): StateCommand {
  return ({ state, dispatch }) => {
    const { doc } = state;
    const number = doc.lineAt(state.selection.main.head).number;
    const item = listItemAt(doc, number);
    if (!item) return false;
    const target =
      direction > 0
        ? earlierItem(doc, number, (candidate) => (candidate.indent < item.indent ? null : candidate.indent === item.indent))?.content
        : earlierItem(doc, number, (candidate) => candidate.indent < item.indent)?.indent;
    if (target === undefined) return false;
    const changes = shiftLines(doc, number, lastNestedLine(doc, number, item.indent), target - item.indent);
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: direction > 0 ? "input.indent" : "delete.dedent" }));
    return true;
  };
}
