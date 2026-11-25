import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const TABS_CSS = readFileSync(new URL("./recipes/tabs.css", import.meta.url), "utf8");
const fadeBlock = TABS_CSS.slice(
  TABS_CSS.indexOf("@supports (animation-timeline: scroll())"),
  TABS_CSS.indexOf("@keyframes cui-tabs-scroll-fade-start"),
);

test("scrollable tab lists fade their edges only where scroll timelines exist", () => {
  expect(fadeBlock.length).toBeGreaterThan(0);
  expect(fadeBlock).toContain("mask-image: linear-gradient(");
  expect(TABS_CSS.slice(0, TABS_CSS.indexOf("@supports (animation-timeline: scroll())"))).not.toContain("mask-image");
});

test("the fade sizes are registered lengths that rest at zero, so a list that fits never fades", () => {
  for (const name of ["--_tabs-scroll-fade-start", "--_tabs-scroll-fade-end"]) {
    expect(TABS_CSS).toMatch(
      new RegExp(`@property ${name} \\{\\s*syntax: "<length-percentage>";\\s*inherits: false;\\s*initial-value: 0px;`),
    );
  }
  expect(fadeBlock).toContain("animation-timeline: scroll(self inline), scroll(self inline);");
  expect(fadeBlock).toContain("animation-timeline: scroll(self block), scroll(self block);");
});

test("the fade size is a documented knob", () => {
  expect(TABS_CSS).toContain("--cui-tabs-scroll-fade-size: calc(var(--spacing) * 6);");
  expect(TABS_CSS).toMatch(/@property --cui-tabs-scroll-fade-size \{\s*syntax: "<length-percentage>";/);
});

test("right-to-left lists mirror the fade and vertical lists fade top to bottom", () => {
  expect(fadeBlock).toMatch(/:not\(\[data-orientation="vertical"\]\):dir\(rtl\)\) \{\s*--_tabs-scroll-fade-direction: to left;/);
  expect(fadeBlock).toMatch(/\[data-orientation="vertical"\]\) \{\s*--_tabs-scroll-fade-direction: to bottom;/);
});

test("keyboard focus scrolls a tab clear of the fade, so its focus ring stays visible", () => {
  expect(fadeBlock).toContain("scroll-padding-inline: calc(var(--cui-tabs-list-padding) + var(--cui-tabs-scroll-fade-size));");
  expect(fadeBlock).toContain("scroll-padding-block: calc(var(--cui-tabs-list-padding) + var(--cui-tabs-scroll-fade-size));");
});
