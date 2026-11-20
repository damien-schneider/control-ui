import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const SCROLL_AREA_CSS = readFileSync(new URL("./theme.css", import.meta.url), "utf8");

test("the edge distances written on every scroll frame stay on the viewport, so WebKit does not restyle every row", () => {
  for (const edge of ["x-start", "x-end", "y-start", "y-end"]) {
    expect(SCROLL_AREA_CSS).toMatch(
      new RegExp(`@property --scroll-area-overflow-${edge} \\{\\s*syntax: "<length>";\\s*inherits: false;\\s*initial-value: 0px;\\s*\\}`),
    );
  }
});
