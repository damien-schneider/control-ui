// Runtime-neutral colour and contrast arithmetic: no DOM, so route handlers can gate generated
// themes with the same numbers the editor shows. color-utils.ts and contrast.ts re-export from here.

export type Rgb = [number, number, number];
export type Oklch = { L: number; C: number; H: number };

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// rgb channels 0–255 → oklch (L 0–1, C ~0–0.4, H 0–360)
export function rgbToOklch([r255, g255, b255]: Rgb): Oklch {
  const r = srgbToLinear(r255 / 255);
  const g = srgbToLinear(g255 / 255);
  const b = srgbToLinear(b255 / 255);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

// oklch → rgb channels 0–255, clamped into sRGB gamut
export function oklchToRgb(L: number, C: number, H: number): Rgb {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const to = (c: number) => Math.max(0, Math.min(255, Math.round(linearToSrgb(c) * 255)));
  return [to(r), to(g), to(bl)];
}

export function hexToOklch(hex: string): Oklch {
  const m = hex.replace("#", "");
  return rgbToOklch([Number.parseInt(m.slice(0, 2), 16), Number.parseInt(m.slice(2, 4), 16), Number.parseInt(m.slice(4, 6), 16)]);
}

export function oklchToHex(L: number, C: number, H: number): string {
  const [r, g, b] = oklchToRgb(L, C, H);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const trimNum = (n: number, d: number) => n.toFixed(d).replace(/\.?0+$/, "");

// near-neutral colours drop chroma and hue noise, matching shadcn grey convention
export function oklchColor(L: number, C: number, H: number): string {
  const Ls = trimNum(L, 4);
  if (C < 1e-4) return `oklch(${Ls} 0 0)`;
  return `oklch(${Ls} ${trimNum(C, 4)} ${trimNum(H, 3)})`;
}

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

// Nudges lightness in OKLCH with hue and chroma held, so palette identity survives.
// Returns the smallest passing move, or the extreme with the best worst case when nothing reaches target.
export function fitLightnessForContrast(fg: Oklch, backgrounds: Rgb[], target: number = AA_RATIO): number | null {
  const worst = (candidate: Rgb) => Math.min(...backgrounds.map((bg) => contrastFromRgb(candidate, bg)));
  if (worst(oklchToRgb(fg.L, fg.C, fg.H)) >= target) return null;

  let best: { l: number; dist: number } | null = null;
  for (let step = 0; step <= 100; step++) {
    const candidate = step / 100;
    if (worst(oklchToRgb(candidate, fg.C, fg.H)) < target) continue;
    const dist = Math.abs(candidate - fg.L);
    if (!best || dist < best.dist) best = { l: candidate, dist };
  }
  if (best) return best.l;
  return worst(oklchToRgb(0, fg.C, fg.H)) >= worst(oklchToRgb(1, fg.C, fg.H)) ? 0 : 1;
}
