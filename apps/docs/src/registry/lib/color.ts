// zero-dep color engine for ColorPicker/GradientEditor; HSVA (h0-360,s/v0-100,a0-1) is source of truth —
// hue/sat indeterminate at black/white/gray, so HSVA survives interaction, collapses to CSS string only for I/O
// pure+SSR-safe except parseColor's canvas fallback (null server-side); OKLab/OKLCH = Björn Ottosson ref (copied not imported, primitive installs by file-copy)

export type Hsva = { h: number; s: number; v: number; a: number };
export type Rgba = { r: number; g: number; b: number; a: number };
export type Hsla = { h: number; s: number; l: number; a: number };
export type Oklcha = { L: number; C: number; H: number; a: number };
export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

// A channel id, tagged by the space it belongs to so the numeric fields stay exhaustive without casts.
export type ChannelId = "r" | "g" | "b" | "h" | "s" | "l" | "okl" | "okc" | "okh" | "a";

export type ChannelSpec = {
  id: ChannelId;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const clamp01 = (n: number) => clamp(n, 0, 1);
const wrapHue = (h: number) => ((h % 360) + 360) % 360;
const round = (n: number) => Math.round(n);

// ─── HSVA ⇄ RGBA ─────────────────────────────────────────────────────────────

export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const S = clamp01(s / 100);
  const V = clamp01(v / 100);
  const c = V * S;
  const hh = wrapHue(h) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = V - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: round((r + m) * 255), g: round((g + m) * 255), b: round((b + m) * 255), a: clamp01(a) };
}

export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const R = clamp(r, 0, 255) / 255;
  const G = clamp(g, 0, 255) / 255;
  const B = clamp(b, 0, 255) / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === R) h = 60 * (((G - B) / d) % 6);
    else if (max === G) h = 60 * ((B - R) / d + 2);
    else h = 60 * ((R - G) / d + 4);
  }
  const s = max === 0 ? 0 : d / max;
  return { h: wrapHue(h), s: s * 100, v: max * 100, a: clamp01(a) };
}

// ─── HSVA ⇄ HSLA (direct, hue carried verbatim so grays keep their hue) ───────

export function hsvaToHsla({ h, s, v, a }: Hsva): Hsla {
  const S = clamp01(s / 100);
  const V = clamp01(v / 100);
  const L = V * (1 - S / 2);
  const Sl = L === 0 || L === 1 ? 0 : (V - L) / Math.min(L, 1 - L);
  return { h: wrapHue(h), s: Sl * 100, l: L * 100, a: clamp01(a) };
}

export function hslaToHsva({ h, s, l, a }: Hsla): Hsva {
  const S = clamp01(s / 100);
  const L = clamp01(l / 100);
  const V = L + S * Math.min(L, 1 - L);
  const Sv = V === 0 ? 0 : 2 * (1 - L / V);
  return { h: wrapHue(h), s: Sv * 100, v: V * 100, a: clamp01(a) };
}

export function rgbaToHsla(rgba: Rgba): Hsla {
  return hsvaToHsla(rgbaToHsva(rgba));
}

export function hslaToRgba(hsla: Hsla): Rgba {
  return hsvaToRgba(hslaToHsva(hsla));
}

// ─── OKLab / OKLCH (Björn Ottosson) ──────────────────────────────────────────

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// rgb channels 0–255 → oklch (L 0–1, C ~0–0.4, H 0–360)
function rgbToOklch(r255: number, g255: number, b255: number): { L: number; C: number; H: number } {
  const r = srgbToLinear(clamp(r255, 0, 255) / 255);
  const g = srgbToLinear(clamp(g255, 0, 255) / 255);
  const b = srgbToLinear(clamp(b255, 0, 255) / 255);
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
function oklchToRgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
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
  const to = (c: number) => clamp(round(linearToSrgb(c) * 255), 0, 255);
  return { r: to(r), g: to(g), b: to(bl) };
}

export function hsvaToOklcha(hsva: Hsva): Oklcha {
  const { r, g, b } = hsvaToRgba(hsva);
  const { L, C, H } = rgbToOklch(r, g, b);
  return { L, C, H, a: clamp01(hsva.a) };
}

export function oklchaToHsva({ L, C, H, a }: Oklcha): Hsva {
  const { r, g, b } = oklchToRgb(L, C, H);
  return rgbaToHsva({ r, g, b, a });
}

// ─── HEX ⇄ RGBA ──────────────────────────────────────────────────────────────

const hex2 = (n: number) => clamp(round(n), 0, 255).toString(16).padStart(2, "0");

// Accepts 3/4/6/8-digit hex (with or without leading #). Returns null on malformed input.
export function hexToRgba(input: string): Rgba | null {
  const m = input.trim().replace(/^#/, "");
  const read = (h: string) => Number.parseInt(h, 16);
  if (m.length === 3 || m.length === 4) {
    if (!/^[0-9a-f]+$/i.test(m)) return null;
    const r = read(m[0] + m[0]);
    const g = read(m[1] + m[1]);
    const b = read(m[2] + m[2]);
    const a = m.length === 4 ? read(m[3] + m[3]) / 255 : 1;
    return { r, g, b, a };
  }
  if (m.length === 6 || m.length === 8) {
    if (!/^[0-9a-f]+$/i.test(m)) return null;
    const r = read(m.slice(0, 2));
    const g = read(m.slice(2, 4));
    const b = read(m.slice(4, 6));
    const a = m.length === 8 ? read(m.slice(6, 8)) / 255 : 1;
    return { r, g, b, a };
  }
  return null;
}

export function rgbaToHex(rgba: Rgba, withAlpha = rgba.a < 1): string {
  const base = `#${hex2(rgba.r)}${hex2(rgba.g)}${hex2(rgba.b)}`;
  return withAlpha ? `${base}${hex2(clamp01(rgba.a) * 255)}` : base;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const trimNum = (n: number, d: number) => n.toFixed(d).replace(/\.?0+$/, "");

// near-neutral colors drop chroma+hue noise, matching shadcn v4 gray convention: `oklch(0.985 0 0)`
function oklchTriplet(L: number, C: number, H: number): string {
  const Ls = trimNum(L, 4);
  if (C < 1e-4) return `${Ls} 0 0`;
  return `${Ls} ${trimNum(C, 4)} ${trimNum(H, 3)}`;
}

export function formatColor(hsva: Hsva, format: ColorFormat, opts?: { alpha?: boolean }): string {
  const useAlpha = opts?.alpha !== false && hsva.a < 1;
  const alphaSuffix = useAlpha ? ` / ${trimNum(clamp01(hsva.a), 3)}` : "";
  switch (format) {
    case "hex": {
      return rgbaToHex(hsvaToRgba(hsva), useAlpha);
    }
    case "rgb": {
      const { r, g, b } = hsvaToRgba(hsva);
      return `rgb(${r} ${g} ${b}${alphaSuffix})`;
    }
    case "hsl": {
      const { h, s, l } = hsvaToHsla(hsva);
      return `hsl(${trimNum(wrapHue(h), 1)} ${trimNum(s, 1)}% ${trimNum(l, 1)}%${alphaSuffix})`;
    }
    case "oklch": {
      const { L, C, H } = hsvaToOklcha(hsva);
      return `oklch(${oklchTriplet(L, C, H)}${alphaSuffix})`;
    }
  }
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

// A minimal named-color table for the common cases; anything else falls through to the DOM canvas.
const NAMED: Record<string, string> = {
  transparent: "#00000000",
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  gray: "#808080",
  grey: "#808080",
};

// Resolve an alpha token that may be a bare number (0–1) or a percentage.
function readAlpha(token: string | undefined): number {
  if (token === undefined) return 1;
  const t = token.trim();
  if (t.endsWith("%")) return clamp01(Number.parseFloat(t) / 100);
  return clamp01(Number.parseFloat(t));
}

// fallback for formats the regex branch skips (lab()/lch()/color()/arbitrary names); DOM-only, null on server
let srgbCtx: CanvasRenderingContext2D | null = null;
function parseViaCanvas(color: string): Rgba | null {
  if (typeof document === "undefined") return null;
  if (!srgbCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    srgbCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!srgbCtx) return null;
  srgbCtx.clearRect(0, 0, 1, 1);
  srgbCtx.fillStyle = "#000";
  srgbCtx.fillStyle = color; // rejected values leave the sentinel #000 in place
  srgbCtx.fillRect(0, 0, 1, 1);
  const data = srgbCtx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
}

// SSR-safe for hex/rgb/hsl/oklch/known-named; exotic formats/unknown names go through DOM canvas
export function parseColor(input: string): Hsva | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  const named = NAMED[raw];
  if (named) {
    const rgba = hexToRgba(named);
    return rgba ? rgbaToHsva(rgba) : null;
  }

  if (raw.startsWith("#")) {
    const rgba = hexToRgba(raw);
    return rgba ? rgbaToHsva(rgba) : null;
  }

  const rgb = raw.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (rgb) {
    const chan = (t: string) => (t.endsWith("%") ? (Number.parseFloat(t) / 100) * 255 : Number.parseFloat(t));
    return rgbaToHsva({ r: chan(rgb[1]), g: chan(rgb[2]), b: chan(rgb[3]), a: readAlpha(rgb[4]) });
  }

  const hsl = raw.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (hsl) {
    return hslaToHsva({ h: Number.parseFloat(hsl[1]), s: Number.parseFloat(hsl[2]), l: Number.parseFloat(hsl[3]), a: readAlpha(hsl[4]) });
  }

  const oklch = raw.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (oklch) {
    const L = oklch[1].endsWith("%") ? Number.parseFloat(oklch[1]) / 100 : Number.parseFloat(oklch[1]);
    // chroma as a percentage is 0%→0, 100%→0.4 per the CSS Color 4 reference range
    const C = oklch[2].endsWith("%") ? (Number.parseFloat(oklch[2]) / 100) * 0.4 : Number.parseFloat(oklch[2]);
    return oklchaToHsva({ L, C, H: Number.parseFloat(oklch[3]), a: readAlpha(oklch[4]) });
  }

  const viaCanvas = parseViaCanvas(raw);
  return viaCanvas ? rgbaToHsva(viaCanvas) : null;
}

// ─── Numeric channel fields ──────────────────────────────────────────────────

// preserves hue (+sat at true black) on achromatic mutation so area/hue thumbs don't jump to red; `prev` = color before edit
function preserveAchromatic(next: Hsva, prev: Hsva): Hsva {
  const out = { ...next };
  if (out.v === 0) {
    out.h = prev.h;
    out.s = prev.s;
  } else if (out.s === 0) {
    out.h = prev.h;
  }
  return out;
}

// The channel set shown for a given format. HEX borrows the RGB channels (matching Figma).
export function getChannels(hsva: Hsva, format: ColorFormat): ChannelSpec[] {
  const alpha: ChannelSpec = { id: "a", label: "A", value: round(clamp01(hsva.a) * 100), min: 0, max: 100, step: 1 };
  switch (format) {
    case "hex":
    case "rgb": {
      const { r, g, b } = hsvaToRgba(hsva);
      return [
        { id: "r", label: "R", value: round(r), min: 0, max: 255, step: 1 },
        { id: "g", label: "G", value: round(g), min: 0, max: 255, step: 1 },
        { id: "b", label: "B", value: round(b), min: 0, max: 255, step: 1 },
        alpha,
      ];
    }
    case "hsl": {
      const { h, s, l } = hsvaToHsla(hsva);
      return [
        { id: "h", label: "H", value: round(wrapHue(h)), min: 0, max: 360, step: 1 },
        { id: "s", label: "S", value: round(s), min: 0, max: 100, step: 1 },
        { id: "l", label: "L", value: round(l), min: 0, max: 100, step: 1 },
        alpha,
      ];
    }
    case "oklch": {
      const { L, C, H } = hsvaToOklcha(hsva);
      return [
        { id: "okl", label: "L", value: Number(trimNum(L, 3)), min: 0, max: 1, step: 0.001 },
        { id: "okc", label: "C", value: Number(trimNum(C, 3)), min: 0, max: 0.4, step: 0.001 },
        { id: "okh", label: "H", value: round(wrapHue(H)), min: 0, max: 360, step: 1 },
        alpha,
      ];
    }
  }
}

// channel `id` already encodes its color space (r/g/b, h/s/l, okl/okc/okh, a), no format arg needed
export function setChannel(hsva: Hsva, id: ChannelId, value: number): Hsva {
  switch (id) {
    case "a":
      return { ...hsva, a: clamp01(value / 100) };
    case "r":
    case "g":
    case "b": {
      const rgba = hsvaToRgba(hsva);
      const next = { ...rgba, [id]: clamp(value, 0, 255) };
      return preserveAchromatic({ ...rgbaToHsva(next), a: hsva.a }, hsva);
    }
    case "h":
      return { ...hsva, ...hslaToHsva({ ...hsvaToHsla(hsva), h: wrapHue(value) }), a: hsva.a };
    case "s":
    case "l": {
      const hsla = hsvaToHsla(hsva);
      const key = id === "s" ? "s" : "l";
      const next = hslaToHsva({ ...hsla, [key]: clamp(value, 0, 100) });
      return preserveAchromatic({ ...next, h: hsla.h, a: hsva.a }, hsva);
    }
    case "okl":
    case "okc":
    case "okh": {
      const ok = hsvaToOklcha(hsva);
      let mapped = ok;
      if (id === "okl") mapped = { ...ok, L: clamp01(value) };
      else if (id === "okc") mapped = { ...ok, C: clamp(value, 0, 0.5) };
      else mapped = { ...ok, H: wrapHue(value) };
      return preserveAchromatic({ ...oklchaToHsva(mapped), a: hsva.a }, hsva);
    }
  }
}

// ─── Pointer → color mapping (pure, unit-testable) ───────────────────────────

// origin top-left: x → saturation (0 left…100 right), y → value (100 top…0 bottom), clamped
export function pointToSaturationValue(
  rect: { width: number; height: number },
  offsetX: number,
  offsetY: number,
): { s: number; v: number } {
  const s = rect.width <= 0 ? 0 : clamp01(offsetX / rect.width) * 100;
  const v = rect.height <= 0 ? 0 : (1 - clamp01(offsetY / rect.height)) * 100;
  return { s, v };
}

// ─── Gradient formatting (shared by the GradientEditor primitive) ────────────

export type GradientKind = "linear" | "radial" | "conic";

// stops sorted by position; angle drives linear/conic direction, ignored for radial
export function formatGradient(stops: { position: number; color: string }[], type: GradientKind, angle: number): string {
  const list = [...stops]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${round(clamp01(stop.position) * 100)}%`)
    .join(", ");
  switch (type) {
    case "linear":
      return `linear-gradient(${round(angle)}deg, ${list})`;
    case "radial":
      return `radial-gradient(circle, ${list})`;
    case "conic":
      return `conic-gradient(from ${round(angle)}deg, ${list})`;
  }
}

// angle → hue, radius → saturation (clamped to ring); origin top-left, wheel inscribed in the box
export function pointToHueSat(rect: { width: number; height: number }, offsetX: number, offsetY: number): { h: number; s: number } {
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = offsetX - cx;
  const dy = offsetY - cy;
  const radius = Math.min(cx, cy);
  const dist = Math.hypot(dx, dy);
  // atan2 with screen-y flipped so 0° points right and hue increases counter-clockwise → clockwise.
  let h = (Math.atan2(dy, dx) * 180) / Math.PI;
  h = wrapHue(h);
  const s = radius <= 0 ? 0 : clamp01(dist / radius) * 100;
  return { h, s };
}
