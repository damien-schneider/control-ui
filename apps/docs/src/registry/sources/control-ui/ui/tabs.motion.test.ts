import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../theme.css", import.meta.url), "utf8");
const TABS_TSX = readFileSync(new URL("./tabs.tsx", import.meta.url), "utf8");

// Base UI keeps exiting Tabs.Panel mounted (inert + data-ending-style) until its exit animation ends.
// Modern path: the exiting panel is revived and glued edge-to-edge onto the entering panel's box via
// anchor positioning, so the entering panel's ±100% slide drives the pair as one strip. Fallback path:
// two in-flow panels would stack, so the exiting panel is hidden the moment it's inert.
describe("Control UI tabs panel switch", () => {
  test("fallback pulls the exiting (inert) panel out of the box immediately", () => {
    expect(CSS).toMatch(/\[data-control-ui="tabs"\]\[data-slot="panel"\]\[inert\]\)\s*\{\s*display:\s*none;/);
  });

  test("cross-slide is gated behind anchor positioning support", () => {
    expect(CSS).toMatch(/@supports \(\(anchor-name: --aui-tabs-panel\) and \(anchor-scope: --aui-tabs-panel\)\)/);
  });

  test("the exiting panel is revived and clipped to the entering panel's box", () => {
    expect(CSS).toMatch(/\[data-control-ui="tabs"\]\[data-slot="panel"\]\[inert\]\[data-ending-style\]\)\s*\{\s*display:\s*block;/);
    expect(CSS).toContain("position-anchor: --aui-tabs-panel;");
    expect(CSS).toContain("width: anchor-size(width);");
  });

  test("anchor names are scoped per Tabs instance so parallel instances never cross-anchor", () => {
    expect(CSS).toMatch(/\[data-control-ui="tabs"\]\[data-slot="root"\]\)\s*\{\s*anchor-scope: --aui-tabs-panel;/);
  });

  test("the exiting panel is glued to the strip's trailing edge, not translated on its own", () => {
    // Own translate would double-animate against the anchor tracking the entering panel's moving box.
    expect(CSS).not.toMatch(/\[data-ending-style\]\[data-activation-direction="[a-z]+"\]\)\s*\{[^}]*translate:/);
    expect(CSS).toMatch(/\[data-ending-style\]\[data-activation-direction="right"\]\)\s*\{\s*top: anchor\(top\);\s*right: anchor\(left\);/);
    expect(CSS).toMatch(/\[data-ending-style\]\[data-activation-direction="left"\]\)\s*\{\s*top: anchor\(top\);\s*left: anchor\(right\);/);
  });

  test("a hold animation keeps the exiting panel mounted for the slide's duration", () => {
    // Base UI unmounts on animations-finished; the anchor glue is not an animation, so without this the exit is instant.
    expect(CSS).toContain("animation: aui-tabs-exit-hold var(--duration-slow) var(--ease-emphasized) both;");
    expect(CSS).toContain("@keyframes aui-tabs-exit-hold");
  });

  test("the entering panel slides in a full panel-width, direction-aware", () => {
    expect(CSS).toMatch(/\[data-starting-style\]\[data-activation-direction="right"\]\)\s*\{\s*translate:\s*100% 0;/);
    expect(CSS).toMatch(/\[data-starting-style\]\[data-activation-direction="left"\]\)\s*\{\s*translate:\s*-100% 0;/);
  });

  test("the strip's height morphs from the outgoing panel's measured height", () => {
    // auto→auto never transitions: tabs.tsx stamps the outgoing height on the root pre-switch, and
    // calc-size() makes the entering panel's auto endpoint interpolable. Scoped :not([inert]) so the
    // exiting panel keeps height: anchor-size(height) and shadows the morph.
    expect(CSS).toContain("@supports (height: calc-size(auto, size))");
    expect(CSS).toMatch(/\[data-control-ui="tabs"\]\[data-slot="panel"\]:not\(\[inert\]\)\)\s*\{\s*height: calc-size\(auto, size\);/);
    expect(CSS).toContain("height: var(--aui-tabs-prev-height, calc-size(auto, size));");
    expect(CSS).toContain("translate var(--duration-slow) var(--ease-emphasized), height var(--duration-slow) var(--ease-emphasized)");
    expect(TABS_TSX).toContain("--aui-tabs-prev-height");
    // The stamp is cleared right after the starting frame — a controlled switch that bypasses
    // onValueChange must never morph from a stale height.
    expect(TABS_TSX).toContain("removeProperty");
  });
});
