"use client";

// Reads resolved token colours off <html> rather than re-deriving from editor's knobs, so ratio is true for every skin, mode, and derived token.

import { cssColorToRgb, hexToOklch, oklchToHex, oklchToRgb, type Rgb } from "./color-utils";

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

// gamma-corrected sRGB, unlike readableOn's cheap perceptual approximation
function luminanceFromRgb([r, g, b]: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastFromRgb(a: Rgb, b: Rgb): number {
  const la = luminanceFromRgb(a) + 0.05;
  const lb = luminanceFromRgb(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}

// canvas round-trip is what makes this format-proof: scraping getComputedStyle().color assumes rgb() and mis-reads oklch L/C/H as r/g/b.
export function readVarRgb(name: string): Rgb | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? cssColorToRgb(raw) : null;
}

// AA = 4.5:1, AAA = 7:1
export type WcagLevel = "AA" | "AAA";
export type WcagLevels = { AA: boolean; AAA: boolean };

export const AA_RATIO = 4.5;
export const AAA_RATIO = 7;
export const TARGET_RATIO: Record<WcagLevel, number> = { AA: AA_RATIO, AAA: AAA_RATIO };

export function wcagLevels(ratio: number): WcagLevels {
  return { AA: ratio >= AA_RATIO, AAA: ratio >= AAA_RATIO };
}

// AA first, then AAA once AA holds, then nothing
export function nextFixLevel(levels: WcagLevels): WcagLevel | null {
  if (!levels.AA) return "AA";
  if (!levels.AAA) return "AAA";
  return null;
}

// Every row is fixable same way — nudge pair's text token until it clears target against live background.
export type ContrastPair = { label: string; fg: string; bg: string };

export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { label: "Body text", fg: "--card-foreground", bg: "--card" },
  { label: "Muted text", fg: "--muted-foreground", bg: "--card" },
  { label: "Text on canvas", fg: "--foreground", bg: "--canvas" },
  { label: "Brand button", fg: "--primary-foreground", bg: "--primary" },
  { label: "Destructive button", fg: "--destructive-foreground", bg: "--destructive" },
];

// Reachability is per-pairing: near-white surface reaches ~21:1, mid-tone one cannot clear 7:1, so unreachable target must never be offered as dead button.
export function offeredFixLevel(levels: WcagLevels, reachableRatio: number = Number.POSITIVE_INFINITY): WcagLevel | null {
  const next = nextFixLevel(levels);
  if (next === null) return null;
  return reachableRatio >= TARGET_RATIO[next] ? next : null;
}

// Holds chroma and hue, matching fixTextForeground's search space.
export function maxForegroundRatio(fgHex: string, backgrounds: Rgb[]): number {
  if (backgrounds.length === 0) return 0;
  const { C, H } = hexToOklch(fgHex);
  const worst = (L: number) => Math.min(...backgrounds.map((bg) => contrastFromRgb(oklchToRgb(L, C, H), bg)));
  return Math.max(worst(0), worst(1));
}

export type ContrastRow = ContrastPair & { ratio: number | null; levels: WcagLevels };

// `read` is injected so analysis stays unit-testable without DOM
export function analyzeContrast(read: (name: string) => Rgb | null): ContrastRow[] {
  return CONTRAST_PAIRS.map((pair) => {
    const fg = read(pair.fg);
    const bg = read(pair.bg);
    const ratio = fg && bg ? contrastFromRgb(fg, bg) : null;
    return { ...pair, ratio, levels: ratio === null ? { AA: false, AAA: false } : wcagLevels(ratio) };
  });
}

// null ratio is unreadable token, not actionable failure
export function textFailsAA(rows: ContrastRow[]): boolean {
  return rows.some((r) => r.ratio !== null && r.ratio < AA_RATIO);
}

// Nudges lightness in OKLCH with hue and chroma held, so palette identity survives. Returns smallest passing move, or extreme with best worst case when nothing reaches target.
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
  // nothing passed — take whichever extreme maximises worst-case ratio
  return worst(oklchToRgb(0, C, H)) >= worst(oklchToRgb(1, C, H)) ? oklchToHex(0, C, H) : oklchToHex(1, C, H);
}
