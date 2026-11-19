import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const POPUP_CSS = read("./recipes/popup.css");
const POPUP_PARTS_CSS = read("./recipes/popup-lists.css") + read("./recipes/popup-controls.css");
const REFINED_CSS = read("../../skin-packs/refined/skin.css");

describe("dividers inside a popup", () => {
  test("take the popup edge colour, so a skin restyling the edge restyles them too", () => {
    expect(POPUP_CSS).toContain("--cui-popup-separator-color: var(--cui-popup-border-color);");
  });

  test("are as thin as the popup edge", () => {
    expect(POPUP_PARTS_CSS).not.toMatch(/1px solid var\(--cui-popup-separator-color\)|block-size: 1px;/);
  });

  test("in refined, name the same rim the floating shadow draws", () => {
    expect(REFINED_CSS).toContain("0 0 0 var(--control-rim-width) var(--refined-floating-rim),");
    expect(REFINED_CSS).toContain("--cui-popup-border-color: var(--refined-floating-rim);");
  });
});
