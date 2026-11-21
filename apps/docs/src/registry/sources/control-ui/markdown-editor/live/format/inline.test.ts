import { describe, expect, test } from "bun:test";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import { insideCode, isMarkActive, toggleMark } from "./inline";

function stateOf(marked: string, readOnly = false): EditorState {
  const ranges: { anchor: number; head: number }[] = [];
  let doc = "";
  let anchor = -1;
  for (const char of marked) {
    if (char === "‸") ranges.push({ anchor: doc.length, head: doc.length });
    else if (char === "«") anchor = doc.length;
    else if (char === "»") ranges.push({ anchor, head: doc.length });
    else doc += char;
  }
  const selection = EditorSelection.create(
    ranges.length > 0 ? ranges.map((range) => EditorSelection.range(range.anchor, range.head)) : [EditorSelection.cursor(0)],
  );
  const state = EditorState.create({
    doc,
    selection,
    extensions: [markdown({ base: markdownLanguage }), EditorState.allowMultipleSelections.of(true), EditorState.readOnly.of(readOnly)],
  });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
}

function show(state: EditorState): string {
  let text = state.doc.toString();
  const marks = state.selection.ranges.flatMap((range) =>
    range.empty
      ? [{ at: range.from, mark: "‸" }]
      : [
          { at: range.to, mark: "»" },
          { at: range.from, mark: "«" },
        ],
  );
  for (const { at, mark } of marks.sort((a, b) => b.at - a.at)) text = text.slice(0, at) + mark + text.slice(at);
  return text;
}

function run(command: StateCommand, state: EditorState): EditorState {
  let next = state;
  command({
    state,
    dispatch: (tr) => {
      next = tr.state;
    },
  });
  ensureSyntaxTree(next, next.doc.length, 5000);
  return next;
}

describe("toggleMark", () => {
  test("bold wraps a select-all word and unwraps it on the second press", () => {
    const bolded = run(toggleMark("bold"), stateOf("«Feedback»"));
    expect(show(bolded)).toBe("**«Feedback»**");
    expect(show(run(toggleMark("bold"), bolded))).toBe("«Feedback»");
  });

  test("strike uses double tildes and italic a single star", () => {
    expect(show(run(toggleMark("strike"), stateOf("«gone»")))).toBe("~~«gone»~~");
    expect(show(run(toggleMark("italic"), stateOf("«soft»")))).toBe("*«soft»*");
    expect(show(run(toggleMark("code"), stateOf("«x»")))).toBe("`«x»`");
  });

  test("a multi-line selection wraps each line's text after its list marker", () => {
    const next = run(toggleMark("bold"), stateOf("- «one\n- two»"));
    expect(next.doc.toString()).toBe("- **one**\n- **two**");
  });

  test("a caret toggle inserts an empty pair, steps out at the closing marker and removes an empty pair", () => {
    const opened = run(toggleMark("bold"), stateOf("a ‸"));
    expect(show(opened)).toBe("a **‸**");
    expect(show(run(toggleMark("bold"), opened))).toBe("a ‸");
    expect(show(run(toggleMark("bold"), stateOf("**bold‸** x")))).toBe("**bold**‸ x");
  });

  test("a caret inside bold text unwraps the whole span", () => {
    expect(show(run(toggleMark("bold"), stateOf("**bo‸ld**")))).toBe("bo‸ld");
  });

  test("selecting across existing bold merges it into one span", () => {
    expect(run(toggleMark("bold"), stateOf("«a **b** c»")).doc.toString()).toBe("**a b c**");
  });

  test("every cursor of a multi-cursor selection is toggled", () => {
    expect(run(toggleMark("italic"), stateOf("«one» and «two»")).doc.toString()).toBe("*one* and *two*");
  });

  test("a caret in an empty document inserts the pair", () => {
    expect(show(run(toggleMark("strike"), stateOf("")))).toBe("~~‸~~");
  });

  test("a read-only editor refuses the command", () => {
    expect(toggleMark("bold")({ state: stateOf("«a»", true), dispatch: () => {} })).toBe(false);
  });

  test("the command dispatches an input.format transaction", () => {
    const state = stateOf("«a»");
    let event: string | undefined;
    toggleMark("bold")({
      state,
      dispatch: (tr) => {
        event = tr.isUserEvent("input.format") ? "input.format" : "other";
      },
    });
    expect(event).toBe("input.format");
  });
});

describe("isMarkActive", () => {
  test("reports a mark for a caret inside its content and selections fully inside it", () => {
    expect(isMarkActive(stateOf("**bo‸ld**"), "bold")).toBe(true);
    expect(isMarkActive(stateOf("**«bold»**"), "bold")).toBe(true);
    expect(isMarkActive(stateOf("~~«gone»~~"), "strike")).toBe(true);
    expect(isMarkActive(stateOf("`co‸de`"), "code")).toBe(true);
    expect(isMarkActive(stateOf("*it‸*"), "italic")).toBe(true);
  });

  test("is inactive when any selection reaches outside the mark", () => {
    expect(isMarkActive(stateOf("«**a** b»"), "bold")).toBe(false);
    expect(isMarkActive(stateOf("**a** ‸b"), "bold")).toBe(false);
    expect(isMarkActive(stateOf("**a** ‸"), "italic")).toBe(false);
  });
});

describe("insideCode", () => {
  test("covers fenced blocks, indented blocks and inline code spans but not their surroundings", () => {
    const state = stateOf("a `b` c\n\n```\nx\n```\n\n    indented");
    const at = (text: string) => state.doc.toString().indexOf(text);
    expect(insideCode(state, at("b"))).toBe(true);
    expect(insideCode(state, at("c"))).toBe(false);
    expect(insideCode(state, at("x"))).toBe(true);
    expect(insideCode(state, at("indented") + 2)).toBe(true);
    expect(insideCode(state, 0)).toBe(false);
  });
});
