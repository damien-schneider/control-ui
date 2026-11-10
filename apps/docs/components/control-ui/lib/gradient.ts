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

// below this chroma the hue is numerical noise, the same cut `formatColor` uses to print an oklch hue of 0
const ACHROMATIC_CHROMA = 1e-4;

// CSS blends premultiplied components, so a transparent stop fades the neighbouring color instead of dragging it toward its own
function premultipliedLerp(from: { a: number }, to: { a: number }, t: number) {
  const alpha = lerp(from.a, to.a, t);
  return {
    alpha,
    mix: (fromComponent: number, toComponent: number) => {
      const mixed = lerp(fromComponent * from.a, toComponent * to.a, t);
      return alpha === 0 ? mixed : mixed / alpha;
    },
  };
}

function mixSrgb(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToRgba(from);
  const b = hsvaToRgba(to);
  const { alpha, mix } = premultipliedLerp(a, b, t);
  return rgbaToHsva({ r: mix(a.r, b.r), g: mix(a.g, b.g), b: mix(a.b, b.b), a: alpha });
}

function mixOklab(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToOklcha(from);
  const b = hsvaToOklcha(to);
  const { alpha, mix } = premultipliedLerp(a, b, t);
  const radians = (hue: number) => (hue * Math.PI) / 180;
  const greenRed = mix(a.C * Math.cos(radians(a.H)), b.C * Math.cos(radians(b.H)));
  const blueYellow = mix(a.C * Math.sin(radians(a.H)), b.C * Math.sin(radians(b.H)));
  return oklchaToHsva({
    L: mix(a.L, b.L),
    C: Math.hypot(greenRed, blueYellow),
    H: (Math.atan2(blueYellow, greenRed) * 180) / Math.PI,
    a: alpha,
  });
}

function mixOklch(from: Hsva, to: Hsva, t: number): Hsva {
  const a = hsvaToOklcha(from);
  const b = hsvaToOklcha(to);
  const { alpha, mix } = premultipliedLerp(a, b, t);
  // an achromatic stop has no hue of its own: CSS carries the other stop's hue across the whole span
  const fromHue = a.C < ACHROMATIC_CHROMA ? b.H : a.H;
  const toHue = b.C < ACHROMATIC_CHROMA ? a.H : b.H;
  const shorterArc = ((toHue - fromHue + 540) % 360) - 180;
  return oklchaToHsva({ L: mix(a.L, b.L), C: mix(a.C, b.C), H: fromHue + shorterArc * t, a: alpha });
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
