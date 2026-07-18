import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

/*
 * Concentric-corner safety for Control UI floating surfaces (select/menu popups, code-block panel): a rounded child clipped by a rounded overflow-hidden container gets its corner sliced flat unless it nests fully inside the container's corner.
 * 2 failure modes: (1) popup rows — browser caps rendered border-radius at HALF box height, so --radius-popover is built off the height-FITTED row radius (self-limiting); (2) panel header tabs — --radius-panel scales unbound but tab inset is fixed, clipped once R > (2+√2)·gap (positional, no child radius saves it) — panel corner capped at --nest-gap·--nest-corner-ratio.
 * Clipped containers use a RING (box-shadow) not a border, so clip sits at FULL radius; this evaluates the Refined skin's real tokens across a --radius/--control-h sweep, asserting containment at every sample (+ negative controls proving each guard works).
 */

const CSS = readFileSync(new URL("../../skin-packs/refined/theme.css", import.meta.url), "utf8");

// --- tiny CSS value evaluator: var() / calc() / min() / max() / clamp() / px / rem -------------

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

const decls = parseDecls(CSS);

// --- geometry: does the child's rendered corner nest inside the container's clipped corner? -------

// Clipped containers use a ring (box-shadow), so overflow clip sits at FULL border-radius — no border-width to subtract (was 1px when these used a CSS border).
const BORDER = 0;

/** Signed clearance (px) between the child corner circle and the clip corner circle. >= 0 ⇒ contained. */
function clearance(containerR: number, childRenderedR: number, gap: number): number {
  const clipR = Math.max(0, containerR - BORDER);
  // Child inset past corner arc sits in straight-edge zone, can't be corner-clipped (arc spans only first clipR px from corner).
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
  const resolve = makeResolver(decls, { "--radius": radiusPx, "--control-h": controlHxsPx / XS_RATIO });
  return {
    padding: resolve("--popover-padding"),
    controlHxs: resolve("--control-h-xs"),
    nestSafe: resolve("--nest-safe"),
    cornerRatio: resolve("--nest-corner-ratio"),
    popoverItemToken: resolve("--radius-popup-item"),
    popoverContainerR: resolve("--radius-popover"),
    panelR: resolve("--radius-panel"),
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
    const naive = s.popoverItemToken + s.padding + s.nestSafe; // old bug: off the unclamped token
    expect(clearance(naive, rowRendered, s.padding)).toBeLessThan(0);
    expect(clearance(s.popoverContainerR, rowRendered, s.padding)).toBeGreaterThanOrEqual(MARGIN);
  });
});

describe("code-block panel: capped corner keeps header tabs (inset --nest-gap) uncut", () => {
  const NEST_GAP = 8; // the figure sets [--nest-gap:0.5rem]

  test("tab corner stays inside the capped panel corner (sweep)", () => {
    const failures: string[] = [];
    for (const hxs of CONTROL_HEIGHTS_XS) {
      for (const radius of RADII) {
        const s = sample(radius, hxs);
        const containerR = Math.min(s.panelR, NEST_GAP * s.cornerRatio); // the --nest-radius cap
        const tabTarget = Math.max(0, containerR - NEST_GAP - s.nestSafe); // rounded-nested
        const tabRendered = Math.min(tabTarget, s.controlHxs / 2);
        if (containerR <= 0.01) continue; // square panel, square tabs — nothing to clip
        const gap = clearance(containerR, tabRendered, NEST_GAP);
        if (gap < MARGIN) {
          failures.push(
            `r=${radius} hxs≈${s.controlHxs.toFixed(1)}: clearance ${gap.toFixed(2)}px (R ${containerR.toFixed(1)}, tab ${tabRendered.toFixed(1)})`,
          );
        }
      }
    }
    expect(failures).toEqual([]);
  });

  test("negative control: the UNCAPPED panel radius (--radius-panel) cuts header tabs at large --radius", () => {
    const s = sample(40, 28.08); // --radius-panel = 40*2.6 = 104px, way past (2+√2)·gap
    const tabRendered = Math.min(s.controlHxs / 2, s.controlHxs / 2);
    expect(clearance(s.panelR, tabRendered, NEST_GAP)).toBeLessThan(0); // uncapped ⇒ tab sliced
    const capped = Math.min(s.panelR, NEST_GAP * s.cornerRatio);
    expect(clearance(capped, tabRendered, NEST_GAP)).toBeGreaterThanOrEqual(MARGIN); // cap ⇒ safe
  });
});
