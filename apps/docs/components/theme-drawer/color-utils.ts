"use client";

import { hexToOklch, oklchColor, oklchToHex, type Rgb } from "./color-math";

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

// every author fn below returns complete oklch() colour, never channel triplet
export function hexToOklchColor(hex: string): string {
  const { L, C, H } = hexToOklch(hex);
  return oklchColor(L, C, H);
}

// Hue and saturation carry across modes; only lightness adapts. near-neutral brand flips light, saturated one lifts into dark-readable band.
// Thresholds are calibrated in HSL, so math stays there and only output is oklch.
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

// #rrggbb is only form <input type=color> accepts. Null on var()/calc()/named colours, so caller keeps prior value instead of clobbering picker.
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
    // chroma as percentage is 0%→0, 100%→0.4 per CSS Color 4 reference range
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

// Browsers serialize computed custom properties losslessly, so token can come back as lab() and miss regex parser above.
// hidden span resolves var()/calc() to concrete string, then a 1x1 canvas re-parses and gamut-maps it. DOM-only, null on server.
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

// works whatever colour space getComputedStyle reports
export function cssColorToHexDom(color: string): string | null {
  const rgb = cssColorToRgb(color);
  return rgb ? rgbToHex(rgb) : null;
}
