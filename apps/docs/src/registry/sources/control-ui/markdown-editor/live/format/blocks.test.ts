import { describe, expect, test } from "bun:test";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import { activeBlocks, headingLevel, replaceWithBlock, setHeading, toggleBlock } from "./blocks";

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

const text = (command: StateCommand, marked: string) => run(command, stateOf(marked)).doc.toString();

describe("toggleBlock lists", () => {
  test("bullet over three lines, then ordered renumbers them, then ordered again unwraps", () => {
    const bullets = run(toggleBlock("bulletList"), stateOf("«a\nb\nc»"));
    expect(bullets.doc.toString()).toBe("- a\n- b\n- c");
    const ordered = run(toggleBlock("orderedList"), bullets);
    expect(ordered.doc.toString()).toBe("1. a\n2. b\n3. c");
    expect(run(toggleBlock("orderedList"), ordered).doc.toString()).toBe("a\nb\nc");
  });

  test("an empty document becomes an empty list item with the caret after the marker", () => {
    expect(show(run(toggleBlock("bulletList"), stateOf("")))).toBe("- ‸");
    expect(show(run(toggleBlock("taskList"), stateOf("")))).toBe("- [ ] ‸");
  });

  test("task toggles add a checkbox, switch from other kinds and unwrap", () => {
    expect(text(toggleBlock("taskList"), "- a‸")).toBe("- [ ] a");
    expect(text(toggleBlock("taskList"), "«a\nb»")).toBe("- [ ] a\n- [ ] b");
    expect(text(toggleBlock("taskList"), "- [x] a‸")).toBe("a");
    expect(text(toggleBlock("orderedList"), "- [x] a‸")).toBe("1. a");
    expect(text(toggleBlock("bulletList"), "1. a‸")).toBe("- a");
  });

  test("markers go after indentation and quote prefixes and keep heading markers", () => {
    expect(text(toggleBlock("bulletList"), "- a\n  b‸")).toBe("- a\n  - b");
    expect(text(toggleBlock("bulletList"), "> q‸")).toBe("> - q");
    expect(text(toggleBlock("bulletList"), "## A‸")).toBe("- ## A");
    expect(text(toggleBlock("bulletList"), "  - nested‸")).toBe("  nested");
  });

  test("blank lines inside a selection stay blank", () => {
    expect(text(toggleBlock("orderedList"), "«a\n\nb»")).toBe("1. a\n\n2. b");
  });

  test("a mixed selection converts every line instead of unwrapping", () => {
    expect(text(toggleBlock("bulletList"), "«- a\nb»")).toBe("- a\n- b");
  });

  test("lists do nothing inside a fenced code block", () => {
    const state = stateOf("```\nco‸de\n```");
    let dispatched = false;
    expect(
      toggleBlock("bulletList")({
        state,
        dispatch: () => {
          dispatched = true;
        },
      }),
    ).toBe(true);
    expect(dispatched).toBe(false);
  });

  test("a read-only editor refuses block commands", () => {
    expect(toggleBlock("bulletList")({ state: stateOf("a", true), dispatch: () => {} })).toBe(false);
    expect(setHeading(1)({ state: stateOf("a", true), dispatch: () => {} })).toBe(false);
    expect(replaceWithBlock({ from: 0, to: 0 }, { type: "table" })({ state: stateOf("", true), dispatch: () => {} })).toBe(false);
  });
});

describe("toggleBlock blockquote", () => {
  test("quotes every line including blank ones and unquotes them again", () => {
    const quoted = run(toggleBlock("blockquote"), stateOf("«a\n\nb»"));
    expect(quoted.doc.toString()).toBe("> a\n>\n> b");
    expect(run(toggleBlock("blockquote"), quoted).doc.toString()).toBe("a\n\nb");
  });

  test("an empty line becomes a quote ready for typing", () => {
    expect(show(run(toggleBlock("blockquote"), stateOf("")))).toBe("> ‸");
  });
});

describe("toggleBlock codeBlock", () => {
  test("wraps the selected lines in fences and strips their block markers", () => {
    expect(text(toggleBlock("codeBlock"), "«- one\n- two»")).toBe("```\none\ntwo\n```");
    expect(show(run(toggleBlock("codeBlock"), stateOf("p\nco‸de\nq")))).toBe("p\n```\nco‸de\n```\nq");
  });

  test("keeps the indentation of unmarked code lines", () => {
    expect(text(toggleBlock("codeBlock"), "«if (a) {\n  go();\n}»")).toBe("```\nif (a) {\n  go();\n}\n```");
  });

  test("an empty line becomes an empty fence with the caret inside", () => {
    expect(show(run(toggleBlock("codeBlock"), stateOf("")))).toBe("```\n‸\n```");
    expect(show(run(toggleBlock("codeBlock"), stateOf("a\n‸\nb")))).toBe("a\n```\n‸\n```\nb");
  });

  test("a caret inside a fenced block removes its fences", () => {
    expect(show(run(toggleBlock("codeBlock"), stateOf("a\n```js\nco‸de\n```\nb")))).toBe("a\nco‸de\nb");
    expect(show(run(toggleBlock("codeBlock"), stateOf("```\n‸\n```")))).toBe("‸");
  });

  test("wrapping then unwrapping restores the paragraph", () => {
    const wrapped = run(toggleBlock("codeBlock"), stateOf("te‸xt"));
    expect(activeBlocks(wrapped).codeBlock).toBe(true);
    expect(show(run(toggleBlock("codeBlock"), wrapped))).toBe("te‸xt");
  });
});

describe("setHeading", () => {
  test("sets every level on a list item and returns it to a paragraph", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const heading = run(setHeading(level), stateOf("- item‸"));
      expect(heading.doc.toString()).toBe(`- ${"#".repeat(level)} item`);
      expect(headingLevel(heading)).toBe(level);
      expect(run(setHeading(null), heading).doc.toString()).toBe("- item");
    }
  });

  test("replaces an existing level and applies to every selected line", () => {
    expect(text(setHeading(3), "# Ti‸tle")).toBe("### Title");
    expect(text(setHeading(2), "«a\n\nb»")).toBe("## a\n\n## b");
    expect(show(run(setHeading(1), stateOf("‸")))).toBe("# ‸");
  });

  test("a setext heading becomes an ATX heading without its underline", () => {
    expect(text(setHeading(2), "Ti‸tle\n===\n\nnext")).toBe("## Title\n\nnext");
    expect(text(setHeading(null), "Ti‸tle\n---")).toBe("Title");
  });

  test("does nothing inside code blocks", () => {
    expect(text(setHeading(1), "```\nco‸de\n```")).toBe("```\ncode\n```");
  });
});

describe("replaceWithBlock", () => {
  const slash = (marked: string, query: string) => {
    const state = stateOf(marked);
    const from = state.doc.toString().indexOf(query);
    return { state, range: { from, to: from + query.length } };
  };

  test("a heading replaces the slash query and clears list markers", () => {
    const { state, range } = slash("- Title /h2‸", "/h2");
    expect(show(run(replaceWithBlock(range, { type: "heading", level: 2 }), state))).toBe("## Title ‸");
  });

  test("a task in an empty document leaves an empty task item", () => {
    const { state, range } = slash("/task‸", "/task");
    expect(show(run(replaceWithBlock(range, { type: "taskList" }), state))).toBe("- [ ] ‸");
  });

  test("paragraph strips quote and heading markers", () => {
    const { state, range } = slash("> ## Hi/p‸", "/p");
    expect(show(run(replaceWithBlock(range, { type: "paragraph" }), state))).toBe("Hi‸");
  });

  test("a code block fences the remaining text with the caret at its end", () => {
    const { state, range } = slash("let x/code‸", "/code");
    expect(show(run(replaceWithBlock(range, { type: "codeBlock" }), state))).toBe("```\nlet x‸\n```");
  });

  test("a rule after a paragraph is separated so it never becomes a setext underline", () => {
    const { state, range } = slash("Para\n/hr‸", "/hr");
    const next = run(replaceWithBlock(range, { type: "horizontalRule" }), state);
    expect(show(next)).toBe("Para\n\n---\n‸");
    expect(headingLevel(next)).toBe(null);
  });

  test("a rule on a line with text keeps the text and adds an empty line before the next paragraph", () => {
    const { state, range } = slash("Text /hr‸\nnext", "/hr");
    expect(show(run(replaceWithBlock(range, { type: "horizontalRule" }), state))).toBe("Text \n\n---\n‸\n\nnext");
  });

  test("a table template is its own block with the caret in the first header cell", () => {
    const { state, range } = slash("before\n/table‸\nafter", "/table");
    const next = run(replaceWithBlock(range, { type: "table" }), state);
    expect(show(next)).toBe("before\n\n| ‸ |  |  |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |\n\nafter");
  });

  test("a table in an empty document needs no separators", () => {
    const { state, range } = slash("/table‸", "/table");
    expect(run(replaceWithBlock(range, { type: "table" }), state).doc.toString()).toBe(
      "|  |  |  |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |",
    );
  });

  test("lists and quotes put their marker before the remaining text", () => {
    const ordered = slash("ab/ol‸c", "/ol");
    expect(show(run(replaceWithBlock(ordered.range, { type: "orderedList" }), ordered.state))).toBe("1. ab‸c");
    const quote = slash("1. x/quote‸", "/quote");
    expect(show(run(replaceWithBlock(quote.range, { type: "blockquote" }), quote.state))).toBe("> x‸");
  });

  test("slash commands are typed input", () => {
    const { state, range } = slash("/h1‸", "/h1");
    let typed = false;
    replaceWithBlock(range, { type: "heading", level: 1 })({
      state,
      dispatch: (tr) => {
        typed = tr.isUserEvent("input.type");
      },
    });
    expect(typed).toBe(true);
  });
});

describe("activeBlocks and headingLevel", () => {
  test("report the block around the caret", () => {
    expect(activeBlocks(stateOf("- a‸"))).toEqual({
      bulletList: true,
      orderedList: false,
      taskList: false,
      blockquote: false,
      codeBlock: false,
    });
    expect(activeBlocks(stateOf("- [ ] a‸"))).toMatchObject({ bulletList: false, taskList: true });
    expect(activeBlocks(stateOf("1. a‸")).orderedList).toBe(true);
    expect(activeBlocks(stateOf("> - a‸"))).toMatchObject({ blockquote: true, bulletList: true });
    expect(activeBlocks(stateOf("    co‸de")).codeBlock).toBe(true);
    expect(activeBlocks(stateOf("- [ ] ‸")).taskList).toBe(true);
    expect(activeBlocks(stateOf("‸"))).toEqual({
      bulletList: false,
      orderedList: false,
      taskList: false,
      blockquote: false,
      codeBlock: false,
    });
  });

  test("the innermost list item decides the list kind", () => {
    expect(activeBlocks(stateOf("- a\n  1. b‸"))).toMatchObject({ bulletList: false, orderedList: true });
    expect(activeBlocks(stateOf("- [ ] a\n  - b‸"))).toMatchObject({ bulletList: true, taskList: false });
  });

  test("headingLevel reads ATX and setext headings", () => {
    expect(headingLevel(stateOf("### a‸"))).toBe(3);
    expect(headingLevel(stateOf("a‸\n---"))).toBe(2);
    expect(headingLevel(stateOf("a‸"))).toBe(null);
  });
});
