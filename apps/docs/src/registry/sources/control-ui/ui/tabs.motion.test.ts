import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../theme.css", import.meta.url), "utf8");
const TABS_TSX = readFileSync(new URL("./tabs.tsx", import.meta.url), "utf8");
const INLINE_CITATION_TSX = readFileSync(new URL("../inline-citation.tsx", import.meta.url), "utf8");

// cross-slide keys on data-slide, not on component, so any caller stamping same lifecycle attributes gets it.
// Where anchor positioning exists exiting panel is glued edge-to-edge onto entering one and pair slides as one
// strip; without it two in-flow panels would stack, so exiting one is hidden once inert.
describe("Control UI cross-slide panel switch", () => {
  test("tabs panels and inline citation sources both opt into the shared contract", () => {
    expect(TABS_TSX).toContain('data-slide="scope"');
    expect(TABS_TSX).toContain('data-slide="panel"');
    expect(INLINE_CITATION_TSX).toContain('data-slide="scope"');
    expect(INLINE_CITATION_TSX).toContain('data-slide="panel"');
  });

  test("fallback pulls the exiting (inert) panel out of the box immediately", () => {
    expect(CSS).toMatch(/\[data-slide="panel"\]\[inert\]\)\s*\{\s*display:\s*none;/);
  });

  test("cross-slide is gated behind anchor positioning support", () => {
    expect(CSS).toMatch(/@supports \(\(anchor-name: --aui-slide-panel\) and \(anchor-scope: --aui-slide-panel\)\)/);
    // caller that hand-rolls swap must gate its exiting clone on same support, or nothing unmounts it.
    expect(INLINE_CITATION_TSX).toContain("(anchor-name: --aui-slide-panel) and (anchor-scope: --aui-slide-panel)");
  });

  test("the exiting panel is revived and clipped to the entering panel's box", () => {
    expect(CSS).toMatch(/\[data-slide="panel"\]\[inert\]\[data-ending-style\]\)\s*\{\s*display:\s*block;/);
    expect(CSS).toContain("position-anchor: --aui-slide-panel;");
    expect(CSS).toContain("width: anchor-size(width);");
  });

  test("anchor names are scoped per switching surface so parallel instances never cross-anchor", () => {
    expect(CSS).toMatch(/\[data-slide="scope"\]\)\s*\{\s*anchor-scope: --aui-slide-panel;/);
  });

  test("the exiting panel is glued to the strip's trailing edge, not translated on its own", () => {
    // Own translate would double-animate against anchor tracking entering panel's moving box.
    expect(CSS).not.toMatch(/\[data-ending-style\]\[data-activation-direction="[a-z]+"\]\)\s*\{[^}]*translate:/);
    expect(CSS).toMatch(/\[data-ending-style\]\[data-activation-direction="right"\]\)\s*\{\s*top: anchor\(top\);\s*right: anchor\(left\);/);
    expect(CSS).toMatch(/\[data-ending-style\]\[data-activation-direction="left"\]\)\s*\{\s*top: anchor\(top\);\s*left: anchor\(right\);/);
  });

  test("a hold animation keeps the exiting panel mounted for the slide's duration", () => {
    // Base UI unmounts on animations-finished; anchor glue is not animation, so without this exit is instant.
    expect(CSS).toContain("animation: aui-slide-exit-hold var(--duration-slow) var(--ease-emphasized) both;");
    expect(CSS).toContain("@keyframes aui-slide-exit-hold");
    // Inline citation drops its clone on same signal.
    expect(INLINE_CITATION_TSX).toContain("onAnimationEnd");
  });

  test("the entering panel slides in a full panel-width, direction-aware", () => {
    expect(CSS).toMatch(/\[data-slide="panel"\]\[data-starting-style\]\[data-activation-direction="right"\]\)\s*\{\s*translate:\s*100% 0;/);
    expect(CSS).toMatch(/\[data-slide="panel"\]\[data-starting-style\]\[data-activation-direction="left"\]\)\s*\{\s*translate:\s*-100% 0;/);
  });

  test("the strip's height morphs from the outgoing panel's measured height", () => {
    // auto→auto never transitions: component stamps outgoing height pre-switch, and calc-size()
    // makes entering panel's auto endpoint interpolable. Scoped :not([inert]) so exiting panel
    // keeps height: anchor-size(height) and shadows morph.
    expect(CSS).toContain("@supports (height: calc-size(auto, size))");
    expect(CSS).toMatch(/\[data-slide="panel"\]:not\(\[inert\]\)\)\s*\{\s*height: calc-size\(auto, size\);/);
    expect(CSS).toContain("height: var(--aui-slide-prev-height, calc-size(auto, size));");
    expect(CSS).toContain("translate var(--duration-slow) var(--ease-emphasized), height var(--duration-slow) var(--ease-emphasized)");
    expect(TABS_TSX).toContain("--aui-slide-prev-height");
    expect(INLINE_CITATION_TSX).toContain("--aui-slide-prev-height");
    // stamp is cleared right after starting frame — controlled switch that bypasses
    // onValueChange must never morph from stale height.
    expect(TABS_TSX).toContain("removeProperty");
  });
});
