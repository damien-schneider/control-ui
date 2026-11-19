import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const BUTTON_CSS = readFileSync(new URL("./recipes/button.css", import.meta.url), "utf8");

function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`${selector} not found`);
  return css.slice(start, css.indexOf("}", start));
}

describe("a pressed surface toggle", () => {
  const surface = ruleBody(BUTTON_CSS, ':where([data-control-family="button"][data-variant="surface"])');

  test("keeps the same rim as its unpressed siblings", () => {
    expect(surface).not.toContain("--cui-button-active-shadow");
  });

  test("keeps a full-strength label instead of a tinted one", () => {
    expect(surface).not.toContain("--cui-button-active-foreground");
  });

  test("still marks the selection with a fill", () => {
    expect(surface).toContain("--cui-button-active-background");
  });
});
