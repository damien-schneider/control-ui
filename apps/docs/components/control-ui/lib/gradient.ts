import { formatColor, type Hsva, hsvaToOklcha, hsvaToRgba, oklchaToHsva, parseColor, rgbaToHsva } from "./color";

export type GradientType = "linear" | "radial" | "conic";

// the space the browser blends stops in: srgb passes through gray between distant hues, oklab and oklch stay vivid
export type GradientInterpolation = "srgb" | "oklab" | "oklch";

export type GradientStop = { id: string; position: number; color: string };

export type GradientValue = {
  type: GradientType;
  angle: number;
  interpolation: GradientInterpolation;
  stops: GradientStop[];
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

// angle drives linear/conic direction, ignored for radial; srgb is the CSS default, so it stays implicit
export function formatGradient({ type, angle, interpolation, stops }: GradientValue): string {
  const space = interpolation === "srgb" ? "" : ` in ${interpolation}`;
  const list = [...stops]
    .sort(byPosition)
    .map((stop) => `${stop.color} ${Math.round(clamp01(stop.position) * 100)}%`)
    .join(", ");
  switch (type) {
    case "linear":
      return `linear-gradient(${Math.round(angle)}deg${space}, ${list})`;
    case "radial":
      return `radial-gradient(circle${space}, ${list})`;
    case "conic":
      return `conic-gradient(from ${Math.round(angle)}deg${space}, ${list})`;
  }
}

function mixSrgb(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToRgba(from);
  const b = hsvaToRgba(to);
  return rgbaToHsva({ r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t), a: lerp(a.a, b.a, t) });
}

function mixOklab(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToOklcha(from);
  const b = hsvaToOklcha(to);
  const radians = (hue: number) => (hue * Math.PI) / 180;
  const greenRed = lerp(a.C * Math.cos(radians(a.H)), b.C * Math.cos(radians(b.H)), t);
  const blueYellow = lerp(a.C * Math.sin(radians(a.H)), b.C * Math.sin(radians(b.H)), t);
  return oklchaToHsva({
    L: lerp(a.L, b.L, t),
    C: Math.hypot(greenRed, blueYellow),
    H: (Math.atan2(blueYellow, greenRed) * 180) / Math.PI,
    a: lerp(a.a, b.a, t),
  });
}

function mixOklch(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToOklcha(from);
  const b = hsvaToOklcha(to);
  const shorterArc = ((b.H - a.H + 540) % 360) - 180;
  return oklchaToHsva({ L: lerp(a.L, b.L, t), C: lerp(a.C, b.C, t), H: a.H + shorterArc * t, a: lerp(a.a, b.a, t) });
}

const MIX: Record<GradientInterpolation, (from: Hsva, to: Hsva, t: number) => Hsva> = {
  srgb: mixSrgb,
  oklab: mixOklab,
  oklch: mixOklch,
};

// the color the gradient already paints at `position`, so a stop inserted there leaves the gradient unchanged
export function gradientColorAt({ stops, interpolation }: Pick<GradientValue, "stops" | "interpolation">, position: number): string {
  const sorted = [...stops].sort(byPosition);
  const before = sorted.findLast((stop) => stop.position <= position);
  const after = sorted.find((stop) => stop.position >= position);
  const nearest = before ?? after;
  if (!nearest) return "#ffffff";
  if (!before || !after) return nearest.color;
  const from = parseColor(before.color);
  const to = parseColor(after.color);
  if (!from || !to) return nearest.color;
  const span = after.position - before.position;
  const t = span === 0 ? 0 : (position - before.position) / span;
  return formatColor(MIX[interpolation](from, to, t), "hex");
}
