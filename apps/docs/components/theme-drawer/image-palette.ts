import { hsvaToOklcha, rgbaToHsva } from "@/components/control-ui/lib/color";

export type PaletteColor = { L: number; C: number; H: number };
export type ImagePalette = { surface: PaletteColor; text: PaletteColor; accent: PaletteColor };

// Coarse enough that a gradient or a photo's noise collapses into one bucket, fine enough that a brand
// colour never merges with the surface it sits on.
const LIGHTNESS_STEPS = 12;
const CHROMA_STEPS = 24;
const HUE_STEPS = 24;

// A screenshot is mostly its own surface, so sampling every pixel buys nothing over a grid that still
// lands thousands of samples on a thumbnail.
const SAMPLE_STRIDE = 4;

const TEXT_CONTRAST = 0.3;
const ACCENT_CHROMA = 0.04;

type Bucket = { count: number; L: number; C: number; H: number };

function meanOf(bucket: Bucket): PaletteColor {
  return {
    L: Number((bucket.L / bucket.count).toFixed(3)),
    C: Number((bucket.C / bucket.count).toFixed(3)),
    H: Math.round(bucket.H / bucket.count),
  };
}

function bucketsOf(pixels: Uint8ClampedArray): Bucket[] {
  const buckets = new Map<string, Bucket>();

  for (let index = 0; index + 3 < pixels.length; index += 4 * SAMPLE_STRIDE) {
    const alpha = pixels[index + 3] ?? 0;
    if (alpha < 128) continue;

    const { L, C, H } = hsvaToOklcha(rgbaToHsva({ r: pixels[index] ?? 0, g: pixels[index + 1] ?? 0, b: pixels[index + 2] ?? 0, a: 1 }));

    const key = `${Math.round(L * LIGHTNESS_STEPS)}:${Math.round(C * CHROMA_STEPS)}:${Math.round((H / 360) * HUE_STEPS)}`;
    const bucket = buckets.get(key) ?? { count: 0, L: 0, C: 0, H: 0 };
    bucket.count += 1;
    bucket.L += L;
    bucket.C += C;
    bucket.H += H;
    buckets.set(key, bucket);
  }

  return [...buckets.values()].sort((a, b) => b.count - a.count);
}

// The vision model reads a 1024px screenshot at roughly 150 tokens, which is enough to name a dominant
// colour and not enough to sample one: asking it for surface, text and accent produced invented hex and
// "dark navy" for a cream interface. The pixels are already in the canvas, so measure them instead and
// leave the model the structural reading it does handle.
export function readImagePalette(pixels: Uint8ClampedArray): ImagePalette | null {
  const buckets = bucketsOf(pixels);
  const dominant = buckets[0];
  if (!dominant) return null;

  const surface = meanOf(dominant);

  const contrasting = buckets.filter((bucket) => Math.abs(bucket.L / bucket.count - surface.L) >= TEXT_CONTRAST);
  const farthest = buckets.reduce((best, bucket) =>
    Math.abs(bucket.L / bucket.count - surface.L) > Math.abs(best.L / best.count - surface.L) ? bucket : best,
  );
  const text = meanOf(contrasting[0] ?? farthest);

  // Weighted by area as well as chroma: a single saturated pixel is noise, a saturated button is the brand.
  const score = (bucket: Bucket) => (bucket.C / bucket.count) * Math.sqrt(bucket.count);
  const colourful = buckets.filter((bucket) => bucket.C / bucket.count >= ACCENT_CHROMA);
  const accent = colourful.length > 0 ? meanOf(colourful.reduce((best, b) => (score(b) > score(best) ? b : best))) : surface;

  return { surface, text, accent };
}
