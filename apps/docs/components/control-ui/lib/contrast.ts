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

// next unmet level fix should aim for: AA first, then AAA, then nothing.
export function nextFixLevel(levels: WcagLevels): WcagLevel | null {
  if (!levels.AA) return "AA";
  if (!levels.AAA) return "AAA";
  return null;
}

// WCAG assumes an opaque backdrop, so a translucent foreground is measured as the color it actually paints over it
function paintedOver(color: Rgba, background: Rgba): Rgba {
  const blend = (channel: "r" | "g" | "b") => color[channel] * color.a + background[channel] * (1 - color.a);
  return { r: blend("r"), g: blend("g"), b: blend("b"), a: 1 };
}

export function contrastOf(color: Hsva, background: Rgba): number {
  return contrastRatio(paintedOver(hsvaToRgba(color), background), background);
}

// floored, never rounded, so a ratio just under a threshold can't read as passing it
export function formatContrastRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}

// scans both directions, returns SMALLEST passing move; if none reach target, returns extreme with best worst-case ratio; null if already passing
export function fixColorForContrast(color: Hsva, background: Rgba, target: number = AA_RATIO): Hsva | null {
  const ok = hsvaToOklcha(color);
  const ratioAtL = (L: number) => contrastOf(oklchaToHsva({ L, C: ok.C, H: ok.H, a: color.a }), background);
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
  // Nothing passed: fall back to whichever extreme maximizes ratio.
  return ratioAtL(0) >= ratioAtL(1) ? pick(0) : pick(1);
}

export type ContrastFailBand = { saturation: number; failsFrom: number; failsTo: number };

const BRIGHTNESS_BISECTION_STEPS = 12;

// `passes` holds at `passing` and flips once on the way to `failing`
function lastPassingBrightness(passes: (brightness: number) => boolean, passing: number, failing: number): number {
  if (!passes(passing)) return passing;
  let pass = passing;
  let fail = failing;
  for (let step = 0; step < BRIGHTNESS_BISECTION_STEPS; step++) {
    const middle = (pass + fail) / 2;
    if (passes(middle)) pass = middle;
    else fail = middle;
  }
  return pass;
}

// per saturation column of a saturation/brightness area, the brightness interval that misses `target` against `background`.
// luminance only rises with brightness, so the ratio bottoms out where the color matches the background and each edge is one bisection
export function contrastFailBands(color: Pick<Hsva, "h" | "a">, background: Rgba, target: number, columns = 32): ContrastFailBand[] {
  const backgroundLuminance = luminanceFromRgb(background);
  return Array.from({ length: columns + 1 }, (_, column) => {
    const saturation = (column / columns) * 100;
    const at = (brightness: number): Hsva => ({ h: color.h, s: saturation, v: brightness, a: color.a });
    const darkerThanBackground = (brightness: number) =>
      luminanceFromRgb(paintedOver(hsvaToRgba(at(brightness)), background)) <= backgroundLuminance;
    const meetsTarget = (brightness: number) => contrastOf(at(brightness), background) >= target;
    const matchingBackground = lastPassingBrightness(darkerThanBackground, 0, 100);
    return {
      saturation,
      failsFrom: lastPassingBrightness(meetsTarget, 0, matchingBackground),
      failsTo: lastPassingBrightness(meetsTarget, 100, matchingBackground),
    };
  });
}
