import { describe, expect, test } from "bun:test";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import { insertImage, linkAt, replaceWithMention, setLink } from "./links";

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

describe("setLink", () => {
  test("wraps the selected text, keeping it selected, and linkAt reads it back", () => {
    const linked = run(setLink("https://a.dev"), stateOf("see «docs» now"));
    expect(show(linked)).toBe("see [«docs»](https://a.dev) now");
    expect(linkAt(linked)).toEqual({ from: 4, to: 25, href: "https://a.dev" });
  });

  test("updates only the URL of the surrounding link", () => {
    expect(show(run(setLink("https://b.dev"), stateOf("[do‸cs](https://a.dev)")))).toBe("[do‸cs](https://b.dev)");
  });

  test("removes the surrounding link and keeps its text", () => {
    expect(show(run(setLink(null), stateOf("see [do‸cs](https://a.dev) now")))).toBe("see do‸cs now");
    expect(show(run(setLink(""), stateOf("[«docs»](https://a.dev)")))).toBe("«docs»");
  });

  test("an empty selection inserts the URL as its own text with the caret after it", () => {
    expect(show(run(setLink("https://a.dev"), stateOf("go ‸")))).toBe("go [https://a.dev](https://a.dev)‸");
  });

  test("escapes parentheses and brackets in URLs and created text, but not selected text", () => {
    expect(run(setLink("https://w.org/a_(b)"), stateOf("«x [y]»")).doc.toString()).toBe("[x [y]](https://w.org/a_\\(b\\))");
    expect(run(setLink("a]b"), stateOf("‸")).doc.toString()).toBe("[a\\]b](a]b)");
    expect(run(setLink("<x>"), stateOf("«t»")).doc.toString()).toBe("[t](\\<x\\>)");
    expect(run(setLink("my file.md"), stateOf("«t»")).doc.toString()).toBe("[t](<my file.md>)");
  });

  test("escaped and angle-bracketed URLs read back as the original href", () => {
    for (const href of ["https://w.org/a_(b)", "my file.md", "<x>"]) {
      const linked = run(setLink(href), stateOf("«t»"));
      expect(linkAt(linked)?.href).toBe(href);
    }
  });

  test("a read-only editor refuses link commands", () => {
    expect(setLink("x")({ state: stateOf("«a»", true), dispatch: () => {} })).toBe(false);
    expect(insertImage({ src: "x", alt: "" })({ state: stateOf("", true), dispatch: () => {} })).toBe(false);
  });
});

describe("linkAt", () => {
  test("finds a link touching the caret and ignores plain text and images", () => {
    expect(linkAt(stateOf("[a](u)‸ b"))?.href).toBe("u");
    expect(linkAt(stateOf("‸[a](u)"))?.href).toBe("u");
    expect(linkAt(stateOf("[a](u) ‸b"))).toBe(null);
    expect(linkAt(stateOf("![a](u‸)"))).toBe(null);
    expect(linkAt(stateOf("[«a](u) b»"))).toBe(null);
  });
});

describe("insertImage", () => {
  test("replaces the selection with an escaped image and puts the caret after it", () => {
    expect(show(run(insertImage({ src: "/a (1).png", alt: "cat [x]" }), stateOf("x «old» y")))).toBe("x ![cat \\[x\\]](</a (1).png>)‸ y");
    expect(show(run(insertImage({ src: "/a(1).png", alt: "a" }), stateOf("‸")))).toBe("![a](/a\\(1\\).png)‸");
  });
});

describe("replaceWithMention", () => {
  test("replaces the query with a mention link followed by a space and puts the caret after it", () => {
    const state = stateOf("hi @da‸");
    const next = run(replaceWithMention({ from: 3, to: 6 }, { label: "Damien [ds]", href: "/u/damien" }), state);
    expect(show(next)).toBe("hi [@Damien \\[ds\\]](/u/damien) ‸");
  });

  test("is typed input", () => {
    let typed = false;
    replaceWithMention(
      { from: 0, to: 1 },
      { label: "a", href: "b" },
    )({
      state: stateOf("@‸"),
      dispatch: (tr) => {
        typed = tr.isUserEvent("input.type");
      },
    });
    expect(typed).toBe(true);
  });
});
