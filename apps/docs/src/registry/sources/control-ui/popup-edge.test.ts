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
    const dividerWidths = [...POPUP_PARTS_CSS.matchAll(/border-block-(?:start|end): (\S+) solid var\(--cui-popup-separator-color\);/g)].map(
      ([, width]) => width,
    );

    expect(POPUP_CSS).toContain("--cui-popup-border-width: var(--control-rim-width);");
    expect(POPUP_PARTS_CSS).toMatch(/\[data-popup-part="separator"\]\) \{[^}]*block-size: var\(--control-rim-width\);/);
    expect(dividerWidths.length).toBeGreaterThan(0);
    expect(new Set(dividerWidths)).toEqual(new Set(["var(--control-rim-width)"]));
  });

  test("in refined, name the same rim the floating shadow draws", () => {
    expect(REFINED_CSS).toContain("0 0 0 var(--control-rim-width) var(--refined-floating-rim),");
    expect(REFINED_CSS).toContain("--cui-popup-border-color: var(--refined-floating-rim);");
  });
});
