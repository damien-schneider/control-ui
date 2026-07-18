"use client";

// WCAG 2.x contrast: checker reads *resolved* token colors off <html>, not re-derived hex knobs — honest for every skin/mode (scoped tokens, .dark stack, derived tokens all show true rendered ratio).
// Trade-off: truthful, not corrective, when editor doesn't own tokens — auto-fix gated to preset-backed skin in light mode (see ContrastPanel).

import { cssColorToRgb, hexToOklch, oklchToHex, oklchToRgb, type Rgb } from "./color-utils";

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

// WCAG relative luminance — gamma-corrected sRGB, unlike readableOn's cheap perceptual approximation.
function luminanceFromRgb([r, g, b]: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastFromRgb(a: Rgb, b: Rgb): number {
  const la = luminanceFromRgb(a) + 0.05;
  const lb = luminanceFromRgb(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}

// Reads token off <html>, resolves to sRGB via shared canvas round-trip (cssColorToRgb) — format-proof across oklch()/lab()/lch()/color()/calc-backed values like --muted-foreground.
// Naive getComputedStyle().color scraping assumed rgb() and mis-read oklch L/C/H as r/g/b.
// Round-trip is what makes readout truthful on every skin.
export function readVarRgb(name: string): Rgb | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? cssColorToRgb(raw) : null;
}

// Grading: AA=4.5:1, AAA=7:1 thresholds; shown as separate pass/fail pills per row (not one collapsed grade) so headroom is visible at a glance.
export type WcagLevel = "AA" | "AAA";
export type WcagLevels = { AA: boolean; AAA: boolean };

export const AA_RATIO = 4.5;
export const AAA_RATIO = 7;
export const TARGET_RATIO: Record<WcagLevel, number> = { AA: AA_RATIO, AAA: AAA_RATIO };

export function wcagLevels(ratio: number): WcagLevels {
  return { AA: ratio >= AA_RATIO, AAA: ratio >= AAA_RATIO };
}

// Level a per-row fix aims for: AA first, then AAA once AA holds, then nothing — lets panel show a fix chip on a failing row, or offer → AAA once every row clears AA.
export function nextFixLevel(levels: WcagLevels): WcagLevel | null {
  if (!levels.AA) return "AA";
  if (!levels.AAA) return "AAA";
  return null;
}

// Live readout: pairs checker inspects, keyed by tokens actually rendered.
// Every row fixable the SAME way — nudge pair's text token (fg) until it clears target against live background (bg); no per-knob special-casing, works on any skin/mode.
export type ContrastPair = { label: string; fg: string; bg: string };

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { label: "Body text", fg: "--card-foreground", bg: "--card" },
  { label: "Muted text", fg: "--muted-foreground", bg: "--card" },
  { label: "Text on canvas", fg: "--foreground", bg: "--canvas" },
  { label: "Brand button", fg: "--primary-foreground", bg: "--primary" },
  { label: "Destructive button", fg: "--destructive-foreground", bg: "--destructive" },
];

// Level a row's fix chip offers: next unmet level, only if REACHABLE on this pairing.
// Reachability dynamic: near-white/near-black surface reaches ~21:1 (AAA easy), mid-tone surface can't clear 7:1 — AAA upgrade must not be offered.
// Caller passes reachableRatio (from maxForegroundRatio); no chip for unreachable target, never dead buttons.
export function offeredFixLevel(levels: WcagLevels, reachableRatio: number = Number.POSITIVE_INFINITY): WcagLevel | null {
  const next = nextFixLevel(levels);
  if (next === null) return null;
  return reachableRatio >= TARGET_RATIO[next] ? next : null;
}

// Best contrast a text fix can reach here: better of driving token darkest/lightest (chroma+hue held, matches fixTextForeground's search space).
// Near-white/near-black surface ~21; mid-tone surface can be under 7 — exactly when AAA upgrade must NOT be offered.
export function maxForegroundRatio(fgHex: string, backgrounds: Rgb[]): number {
  if (backgrounds.length === 0) return 0;
  const { C, H } = hexToOklch(fgHex);
  const worst = (L: number) => Math.min(...backgrounds.map((bg) => contrastFromRgb(oklchToRgb(L, C, H), bg)));
  return Math.max(worst(0), worst(1));
}

export type ContrastRow = ContrastPair & { ratio: number | null; levels: WcagLevels };

// Pure over injected `read` so analysis is unit-testable without DOM; app uses readVarRgb, tests use a lookup table of sRGB fixtures.
export function analyzeContrast(read: (name: string) => Rgb | null): ContrastRow[] {
  return CONTRAST_PAIRS.map((pair) => {
    const fg = read(pair.fg);
    const bg = read(pair.bg);
    const ratio = fg && bg ? contrastFromRgb(fg, bg) : null;
    return { ...pair, ratio, levels: ratio === null ? { AA: false, AAA: false } : wcagLevels(ratio) };
  });
}

// Does any readable row fail AA? (null ratio = unreadable token, not actionable.) Summarizes readout for footer hint.
export function textFailsAA(rows: ContrastRow[]): boolean {
  return rows.some((r) => r.ratio !== null && r.ratio < AA_RATIO);
}

// One abstract fix for EVERY row: nudge text lightness (hue+chroma held in OKLCH — palette identity survives, move perceptually uniform) until it clears target against HARDER surface.
// Scans both directions, returns smallest move that passes; if nothing reaches target, returns extreme with best worst-case contrast.
// Null when already passing.
export function fixTextForeground(fgHex: string, backgrounds: Rgb[], target: number = AA_RATIO): string | null {
  const { L, C, H } = hexToOklch(fgHex);
  const worst = (candidate: Rgb) => Math.min(...backgrounds.map((bg) => contrastFromRgb(candidate, bg)));
  if (worst(oklchToRgb(L, C, H)) >= target) return null;

  let best: { l: number; dist: number } | null = null;
  for (let step = 0; step <= 100; step++) {
    const cand = step / 100;
    if (worst(oklchToRgb(cand, C, H)) < target) continue;
    const dist = Math.abs(cand - L);
    if (!best || dist < best.dist) best = { l: cand, dist };
  }
  if (best) return oklchToHex(best.l, C, H);
  // Nothing passed: fall back to whichever extreme maximises the worst-case ratio.
  return worst(oklchToRgb(0, C, H)) >= worst(oklchToRgb(1, C, H)) ? oklchToHex(0, C, H) : oklchToHex(1, C, H);
}
