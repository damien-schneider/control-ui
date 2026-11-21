import { describe, expect, test } from "bun:test";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { type BlockMove, blockAt, blockStartingAt, dropBlock, type MarkdownBlockUnit, moveBlock, siblingBlocks } from "./block-model";

function stateOf(doc: string): EditorState {
  const state = EditorState.create({ doc, extensions: [markdown({ base: markdownLanguage })] });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
}

const textOf = (state: EditorState, unit: MarkdownBlockUnit | null) => (unit === null ? null : state.sliceDoc(unit.from, unit.to));

function blockTextAt(doc: string, needle: string, offset = 0): string | null {
  const state = stateOf(doc);
  return textOf(state, blockAt(state, doc.indexOf(needle) + offset));
}

function unitContaining(state: EditorState, needle: string): MarkdownBlockUnit {
  const unit = blockAt(state, state.doc.toString().indexOf(needle));
  if (unit === null) throw new Error(`no block contains ${needle}`);
  return unit;
}

function applied(state: EditorState, move: BlockMove | null): { doc: string; selected: string } {
  if (move === null) throw new Error("expected a move");
  const next = state.update({ changes: move.changes, selection: move.selection }).state;
  const { from, to } = next.selection.main;
  return { doc: next.doc.toString(), selected: next.sliceDoc(from, to) };
}

function moved(doc: string, needle: string, direction: -1 | 1) {
  const state = stateOf(doc);
  return applied(state, moveBlock(state, unitContaining(state, needle), direction));
}

function dropped(doc: string, needle: string, index: number) {
  const state = stateOf(doc);
  return applied(state, dropBlock(state, unitContaining(state, needle), index));
}

describe("blockAt", () => {
  test("a paragraph, heading, fence, table, and quote are each one block from any position on their lines", () => {
    const doc =
      "# Title\n\nSome words\nwrapped\n\n```ts\nconst a = 1;\n\nconst b = 2;\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n> quoted\n> more\n";
    expect(blockTextAt(doc, "Title")).toBe("# Title");
    expect(blockTextAt(doc, "# Title")).toBe("# Title");
    expect(blockTextAt(doc, "wrapped", 7)).toBe("Some words\nwrapped");
    expect(blockTextAt(doc, "\nconst b", 0)).toBe("```ts\nconst a = 1;\n\nconst b = 2;\n```");
    expect(blockTextAt(doc, "| 1 |")).toBe("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(blockTextAt(doc, "more")).toBe("> quoted\n> more");
  });

  test("blank lines between blocks belong to no block", () => {
    const doc = "One\n\nTwo\n";
    const state = stateOf(doc);
    expect(blockAt(state, 4)).toBeNull();
    expect(blockAt(state, doc.length)).toBeNull();
    expect(blockAt(stateOf(""), 0)).toBeNull();
  });

  test("a parent item's own line selects it with its nested children; a nested line selects the child", () => {
    const doc = "- Parent\n  - Child one\n  - Child two\n- Sibling";
    expect(blockTextAt(doc, "Parent")).toBe("- Parent\n  - Child one\n  - Child two");
    expect(blockTextAt(doc, "- Parent")).toBe("- Parent\n  - Child one\n  - Child two");
    expect(blockTextAt(doc, "Child two")).toBe("  - Child two");
    expect(blockTextAt(doc, "  - Child one")).toBe("  - Child one");
    expect(blockTextAt(doc, "Sibling")).toBe("- Sibling");
  });

  test("a loose item keeps its continuation paragraph; blank lines inside or between items select nothing", () => {
    const doc = "- First\n\n  continued\n\n- Second\n";
    const state = stateOf(doc);
    expect(blockTextAt(doc, "First")).toBe("- First\n\n  continued");
    expect(textOf(state, blockAt(state, doc.indexOf("continued") + 9))).toBe("- First\n\n  continued");
    expect(blockAt(state, doc.indexOf("- Second") - 1)).toBeNull();
    expect(blockAt(state, doc.indexOf("\n\n") + 1)).toBeNull();
  });

  test("items of a list inside a quote are blocks without the quote's empty lines", () => {
    const doc = "> - a\n>\n> - b\n";
    expect(blockTextAt(doc, "a")).toBe("> - a");
    expect(blockTextAt(doc, "b")).toBe("> - b");
  });

  test("an item sharing its first line with its parent's marker resolves to the parent", () => {
    const doc = "1. - a\n   - b\n";
    expect(blockTextAt(doc, "a")).toBe("1. - a\n   - b");
    expect(blockTextAt(doc, "b")).toBe("1. - a\n   - b");
  });

  test("blockStartingAt finds a block only by its first line's start", () => {
    const doc = "Intro\n\n- a\n  - b\n";
    const state = stateOf(doc);
    expect(textOf(state, blockStartingAt(state, doc.indexOf("- a")))).toBe("- a\n  - b");
    expect(textOf(state, blockStartingAt(state, doc.indexOf("  - b")))).toBe("  - b");
    expect(blockStartingAt(state, doc.indexOf("a"))).toBeNull();
    expect(blockStartingAt(state, 1)).toBeNull();
    expect(blockStartingAt(state, doc.indexOf("\n\n") + 1)).toBeNull();
  });
});

describe("siblingBlocks", () => {
  test("a list item's siblings are the items of its own list; other blocks are the top-level blocks", () => {
    const doc = "# Head\n\n- a\n  - a1\n  - a2\n- b\n\nTail";
    const state = stateOf(doc);
    const texts = (needle: string) => siblingBlocks(state, unitContaining(state, needle)).map((unit) => state.sliceDoc(unit.from, unit.to));
    expect(texts("a2")).toEqual(["  - a1", "  - a2"]);
    expect(texts("- b")).toEqual(["- a\n  - a1\n  - a2", "- b"]);
    expect(texts("Tail")).toEqual(["# Head", "- a\n  - a1\n  - a2\n- b", "Tail"]);
  });
});

describe("moveBlock", () => {
  test("moving a heading down swaps it past each block and keeps the blank lines in place", () => {
    const first = moved("## First\n\nSecond paragraph\n\n- [ ] Third task", "First", 1);
    expect(first).toEqual({ doc: "Second paragraph\n\n## First\n\n- [ ] Third task", selected: "## First" });
    const second = moved(first.doc, "First", 1);
    expect(second).toEqual({ doc: "Second paragraph\n\n- [ ] Third task\n\n## First", selected: "## First" });
    expect(moveBlock(stateOf(second.doc), unitContaining(stateOf(second.doc), "First"), 1)).toBeNull();
  });

  test("moving a tight list item up swaps it with the previous item", () => {
    expect(moved("- One\n- Two\n- Three", "Two", -1)).toEqual({ doc: "- Two\n- One\n- Three", selected: "- Two" });
  });

  test("a loose list item moves with its continuation and the list stays loose", () => {
    expect(moved("- a\n\n  more a\n\n- b\n", "more a", 1)).toEqual({ doc: "- b\n\n- a\n\n  more a\n", selected: "- a\n\n  more a" });
  });

  test("a parent item moves with its nested children", () => {
    expect(moved("- a\n  - a1\n- b\n", "- a", 1)).toEqual({ doc: "- b\n- a\n  - a1\n", selected: "- a\n  - a1" });
  });

  test("a list item never leaves its list", () => {
    const doc = "Intro\n\n- One\n- Two\n\nOutro";
    const state = stateOf(doc);
    expect(moveBlock(state, unitContaining(state, "One"), -1)).toBeNull();
    expect(moveBlock(state, unitContaining(state, "Two"), 1)).toBeNull();
    expect(moveBlock(stateOf("- a\n  - only\n"), unitContaining(stateOf("- a\n  - only\n"), "only"), 1)).toBeNull();
  });

  test("the first and last top-level blocks cannot move past the document edge", () => {
    const state = stateOf("Alpha\n\nBeta\n");
    expect(moveBlock(state, unitContaining(state, "Alpha"), -1)).toBeNull();
    expect(moveBlock(state, unitContaining(state, "Beta"), 1)).toBeNull();
  });

  test("ordered items are renumbered after a move, keeping each delimiter", () => {
    expect(moved("1. a\n2. b", "b", -1)).toEqual({ doc: "1. b\n2. a", selected: "1. b" });
    expect(moved("3) a\n4) b\n5) c\n", "a", 1)).toEqual({ doc: "3) b\n4) a\n5) c\n", selected: "4) a" });
  });

  test("renumbering makes the whole list sequential from its first number and leaves nested lists alone", () => {
    expect(moved("1. a\n1. b\n   1. inner\n   1. inner\n1. c", "c", -1).doc).toBe("1. a\n2. c\n3. b\n   1. inner\n   1. inner");
  });

  test("renumbering grows a marker past nine without touching the item text", () => {
    const doc = Array.from({ length: 10 }, (_, index) => `${index + 1}. item ${index + 1}`).join("\n");
    const result = moved(doc, "item 10", -1);
    expect(result.doc.split("\n").slice(-2)).toEqual(["9. item 10", "10. item 9"]);
    expect(result.selected).toBe("9. item 10");
  });

  test("moving a block keeps the document's trailing newline", () => {
    expect(moved("Alpha\n\nBeta\n", "Beta", -1).doc).toBe("Beta\n\nAlpha\n");
  });

  test("a fenced code block with blank lines moves as one block", () => {
    expect(moved("Text\n\n```\none\n\ntwo\n```\n", "two", -1).doc).toBe("```\none\n\ntwo\n```\n\nText\n");
  });

  test("the change touches only the swapped region", () => {
    const state = stateOf("Alpha\n\nBeta\n\nGamma\n\nDelta");
    const move = moveBlock(state, unitContaining(state, "Beta"), 1);
    expect(move?.changes.every((change) => change.from >= "Alpha\n\n".length && change.to <= "Alpha\n\nBeta\n\nGamma".length)).toBe(true);
  });
});

describe("dropBlock", () => {
  const doc = "Alpha\n\nBeta\n\nGamma\n";

  test("dropping a top-level block at the end, start, and middle reorders the document", () => {
    expect(dropped(doc, "Alpha", 3)).toEqual({ doc: "Beta\n\nGamma\n\nAlpha\n", selected: "Alpha" });
    expect(dropped(doc, "Gamma", 0)).toEqual({ doc: "Gamma\n\nAlpha\n\nBeta\n", selected: "Gamma" });
    expect(dropped(doc, "Alpha", 2)).toEqual({ doc: "Beta\n\nAlpha\n\nGamma\n", selected: "Alpha" });
    expect(dropped(doc, "Gamma", 1)).toEqual({ doc: "Alpha\n\nGamma\n\nBeta\n", selected: "Gamma" });
  });

  test("dropping a block onto its own position does nothing", () => {
    const state = stateOf(doc);
    const beta = unitContaining(state, "Beta");
    expect(dropBlock(state, beta, 1)).toBeNull();
    expect(dropBlock(state, beta, 2)).toBeNull();
    expect(dropBlock(state, beta, 4)).toBeNull();
    expect(dropBlock(state, beta, -1)).toBeNull();
  });

  test("a list item dropped within its list uses the list's separator there", () => {
    expect(dropped("- a\n- b\n- c\n", "a", 3)).toEqual({ doc: "- b\n- c\n- a\n", selected: "- a" });
    expect(dropped("- a\n- b\n- c\n", "c", 0)).toEqual({ doc: "- c\n- a\n- b\n", selected: "- c" });
    expect(dropped("- a\n\n- b\n\n- c", "c", 1)).toEqual({ doc: "- a\n\n- c\n\n- b", selected: "- c" });
  });

  test("a heading dropped between a tight pair takes the gap found there", () => {
    expect(dropped("Intro\n\n- a\n- b\n\n# End\n", "End", 1).doc).toBe("Intro\n\n# End\n\n- a\n- b\n");
  });

  test("dropping a nested item reorders only its own list", () => {
    expect(dropped("- p\n  - x\n  - y\n  - z\n- q\n", "x", 3).doc).toBe("- p\n  - y\n  - z\n  - x\n- q\n");
  });

  test("dropping within an ordered list renumbers it", () => {
    expect(dropped("1. a\n2. b\n3. c\n", "a", 3)).toEqual({ doc: "1. b\n2. c\n3. a\n", selected: "3. a" });
  });
});
