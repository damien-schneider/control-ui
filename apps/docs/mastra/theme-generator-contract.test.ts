import { describe, expect, test } from "bun:test";

import { AA_RATIO, contrastFromRgb, oklchToRgb } from "@/components/theme-drawer/color-math";
import { type GeneratedTheme, gateContrast, toStreamingTokenValues, toTokenValues } from "./theme-generator-contract";

const flat = (L: number, C: number, H: number) => ({ L, C, H });

const readable: GeneratedTheme = {
  name: "Readable",
  radius: 0.625,
  cornerShape: "round",
  typography: { fontFamily: "neutral", baseSize: 0.875, scale: 1.125, headingWeight: 600, headingTracking: -0.018 },
  shadow: { size: 0, opacity: 1, y: 1 },
  motion: { baseDuration: 200, easing: "standard" },
  layout: { controlHeight: 36, paddingX: 16, paddingY: 10, focusRingWidth: 2, controlRimWidth: 1 },
  surface: { overlayOpacity: 0.2, backdropBlur: 0, popoverOpacity: 1, scrollFadeSize: 24 },
  colors: {
    canvas: flat(0.98, 0.004, 250),
    background: flat(1, 0, 0),
    foreground: flat(0.2, 0.02, 250),
    card: flat(1, 0, 0),
    cardForeground: flat(0.2, 0.02, 250),
    primary: flat(0.55, 0.2, 260),
    primaryForeground: flat(1, 0, 0),
    muted: flat(0.96, 0.005, 250),
    mutedForeground: flat(0.45, 0.02, 250),
    secondary: flat(0.95, 0.01, 250),
    accent: flat(0.94, 0.02, 250),
    destructive: flat(0.55, 0.22, 25),
    border: flat(0.9, 0.006, 250),
    ring: flat(0.55, 0.2, 260),
  },
};

// Every gated foreground sits on its own surface, which is the case the gate exists for.
const fog = flat(0.62, 0.05, 210);
const fogOnFog: GeneratedTheme = {
  ...readable,
  name: "Fog",
  colors: {
    canvas: fog,
    background: fog,
    foreground: fog,
    card: fog,
    cardForeground: fog,
    primary: fog,
    primaryForeground: fog,
    muted: fog,
    mutedForeground: fog,
    secondary: fog,
    accent: fog,
    destructive: fog,
    border: fog,
    ring: fog,
  },
};

const ratioOf = (theme: GeneratedTheme, foreground: keyof GeneratedTheme["colors"], surface: keyof GeneratedTheme["colors"]) => {
  const { colors } = gateContrast(theme.colors);
  const fg = colors[foreground];
  const bg = colors[surface];
  return contrastFromRgb(oklchToRgb(fg.L, fg.C, fg.H), oklchToRgb(bg.L, bg.C, bg.H));
};

describe("gateContrast", () => {
  test("lifts every gated pair of an unreadable palette to AA", () => {
    expect(ratioOf(fogOnFog, "cardForeground", "card")).toBeGreaterThanOrEqual(AA_RATIO);
    expect(ratioOf(fogOnFog, "mutedForeground", "card")).toBeGreaterThanOrEqual(AA_RATIO);
    expect(ratioOf(fogOnFog, "foreground", "canvas")).toBeGreaterThanOrEqual(AA_RATIO);
    expect(ratioOf(fogOnFog, "primaryForeground", "primary")).toBeGreaterThanOrEqual(AA_RATIO);
  });

  test("still reaches AA when no lightness of the authored hue can", () => {
    const vivid: GeneratedTheme = {
      ...readable,
      colors: { ...readable.colors, primary: flat(0.5, 0.12, 60), primaryForeground: flat(0.5, 0.3, 60) },
    };

    expect(ratioOf(vivid, "primaryForeground", "primary")).toBeGreaterThanOrEqual(AA_RATIO);
  });

  test("leaves a palette that already passes untouched", () => {
    const { colors, adjustments } = gateContrast(readable.colors);

    expect(adjustments.every((adjustment) => adjustment.ratio >= AA_RATIO)).toBe(true);
    expect(colors.primary).toEqual(readable.colors.primary);
    expect(colors.canvas).toEqual(readable.colors.canvas);
  });

  test("reports no adjustment ratio below AA, so the panel never labels a failure a correction", () => {
    for (const theme of [readable, fogOnFog]) {
      for (const adjustment of gateContrast(theme.colors).adjustments) {
        expect(adjustment.ratio).toBeGreaterThanOrEqual(AA_RATIO);
      }
    }
  });
});

describe("toTokenValues", () => {
  test("derives the tokens the model is never asked for", () => {
    const { tokens } = toTokenValues(readable);

    expect(tokens["--popover"]).toBe(tokens["--card"]);
    expect(tokens["--input"]).toBe(tokens["--border"]);
    expect(tokens["--secondary-foreground"]).toBe(tokens["--foreground"]);
    expect(tokens["--radius"]).toBe("0.625rem");
  });

  test("picks the destructive foreground that reads against the authored fill", () => {
    const onDarkFill = toTokenValues(readable).tokens["--destructive-foreground"];
    const light = { ...readable, colors: { ...readable.colors, destructive: flat(0.92, 0.08, 25) } };

    expect(onDarkFill).toContain("oklch(1");
    expect(toTokenValues(light).tokens["--destructive-foreground"]).toContain("oklch(0 ");
  });

  // The exponents in the ladder were measured against these defaults, so drift here means a step moved.
  test("reproduces the stock type ladder at the default base and scale", () => {
    const { tokens } = toTokenValues(readable);
    const stock = { "--text-micro": 0.625, "--text-label": 0.75, "--text-body": 0.875, "--text-heading-1": 1.875, "--text-display": 2.25 };

    for (const [name, rem] of Object.entries(stock)) expect(Number.parseFloat(tokens[name])).toBeCloseTo(rem, 2);
  });

  test("spreads the ladder around the body size as the scale grows", () => {
    const loud = { ...readable, typography: { ...readable.typography, baseSize: 1, scale: 1.25 } };
    const { tokens } = toTokenValues(loud);

    expect(tokens["--text-body"]).toBe("1rem");
    expect(Number.parseFloat(tokens["--text-display"])).toBeGreaterThan(2.25);
    expect(Number.parseFloat(tokens["--text-micro"])).toBeLessThan(1);
  });

  // A dramatic heading scale is no reason to render a 7px caption or a 200px display.
  test("keeps every rung legible at the loudest scale the schema allows", () => {
    const { tokens } = toTokenValues({
      ...readable,
      typography: { fontFamily: "geometric", baseSize: 0.875, scale: 1.25, headingWeight: 800, headingTracking: -0.04 },
    });
    const rem = (name: string) => Number.parseFloat(tokens[name]);

    expect(rem("--text-micro")).toBeGreaterThanOrEqual(0.625);
    expect(rem("--text-caption")).toBeGreaterThanOrEqual(0.625);
    expect(rem("--text-display")).toBeLessThanOrEqual(5);
  });

  // A family the document never loaded falls back to the current font, so the theme would look unchanged.
  test("resolves the typeface to a family the app actually serves", () => {
    const family = (fontFamily: "geometric" | "neutral" | "mono" | "system") =>
      toTokenValues({ ...readable, typography: { ...readable.typography, fontFamily } }).tokens["--font-sans"];

    expect(family("geometric")).toBe("var(--font-geist-sans)");
    expect(family("mono")).toBe("var(--font-jetbrains-mono)");
    expect(family("system")).toContain("system-ui");
  });

  test("tightens heading line height as the rung climbs", () => {
    const { tokens } = toTokenValues(readable);
    const lineHeight = (name: string) => Number(tokens[`${name}--line-height`]);

    expect(lineHeight("--text-heading-4")).toBeGreaterThan(lineHeight("--text-heading-1"));
    expect(lineHeight("--text-display")).toBeGreaterThanOrEqual(1.05);
  });

  test("tints the shadow with the brand hue instead of leaving it grey", () => {
    const { tokens } = toTokenValues({ ...readable, colors: { ...readable.colors, primary: { L: 0.6, C: 0.2, H: 300 } } });

    expect(tokens["--shadow-color"]).toContain("300");
    expect(Number.parseFloat(tokens["--shadow-color"].replace("oklch(", ""))).toBeLessThan(0.3);
  });

  test("derives the motion ramp and easing from one duration", () => {
    const { tokens } = toTokenValues({ ...readable, motion: { baseDuration: 200, easing: "springy" } });

    expect(tokens["--duration-fast"]).toBe("150ms");
    expect(tokens["--duration-slow"]).toBe("300ms");
    expect(tokens["--ease-standard"]).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
  });
});

describe("toStreamingTokenValues", () => {
  test("emits derived tokens alongside the roles that have landed", () => {
    const tokens = toStreamingTokenValues({ colors: { card: flat(1, 0, 0), cardForeground: flat(0.2, 0, 0) } });

    expect(tokens["--popover"]).toBe(tokens["--card"]);
    expect(tokens["--popover-foreground"]).toBe(tokens["--card-foreground"]);
    expect(tokens["--primary"]).toBeUndefined();
  });

  test("ignores half-written colours rather than painting a broken value", () => {
    const tokens = toStreamingTokenValues({ colors: { primary: { L: 0.5, C: 0.2 }, border: flat(0.9, 0, 0) } });

    expect(tokens["--primary"]).toBeUndefined();
    expect(tokens["--border"]).toBe("oklch(0.9 0 0)");
  });

  test("paints a group as soon as it lands and skips one that is still being written", () => {
    const tokens = toStreamingTokenValues({ motion: { baseDuration: 400, easing: "smooth" }, layout: { controlHeight: 44 } });

    expect(tokens["--duration-base"]).toBe("400ms");
    expect(tokens["--control-h"]).toBeUndefined();
  });

  test("returns nothing for a chunk that is not a theme", () => {
    expect(toStreamingTokenValues("still thinking")).toEqual({});
  });
});
