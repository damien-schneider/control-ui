"use client";

export type Rgb = [number, number, number];

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace("#", "");
  const r = Number.parseInt(m.slice(0, 2), 16) / 255;
  const g = Number.parseInt(m.slice(2, 4), 16) / 255;
  const b = Number.parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(hue(0) * 255), Math.round(hue(8) * 255), Math.round(hue(4) * 255)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// ─── OKLab / OKLCH (Björn Ottosson) ──────────────────────────────────────────
// Theme tokens authored in oklch (Tailwind/shadcn v4: wider gamut, perceptual lightness); editor speaks hex to <input type=color>, these bridge hex↔oklch.
const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export type Oklch = { L: number; C: number; H: number };

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

// oklch → rgb channels 0–255, clamped into sRGB gamut (fine for the editor's hex round-trip)
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

// Formats oklch triplet as tokens are authored; near-neutral colors drop chroma+hue noise (shadcn v4 grey convention: oklch(0.985 0 0)).
export function oklchColor(L: number, C: number, H: number): string {
  const Ls = trimNum(L, 4);
  if (C < 1e-4) return `oklch(${Ls} 0 0)`;
  return `oklch(${Ls} ${trimNum(C, 4)} ${trimNum(H, 3)})`;
}

// Theme tokens are full colors (theme.css: oklch(...) values), so every author fn below returns complete oklch() color, not a channel triplet.
export function hexToOklchColor(hex: string): string {
  const { L, C, H } = hexToOklch(hex);
  return oklchColor(L, C, H);
}

// Brand mode-independent: keeps hue+saturation across light/dark, adapts only lightness.
// Near-neutral brand flips to light (matches .dark's near-white --primary); saturated brand keeps hue, lifted into dark-readable band instead of dropped for neutral white.
// Math stays in HSL (thresholds calibrated there), emitted as oklch to match authored token format.
export function darkBrand(hex: string): { primary: string; foreground: string } {
  const { h, s, l } = hexToHsl(hex);
  const L = s < 0.15 ? 1 - l : Math.max(l, 0.6);
  const primary = hexToOklchColor(hslToHex(h, s, L));
  const foreground = L > 0.6 ? "oklch(0.2102 0.006 285.874)" : "oklch(1 0 0)";
  return { primary, foreground };
}

export function darkText(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  const L = s < 0.15 ? 0.98 : Math.max(l, 0.72);
  return hexToOklchColor(hslToHex(h, s, L));
}

// Normalizes any authored CSS color (getComputedStyle result: #hex, oklch(), hsl(), rgb()) to 7-char #rrggbb, the only form <input type=color> accepts.
// Used to hydrate editor color pickers from active skin's theme.css.
// Returns null on unparseable values (var()/calc()/named color) so caller keeps prior value instead of clobbering picker.
export function cssColorToHex(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith("#")) {
    const m = s.slice(1);
    if (m.length === 3) return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`;
    if (m.length === 6) return `#${m}`;
    if (m.length === 8) return `#${m.slice(0, 6)}`; // drop alpha channel
    return null;
  }
  const oklch = s.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)/i);
  if (oklch) {
    const L = oklch[1].endsWith("%") ? Number.parseFloat(oklch[1]) / 100 : Number(oklch[1]);
    // chroma as a percentage is 0%→0, 100%→0.4 per the CSS Color 4 reference range
    const C = oklch[2].endsWith("%") ? (Number.parseFloat(oklch[2]) / 100) * 0.4 : Number(oklch[2]);
    return oklchToHex(L, C, Number(oklch[3]));
  }
  const hsl = s.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i);
  if (hsl) {
    return hslToHex(Number(hsl[1]) / 360, Number(hsl[2]) / 100, Number(hsl[3]) / 100);
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) {
    const to = (n: string) =>
      Math.max(0, Math.min(255, Math.round(Number(n))))
        .toString(16)
        .padStart(2, "0");
    return `#${to(rgb[1])}${to(rgb[2])}${to(rgb[3])}`;
  }
  return null;
}

export function rgbToHex([r, g, b]: Rgb): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// Resolves ANY browser CSS color (lab/lch/oklab/color()/named) to sRGB bytes — regex parser above misses these, browsers serialize computed custom-props losslessly (rig tokens come back as lab()), so hydration falls back to stale knobs without this.
// 1) hidden <span> + getComputedStyle resolves var()/calc()/relative-color into concrete string.
// 2) 1x1 canvas re-parses it, gamut-maps to sRGB — format-proof; DOM-only, null on server.
let colorProbe: HTMLSpanElement | null = null;
let srgbCtx: CanvasRenderingContext2D | null = null;

export function cssColorToRgb(color: string): Rgb | null {
  if (typeof document === "undefined" || !color) return null;
  if (!colorProbe) {
    colorProbe = document.createElement("span");
    colorProbe.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none";
    document.body.appendChild(colorProbe);
  }
  colorProbe.style.color = "";
  colorProbe.style.color = color;
  if (!colorProbe.style.color) return null; // browser rejected the string
  const resolved = getComputedStyle(colorProbe).color;
  if (!srgbCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    srgbCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!srgbCtx) return null;
  srgbCtx.clearRect(0, 0, 1, 1);
  srgbCtx.fillStyle = "#000";
  srgbCtx.fillStyle = resolved; // rejected values leave the sentinel #000 in place
  srgbCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = srgbCtx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

// DOM-robust color→hex, hydrates <input type=color> from a skin's live tokens regardless of getComputedStyle's reported space.
export function cssColorToHexDom(color: string): string | null {
  const rgb = cssColorToRgb(color);
  return rgb ? rgbToHex(rgb) : null;
}
