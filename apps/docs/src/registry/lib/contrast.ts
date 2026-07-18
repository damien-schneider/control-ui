// WCAG 2.x contrast for ColorPicker a11y advice; pure+SSR-safe
// "fix" nudges OKLCH lightness (hue+chroma held, so identity survives, move stays perceptually uniform) until it clears target ratio vs background
// adapted from theme-drawer's fixTextForeground; copied not imported (primitive installs by file-copy)

import { type Hsva, hsvaToOklcha, hsvaToRgba, oklchaToHsva, type Rgba } from "./color";

export type WcagLevel = "AA" | "AAA";
export type WcagLevels = { AA: boolean; AAA: boolean };

export const AA_RATIO = 4.5;
export const AAA_RATIO = 7;
export const TARGET_RATIO: Record<WcagLevel, number> = { AA: AA_RATIO, AAA: AAA_RATIO };

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

// WCAG relative luminance — gamma-corrected sRGB.
export function luminanceFromRgb({ r, g, b }: { r: number; g: number; b: number }): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const la = luminanceFromRgb(a) + 0.05;
  const lb = luminanceFromRgb(b) + 0.05;
  return la > lb ? la / lb : lb / la;
}

export function wcagLevels(ratio: number): WcagLevels {
  return { AA: ratio >= AA_RATIO, AAA: ratio >= AAA_RATIO };
}

// The next unmet level a fix should aim for: AA first, then AAA, then nothing.
export function nextFixLevel(levels: WcagLevels): WcagLevel | null {
  if (!levels.AA) return "AA";
  if (!levels.AAA) return "AAA";
  return null;
}

// background alpha ignored — WCAG assumes an opaque backdrop
export function contrastOf(color: Hsva, background: Rgba): number {
  return contrastRatio(hsvaToRgba(color), background);
}

// scans both directions, returns SMALLEST passing move; if none reach target, returns extreme with best worst-case ratio; null if already passing
export function fixColorForContrast(color: Hsva, background: Rgba, target: number = AA_RATIO): Hsva | null {
  const ok = hsvaToOklcha(color);
  const ratioAtL = (L: number) => contrastRatio(hsvaToRgba(oklchaToHsva({ L, C: ok.C, H: ok.H, a: 1 })), background);
  if (ratioAtL(ok.L) >= target) return null;

  let best: { L: number; dist: number } | null = null;
  for (let step = 0; step <= 100; step++) {
    const L = step / 100;
    if (ratioAtL(L) < target) continue;
    const dist = Math.abs(L - ok.L);
    if (!best || dist < best.dist) best = { L, dist };
  }
  const pick = (L: number) => oklchaToHsva({ L, C: ok.C, H: ok.H, a: color.a });
  if (best) return pick(best.L);
  // Nothing passed: fall back to whichever extreme maximizes the ratio.
  return ratioAtL(0) >= ratioAtL(1) ? pick(0) : pick(1);
}
