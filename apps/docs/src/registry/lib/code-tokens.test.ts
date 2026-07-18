import { describe, expect, test } from "bun:test";
import { CODE_VARIABLE_PREFIX, highlightToTokens, mergeCodeTokenLineWithEmphasis, normalizeLanguage } from "./code-tokens";

describe("normalizeLanguage", () => {
  test("maps aliases to a supported grammar", () => {
    expect(normalizeLanguage("ts")).toBe("typescript");
    expect(normalizeLanguage("TSX")).toBe("tsx");
    expect(normalizeLanguage("sh")).toBe("bash");
    expect(normalizeLanguage("diff")).toBe("diff");
  });

  test("returns undefined for unknown or empty", () => {
    expect(normalizeLanguage("brainfuck")).toBeUndefined();
    expect(normalizeLanguage(null)).toBeUndefined();
    expect(normalizeLanguage(undefined)).toBeUndefined();
  });
});

describe("highlightToTokens", () => {
  test("returns null for an unknown language (plain-text fallback)", async () => {
    expect(await highlightToTokens("hello", "brainfuck")).toBeNull();
  });

  test("colors tokens with CSS variables driven by the skin, not baked hex", async () => {
    const lines = await highlightToTokens("const x = 1;", "ts");
    expect(lines).not.toBeNull();
    const colors = (lines ?? []).flat().flatMap((token) => (token.style?.color ? [token.style.color] : []));
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.every((color) => color.startsWith(`var(${CODE_VARIABLE_PREFIX}`))).toBe(true);
  });

  test("preserves line structure and content", async () => {
    const lines = await highlightToTokens("const a = 1;\nconst b = 2;", "ts");
    expect(lines).toHaveLength(2);
    expect((lines ?? [])[0].map((token) => token.content).join("")).toBe("const a = 1;");
  });

  test("second call is served from cache (identical result)", async () => {
    const a = await highlightToTokens("let y = 2;", "ts");
    const b = await highlightToTokens("let y = 2;", "ts");
    expect(a).toBe(b);
  });
});

describe("mergeCodeTokenLineWithEmphasis", () => {
  test("preserves syntax style when an emphasis boundary splits a token", () => {
    const functionStyle = { color: "var(--code-token-function)" };
    const runs = mergeCodeTokenLineWithEmphasis(
      "input.trim()",
      [
        { content: "input.trim", style: functionStyle },
        { content: "()", style: { color: "var(--code-foreground)" } },
      ],
      [
        { text: "input.", emphasis: false },
        { text: "trim()", emphasis: true },
      ],
    );

    expect(runs.map((run) => run.content).join("")).toBe("input.trim()");
    expect(runs.find((run) => run.content === "trim")).toEqual({ content: "trim", style: functionStyle, emphasis: true });
  });

  test("keeps emphasis when syntax tokens are missing or invalid", () => {
    const segments = [
      { text: "before", emphasis: false },
      { text: " after", emphasis: true },
    ];

    expect(mergeCodeTokenLineWithEmphasis("before after", null, segments)).toEqual([
      { content: "before", emphasis: false },
      { content: " after", emphasis: true },
    ]);
    expect(
      mergeCodeTokenLineWithEmphasis("before after", [{ content: "wrong" }], segments)
        .map((run) => run.content)
        .join(""),
    ).toBe("before after");
  });
});
