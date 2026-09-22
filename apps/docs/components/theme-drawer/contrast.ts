"use client";

// Reads resolved token colours off <html> rather than re-deriving from editor's knobs, so ratio is true for every skin, mode, and derived token.

import {
  AA_RATIO,
  contrastFromRgb,
  fitLightnessForContrast,
  hexToOklch,
  nextFixLevel,
  oklchToHex,
  oklchToRgb,
  type Rgb,
  TARGET_RATIO,
  type WcagLevel,
  type WcagLevels,
  wcagLevels,
} from "./color-math";
import { cssColorToRgb } from "./color-utils";

// canvas round-trip is what makes this format-proof: scraping getComputedStyle().color assumes rgb() and mis-reads oklch L/C/H as r/g/b.
export function readVarRgb(name: string): Rgb | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? cssColorToRgb(raw) : null;
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

// Hex-facing wrapper over the shared OKLCH lightness search; null when the colour already clears target.
export function fixTextForeground(fgHex: string, backgrounds: Rgb[], target: number = AA_RATIO): string | null {
  const fg = hexToOklch(fgHex);
  const fitted = fitLightnessForContrast(fg, backgrounds, target);
  return fitted === null ? null : oklchToHex(fitted, fg.C, fg.H);
}
