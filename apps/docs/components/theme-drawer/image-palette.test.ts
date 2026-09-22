import { describe, expect, test } from "bun:test";

import { readImagePalette } from "./image-palette";

function pixelsOf(regions: { rgb: [number, number, number]; share: number }[], total = 4096) {
  const pixels = new Uint8ClampedArray(total * 4);
  let cursor = 0;

  for (const { rgb, share } of regions) {
    for (let n = 0; n < Math.round(total * share); n += 1) {
      pixels[cursor * 4] = rgb[0];
      pixels[cursor * 4 + 1] = rgb[1];
      pixels[cursor * 4 + 2] = rgb[2];
      pixels[cursor * 4 + 3] = 255;
      cursor += 1;
    }
  }

  return pixels;
}

describe("readImagePalette", () => {
  // The reading a vision model got wrong: cream page, near-black text, one terracotta button.
  test("separates the surface, its text and the one saturated accent", () => {
    const palette = readImagePalette(
      pixelsOf([
        { rgb: [248, 243, 234], share: 0.8 },
        { rgb: [34, 45, 55], share: 0.15 },
        { rgb: [190, 80, 50], share: 0.05 },
      ]),
    );

    expect(palette).not.toBeNull();
    if (!palette) return;

    expect(palette.surface.L).toBeGreaterThan(0.9);
    expect(palette.surface.C).toBeLessThan(0.03);
    expect(palette.text.L).toBeLessThan(0.4);
    expect(palette.accent.C).toBeGreaterThan(0.1);
    expect(palette.accent.H).toBeGreaterThan(20);
    expect(palette.accent.H).toBeLessThan(60);
  });

  // A dark interface must not report its own surface as its text.
  test("reads a dark interface the same way round", () => {
    const palette = readImagePalette(
      pixelsOf([
        { rgb: [18, 16, 30], share: 0.85 },
        { rgb: [240, 240, 250], share: 0.1 },
        { rgb: [124, 58, 237], share: 0.05 },
      ]),
    );

    expect(palette?.surface.L).toBeLessThan(0.3);
    expect(palette?.text.L).toBeGreaterThan(0.9);
    expect(palette?.accent.H).toBeGreaterThan(250);
    expect(palette?.accent.H).toBeLessThan(320);
  });

  // A single saturated pixel is noise; the accent has to be something with area.
  test("ignores a lone saturated pixel", () => {
    const pixels = pixelsOf([
      { rgb: [250, 250, 250], share: 0.6 },
      { rgb: [40, 90, 200], share: 0.4 },
    ]);
    pixels[0] = 255;
    pixels[1] = 0;
    pixels[2] = 255;

    expect(readImagePalette(pixels)?.accent.H).toBeGreaterThan(220);
  });

  test("returns nothing for a fully transparent image", () => {
    expect(readImagePalette(new Uint8ClampedArray(64 * 4))).toBeNull();
  });
});
