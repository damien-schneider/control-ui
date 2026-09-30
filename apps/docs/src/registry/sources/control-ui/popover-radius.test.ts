import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

/*
 * rounded child clipped by rounded overflow-hidden container gets its corner sliced flat unless it nests fully inside
 * container's corner. Browsers cap rendered border-radius at half box height, so holder radii are built off the
 * height-fitted item radius.
 */

const CSS = readFileSync(new URL("../../skin-packs/refined/theme.css", import.meta.url), "utf8");
const CORE_CSS = readFileSync(new URL("./theme.css", import.meta.url), "utf8");

// handles var(), calc(), min(), max(), clamp(), px, and rem — nothing else

function parseDecls(css: string): Record<string, string> {
  const decls: Record<string, string> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, ""); // strip comments (a `;` inside one would mis-split)
  for (const m of clean.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (!(m[1] in decls)) decls[m[1]] = m[2].trim(); // first occurrence (:root precedes .dark / @theme)
  }
  return decls;
}

const REM = 16;

function evalNumeric(expr: string): number {
  let e = expr.trim();
  e = e.replace(/calc\(/g, "(");
  e = e.replace(/\bmin\(/g, "Math.min(");
  e = e.replace(/\bmax\(/g, "Math.max(");
  e = e.replace(/\bclamp\(/g, "__clamp(");
  e = e.replace(/\bround\(/g, "__round(");
  e = e.replace(/(\d*\.?\d+)rem/g, (_, n) => `(${Number(n) * REM})`);
  e = e.replace(/(\d*\.?\d+)px/g, (_, n) => `(${Number(n)})`);
  // eslint-disable-next-line no-new-func -- test-only, evaluates file-derived numeric expressions
  const fn = new Function("__clamp", "__round", `return (${e});`);
  return fn(
    (lo: number, val: number, hi: number) => Math.max(lo, Math.min(val, hi)),
    // CSS round(value, interval) — default (nearest) rounding, matching --control-h-* ramp snapping.
    (value: number, interval: number) => Math.round(value / interval) * interval,
  );
}

function makeResolver(declarations: Record<string, string>, overrides: Record<string, number>) {
  const cache = new Map<string, number>();
  function resolve(name: string): number {
    if (name in overrides) return overrides[name];
    const hit = cache.get(name);
    if (hit !== undefined) return hit;
    const raw = declarations[name];
    if (raw === undefined) throw new Error(`unknown token ${name}`);
    const substituted = raw.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, n) => `(${resolve(n)})`);
    const val = evalNumeric(substituted);
    cache.set(name, val);
    return val;
  }
  return resolve;
}

// core :where([data-skin]) defaults under pack's own declarations, like cascade at runtime
const decls = { ...parseDecls(CORE_CSS), ...parseDecls(CSS) };

// Clipped containers use ring (box-shadow), so overflow clip sits at FULL border-radius — no border-width to subtract (was 1px when these used CSS border).
const BORDER = 0;

/** Signed clearance (px) between child corner circle and clip corner circle. >= 0 ⇒ contained. */
function clearance(containerR: number, childRenderedR: number, gap: number): number {
  const clipR = Math.max(0, containerR - BORDER);
  // past arc child sits in straight-edge zone and cannot be corner-clipped
  if (gap >= clipR) return Number.POSITIVE_INFINITY;
  // clip corner-arc center (clipR, clipR); child corner-arc center (gap + childR, gap + childR).
  const d = Math.SQRT2 * Math.abs(clipR - gap - childRenderedR);
  return clipR - (d + childRenderedR); // child circle inside clip circle ⇔ d + childR <= clipR
}

const RADII = Array.from({ length: 41 }, (_, i) => i * 2); // 0..80px
const CONTROL_HEIGHTS_XS = [22, 28.08, 32, 36, 40, 52]; // px — the xs value we want to sweep
const XS_RATIO = 0.78; // --control-h-xs = --control-h * 0.78
const MARGIN = 1; // require at least 1px of breathing room, not mere tangency

function sample(radiusPx: number, controlHxsPx: number) {
  const resolve = makeResolver(decls, { "--radius": radiusPx, "--control-h": controlHxsPx / XS_RATIO, "--spacing": 4 });
  return {
    padding: resolve("--popover-padding"),
    controlHxs: resolve("--control-h-xs"),
    composerPadding: resolve("--composer-padding"),
    rimWidth: resolve("--control-rim-width"),
    controlR: resolve("--radius-control"),
    composerR: resolve("--radius-composer"),
    popoverItemToken: resolve("--radius-popup-item"),
    popoverContainerR: resolve("--radius-popover"),
  };
}

function collectSampleFailures(check: (radius: number, controlHeight: number) => string | null): string[] {
  const failures: string[] = [];
  for (const controlHeight of CONTROL_HEIGHTS_XS) {
    for (const radius of RADII) {
      const failure = check(radius, controlHeight);
      if (failure) failures.push(failure);
    }
  }
  return failures;
}

function popupRowFailure(radius: number, controlHeight: number): string | null {
  const s = sample(radius, controlHeight);
  const rowRendered = Math.min(s.popoverItemToken, s.controlHxs / 2);
  if (s.popoverContainerR <= 0.01 || rowRendered <= 0.01) {
    return rowRendered > 0.01 && s.popoverContainerR <= 0.01 ? `r=${radius} h=${controlHeight}: square box, round row` : null;
  }

  const gap = clearance(s.popoverContainerR, rowRendered, s.padding);
  if (gap >= MARGIN) return null;
  return `r=${radius} hxs≈${s.controlHxs.toFixed(1)}: clearance ${gap.toFixed(2)}px (R ${s.popoverContainerR.toFixed(1)}, row ${rowRendered.toFixed(1)})`;
}

describe("select/menu popup rows nest at every --radius", () => {
  test("rendered row corner stays inside the clipped popup corner (sweep)", () => {
    expect(collectSampleFailures(popupRowFailure)).toEqual([]);
  });

  test("negative control: building the popup radius off the UNCLAMPED row token would cut at large --radius", () => {
    const s = sample(48, 28.08);
    const rowRendered = Math.min(s.popoverItemToken, s.controlHxs / 2);
    const naive = s.popoverItemToken + s.padding; // old bug: off the unclamped token
    expect(clearance(naive, rowRendered, s.padding)).toBeLessThan(0);
    expect(clearance(s.popoverContainerR, rowRendered, s.padding)).toBeGreaterThanOrEqual(MARGIN);
  });
});

describe("chat composer shell nests its xs actions at every --radius", () => {
  test("shell radius minus its inset equals the rendered action radius (sweep)", () => {
    const failures = collectSampleFailures((radius, controlHeight) => {
      const s = sample(radius, controlHeight);
      const actionRendered = Math.min(s.controlR, s.controlHxs / 2);
      const inset = s.composerPadding + s.rimWidth;
      const expected = actionRendered > 0 ? actionRendered + inset : 0;
      if (Math.abs(s.composerR - expected) < 0.01) return null;
      return `r=${radius} hxs≈${s.controlHxs.toFixed(1)}: shell ${s.composerR.toFixed(2)}, expected ${expected.toFixed(2)}`;
    });
    expect(failures).toEqual([]);
  });
});
