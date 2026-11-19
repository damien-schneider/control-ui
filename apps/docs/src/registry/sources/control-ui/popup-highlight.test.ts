import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const POPUP_CSS = readFileSync(new URL("./recipes/popup.css", import.meta.url), "utf8");

function knobDefault(name: string): string {
  const match = POPUP_CSS.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`${name} has no default`);
  return match[1].trim();
}

describe("a highlighted popup row", () => {
  test("is marked by its fill alone, without a rim", () => {
    expect(knobDefault("--cui-popup-item-highlight-shadow")).toBe("none");
  });

  test("still paints a fill", () => {
    expect(knobDefault("--cui-popup-item-highlight-background")).not.toBe("transparent");
  });

  test("keeps a system outline in forced colors", () => {
    expect(POPUP_CSS).toMatch(/@media \(forced-colors: active\)[\s\S]*?\[data-highlighted\][\s\S]*?outline:[^;]*Highlight/);
  });
});
