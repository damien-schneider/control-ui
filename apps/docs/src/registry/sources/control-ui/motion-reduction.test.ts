import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("./theme.css", import.meta.url), "utf8");
const XP_SKIN = readFileSync(new URL("../../skin-packs/xp/skin.css", import.meta.url), "utf8");
const LIQUID_METAL_SKIN = readFileSync(new URL("../../skin-packs/liquid-metal/skin.css", import.meta.url), "utf8");
const LIQUID_METAL_RUNTIME = readFileSync(new URL("../../skin-packs/liquid-metal/liquid-metal-runtime.tsx", import.meta.url), "utf8");

describe("reduced motion contract", () => {
  test("the manual kill-switch wins over skin-scoped and inline duration tokens", () => {
    expect(CSS).toContain(':root[data-motion="reduced"],');
    expect(CSS).toContain('[data-motion="reduced"][data-skin],');
    expect(CSS).toContain('[data-motion="reduced"] [data-skin]');
    expect(CSS.match(/--duration-(fast|base|slow): 0ms !important;/g)?.length).toBeGreaterThanOrEqual(6);
  });

  test("forced reduced motion also clamps hardcoded utility motion", () => {
    expect(CSS).toContain('[data-motion="reduced"] *::after');
    expect(CSS).toContain("scroll-behavior: auto !important;");
    expect(CSS).toContain("transition-duration: 0ms !important;");
    expect(CSS).toContain("animation-duration: 1ms !important;");
    expect(CSS).toContain("animation-iteration-count: 1 !important;");
  });

  test("chat surfaces have token-driven entrance motion", () => {
    expect(CSS).toContain("@starting-style");
    expect(CSS).toContain('[data-control-ui="chat-message"]');
    expect(CSS).toContain("filter: blur(8px);");
    expect(CSS).toContain("translate: 0 0.5rem;");
    expect(CSS).toContain('[data-control-ui="chat-composer"]');
    expect(CSS).toContain("filter: blur(10px);");
    expect(CSS).toContain("translate: 0 0.75rem;");
  });

  test("tabs panels have token-driven switching motion", () => {
    expect(CSS).toContain('[data-control-ui="tabs"][data-slot="panel"]');
    // Slide-only: content stays opaque so a switch never flashes an empty frame; the full-width cross-slide rides --duration-slow.
    expect(CSS).toContain("translate var(--duration-slow) var(--ease-emphasized)");
    expect(CSS).toContain('[data-activation-direction="right"]');
  });

  test("tabs and controls keep fast standard feedback motion", () => {
    expect(CSS).toContain("background-color var(--duration-fast) var(--ease-standard)");
    expect(CSS).toContain("box-shadow var(--duration-fast) var(--ease-standard)");
    expect(CSS).toContain("transition: color var(--duration-fast) var(--ease-standard);");
  });

  test("skin motion overrides stay token-driven", () => {
    expect(XP_SKIN).toContain("transition: color var(--duration-fast) var(--ease-standard);");
    expect(XP_SKIN).not.toContain("transition: none;");
    expect(LIQUID_METAL_SKIN).toContain("transition: opacity var(--duration-fast) var(--ease-standard);");
    expect(LIQUID_METAL_RUNTIME).toContain('transition: "opacity var(--duration-fast) var(--ease-standard)"');
  });
});
