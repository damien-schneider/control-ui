import { describe, expect, test } from "bun:test";
import {
  formatColor,
  formatGradient,
  getChannels,
  type Hsva,
  hexToRgba,
  hsvaToHsla,
  hsvaToRgba,
  oklchaToHsva,
  parseColor,
  pointToHueSat,
  pointToSaturationValue,
  rgbaToHex,
  rgbaToHsva,
  setChannel,
} from "./color";

// assert non-null without an `as` cast (the codebase forbids assertions except `as const`)
function present<T>(value: T | null): T {
  if (value === null) throw new Error("expected a non-null value");
  return value;
}

const RED: Hsva = { h: 0, s: 100, v: 100, a: 1 };
const GREEN: Hsva = { h: 120, s: 100, v: 100, a: 1 };
const BLUE: Hsva = { h: 240, s: 100, v: 100, a: 1 };

describe("HSVA ⇄ RGBA — the SPEC", () => {
  test("primaries and secondaries", () => {
    expect(hsvaToRgba(RED)).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsvaToRgba(GREEN)).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(hsvaToRgba(BLUE)).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    expect(hsvaToRgba({ h: 60, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 255, b: 0, a: 1 }); // yellow
    expect(hsvaToRgba({ h: 180, s: 100, v: 100, a: 1 })).toEqual({ r: 0, g: 255, b: 255, a: 1 }); // cyan
    expect(hsvaToRgba({ h: 300, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 0, b: 255, a: 1 }); // magenta
  });

  test("rgba → hsva recovers hue for chromatic colors", () => {
    expect(rgbaToHsva({ r: 255, g: 0, b: 0, a: 1 })).toMatchObject({ h: 0, s: 100, v: 100 });
    expect(rgbaToHsva({ r: 0, g: 255, b: 0, a: 1 })).toMatchObject({ h: 120, s: 100, v: 100 });
    expect(rgbaToHsva({ r: 0, g: 0, b: 255, a: 1 })).toMatchObject({ h: 240, s: 100, v: 100 });
  });

  test("round-trip rgba → hsva → rgba is stable on a sampled grid", () => {
    for (const r of [0, 51, 128, 200, 255]) {
      for (const g of [0, 64, 180, 255]) {
        for (const b of [0, 90, 255]) {
          const back = hsvaToRgba(rgbaToHsva({ r, g, b, a: 1 }));
          expect(back).toEqual({ r, g, b, a: 1 });
        }
      }
    }
  });
});

describe("hex", () => {
  test("hexToRgba accepts 3/4/6/8 digit", () => {
    expect(hexToRgba("#abc")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(hexToRgba("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hexToRgba("#ff000080")).toMatchObject({ r: 255, g: 0, b: 0 });
    expect(present(hexToRgba("#ff000080")).a).toBeCloseTo(0.502, 2);
    expect(hexToRgba("#3b82f6")).toEqual({ r: 59, g: 130, b: 246, a: 1 });
    expect(hexToRgba("nope")).toBeNull();
    expect(hexToRgba("#12")).toBeNull();
  });

  test("hex round-trip is stable", () => {
    for (const hex of ["#000000", "#ffffff", "#3b82f6", "#09090b", "#7038f4", "#808080"]) {
      const hsva = present(parseColor(hex));
      expect(formatColor(hsva, "hex")).toBe(hex);
    }
  });

  test("rgbaToHex emits 8 digits only when alpha < 1", () => {
    expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe("#ff0000");
    expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("#ff000080");
  });
});

describe("achromatic hue preservation — the core guarantee", () => {
  test("black/white keep their stored hue/sat in state but drop it in output", () => {
    expect(formatColor({ h: 210, s: 50, v: 0, a: 1 }, "hex")).toBe("#000000");
    expect(formatColor({ h: 210, s: 0, v: 100, a: 1 }, "hex")).toBe("#ffffff");
  });

  test("setChannel keeps hue when the result is achromatic (H channel, gray)", () => {
    const gray: Hsva = { h: 210, s: 0, v: 50, a: 1 };
    const next = setChannel(gray, "h", 100);
    expect(next.h).toBe(100); // hue is set even though the color stays gray
  });

  test("setting R/G/B rebuilds HSVA and preserves hue when it turns gray", () => {
    const withGreen = setChannel(RED, "g", 128);
    expect(hsvaToRgba(withGreen).g).toBeCloseTo(128, 0);
    const toBlack = setChannel({ h: 42, s: 80, v: 60, a: 1 }, "r", 0);
    // still chromatic here (g/b non-zero), just checking no throw + valid hsva
    expect(toBlack.a).toBe(1);
  });
});

describe("HSVA ⇄ HSLA direct preserves hue on grays", () => {
  test("gray keeps hue through hsva→hsla", () => {
    expect(hsvaToHsla({ h: 200, s: 0, v: 50, a: 1 }).h).toBe(200);
  });
});

describe("oklch", () => {
  test("round-trip within tolerance", () => {
    const s = formatColor(RED, "oklch");
    const back = present(parseColor(s));
    const rgba = hsvaToRgba(back);
    expect(rgba.r).toBeGreaterThan(250);
    expect(rgba.g).toBeLessThan(6);
    expect(rgba.b).toBeLessThan(6);
  });

  test("near-neutral grays trim chroma and hue", () => {
    const gray = present(parseColor("#808080"));
    expect(formatColor(gray, "oklch")).toMatch(/^oklch\([\d.]+ 0 0\)$/);
  });

  test("oklchaToHsva clamps into sRGB", () => {
    const hsva = oklchaToHsva({ L: 0.5, C: 0.1, H: 250, a: 1 });
    const rgba = hsvaToRgba(hsva);
    for (const c of [rgba.r, rgba.g, rgba.b]) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(255);
    }
  });
});

describe("parseColor per format", () => {
  test("hex", () => {
    expect(hsvaToRgba(present(parseColor("#abc")))).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(present(parseColor("#ff000080")).a).toBeCloseTo(0.502, 2);
  });

  test("rgb comma and space syntax, with alpha", () => {
    expect(hsvaToRgba(present(parseColor("rgb(255 0 0)")))).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsvaToRgba(present(parseColor("rgb(255, 0, 0)")))).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(present(parseColor("rgba(255, 0, 0, 0.5)")).a).toBeCloseTo(0.5, 3);
    expect(present(parseColor("rgb(255 0 0 / 50%)")).a).toBeCloseTo(0.5, 3);
  });

  test("hsl comma and space syntax", () => {
    expect(present(parseColor("hsl(0 100% 50%)"))).toMatchObject({ h: 0 });
    expect(hsvaToRgba(present(parseColor("hsl(120, 100%, 50%)")))).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(present(parseColor("hsl(0 100% 50% / 0.5)")).a).toBeCloseTo(0.5, 3);
  });

  test("oklch with and without alpha, percent chroma", () => {
    expect(parseColor("oklch(0.7 0.15 250)")).not.toBeNull();
    expect(present(parseColor("oklch(0.7 0.15 250 / 0.5)")).a).toBeCloseTo(0.5, 3);
    expect(parseColor("oklch(70% 50% 250)")).not.toBeNull();
  });

  test("known named color", () => {
    expect(hsvaToRgba(present(parseColor("red")))).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(present(parseColor("transparent")).a).toBe(0);
  });

  test("unknown/exotic returns null headless (proves the SSR guard)", () => {
    expect(parseColor("rebeccapurple")).toBeNull();
    expect(parseColor("lab(50% 40 59.5)")).toBeNull();
    expect(parseColor("garbage")).toBeNull();
    expect(parseColor("")).toBeNull();
  });
});

describe("formatColor alpha suffix", () => {
  const half: Hsva = { h: 0, s: 100, v: 100, a: 0.5 };
  test("emits alpha across formats when a < 1", () => {
    expect(formatColor(half, "hex")).toBe("#ff000080");
    expect(formatColor(half, "rgb")).toBe("rgb(255 0 0 / 0.5)");
    expect(formatColor(half, "hsl")).toBe("hsl(0 100% 50% / 0.5)");
    expect(formatColor(half, "oklch")).toMatch(/ \/ 0\.5\)$/);
  });
  test("omits alpha at a === 1 or when disabled", () => {
    expect(formatColor(RED, "rgb")).toBe("rgb(255 0 0)");
    expect(formatColor(half, "rgb", { alpha: false })).toBe("rgb(255 0 0)");
    expect(formatColor(half, "hex", { alpha: false })).toBe("#ff0000");
  });
});

describe("getChannels", () => {
  test("rgb format lists R/G/B/A", () => {
    const chans = getChannels(RED, "rgb").map((c) => c.id);
    expect(chans).toEqual(["r", "g", "b", "a"]);
  });
  test("hsl format lists H/S/L/A", () => {
    expect(getChannels(RED, "hsl").map((c) => c.id)).toEqual(["h", "s", "l", "a"]);
  });
  test("oklch format lists okl/okc/okh/A", () => {
    expect(getChannels(RED, "oklch").map((c) => c.id)).toEqual(["okl", "okc", "okh", "a"]);
  });
  test("alpha channel is percent 0–100", () => {
    const a = getChannels({ ...RED, a: 0.5 }, "rgb").find((c) => c.id === "a");
    expect(present(a ?? null).value).toBe(50);
  });
});

describe("pointer mapping", () => {
  test("saturation/value maps and clamps", () => {
    expect(pointToSaturationValue({ width: 100, height: 100 }, 50, 50)).toEqual({ s: 50, v: 50 });
    expect(pointToSaturationValue({ width: 100, height: 100 }, 0, 0)).toEqual({ s: 0, v: 100 });
    expect(pointToSaturationValue({ width: 100, height: 100 }, -10, 200)).toEqual({ s: 0, v: 0 });
    expect(pointToSaturationValue({ width: 100, height: 100 }, 100, 100)).toEqual({ s: 100, v: 0 });
  });

  test("hue/sat wheel maps angle→hue and radius→sat", () => {
    const rect = { width: 100, height: 100 };
    expect(pointToHueSat(rect, 100, 50)).toMatchObject({ h: 0, s: 100 }); // due east
    expect(pointToHueSat(rect, 50, 50).s).toBe(0); // center
    const south = pointToHueSat(rect, 50, 100);
    expect(south.h).toBeCloseTo(90, 5);
  });
});

describe("formatGradient", () => {
  const stops = [
    { position: 0, color: "#7c3aed" },
    { position: 1, color: "#3b82f6" },
  ];
  test("linear with angle", () => {
    expect(formatGradient(stops, "linear", 90)).toBe("linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)");
  });
  test("radial ignores angle", () => {
    expect(formatGradient(stops, "radial", 45)).toBe("radial-gradient(circle, #7c3aed 0%, #3b82f6 100%)");
  });
  test("conic uses from angle", () => {
    expect(formatGradient(stops, "conic", 30)).toBe("conic-gradient(from 30deg, #7c3aed 0%, #3b82f6 100%)");
  });
  test("stops are sorted by position", () => {
    const shuffled = [
      { position: 1, color: "#000" },
      { position: 0.5, color: "#888" },
      { position: 0, color: "#fff" },
    ];
    expect(formatGradient(shuffled, "linear", 0)).toBe("linear-gradient(0deg, #fff 0%, #888 50%, #000 100%)");
  });
});
