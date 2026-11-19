import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const RESIZABLE_CSS = readFileSync(new URL("./recipes/resizable.css", import.meta.url), "utf8");
const SIDEBAR_PARTS_CSS = readFileSync(new URL("./recipes/sidebar-parts.css", import.meta.url), "utf8");

function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`${selector} not found`);
  return css.slice(start, css.indexOf("}", start));
}

describe("a resize handle line", () => {
  test("is one solid colour along a panel splitter", () => {
    const line = ruleBody(RESIZABLE_CSS, ':where([data-control-family="resizable"][data-slot="handle"][data-variant="hover"])::before');
    expect(RESIZABLE_CSS).not.toContain("gradient");
    expect(line).toContain("background-color");
  });

  test("is one solid colour along a resizable sidebar rail", () => {
    const line = ruleBody(SIDEBAR_PARTS_CSS, ':where([data-control-family="sidebar"][data-slot="rail"][data-resizable])::after');
    expect(line).not.toContain("gradient");
    expect(line).toContain("background-color");
  });
});
