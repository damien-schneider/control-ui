import { z } from "zod";

import {
  AA_RATIO,
  contrastFromRgb,
  fitLightnessForContrast,
  type Oklch,
  oklchColor,
  oklchToRgb,
} from "@/components/theme-drawer/color-math";
import type { TokenValues } from "@/components/theme-drawer/types";

// The model authors channel triplets, never CSS strings: the contrast gate is then pure arithmetic on
// the server, and no model-authored text ever reaches a stylesheet.
const lch = z.object({
  L: z.number().min(0).max(1).describe("OKLCH lightness, 0 black to 1 white"),
  C: z.number().min(0).max(0.37).describe("OKLCH chroma, 0 grey to ~0.37 vivid"),
  H: z.number().min(0).max(360).describe("OKLCH hue angle in degrees"),
});

// Every other contract token derives from these; asking for the full contract would quadruple output
// tokens and give the model a hundred ways to contradict itself.
export const generatedThemeSchema = z.object({
  name: z.string().min(1).max(48).describe("Short human name for the palette"),
  appearance: z.enum(["light", "dark"]).describe("Whether the palette reads as a light or dark theme"),
  radius: z.number().min(0).max(1.75).describe("Base corner radius in rem; 0 is square, 0.625 is the default"),
  colors: z.object({
    canvas: lch.describe("Page paper behind every panel"),
    background: lch.describe("Base surface of panels and bubbles"),
    foreground: lch.describe("Default text on background and canvas"),
    card: lch.describe("Elevated card surface"),
    cardForeground: lch.describe("Text on card"),
    primary: lch.describe("The brand colour used by primary actions"),
    primaryForeground: lch.describe("Text on primary"),
    muted: lch.describe("Subdued fill for quiet surfaces"),
    mutedForeground: lch.describe("Secondary and meta text"),
    secondary: lch.describe("Secondary action fill"),
    accent: lch.describe("Hover and selection highlight fill"),
    destructive: lch.describe("Destructive action colour"),
    border: lch.describe("Hairline border colour"),
    ring: lch.describe("Focus ring colour"),
  }),
});

export type GeneratedTheme = z.infer<typeof generatedThemeSchema>;
export type ColorRole = keyof GeneratedTheme["colors"];
type GeneratedColors = GeneratedTheme["colors"];

export const COLOR_ROLE_TOKENS = [
  ["canvas", "--canvas"],
  ["background", "--background"],
  ["foreground", "--foreground"],
  ["card", "--card"],
  ["cardForeground", "--card-foreground"],
  ["primary", "--primary"],
  ["primaryForeground", "--primary-foreground"],
  ["muted", "--muted"],
  ["mutedForeground", "--muted-foreground"],
  ["secondary", "--secondary"],
  ["accent", "--accent"],
  ["destructive", "--destructive"],
  ["border", "--border"],
  ["ring", "--ring"],
] as const satisfies readonly (readonly [ColorRole, string])[];

// Mirrors CONTRAST_PAIRS, expressed in generated roles so the gate never needs resolved custom
// properties off a live document.
const GATED_PAIRS: readonly (readonly [ColorRole, ColorRole])[] = [
  ["cardForeground", "card"],
  ["mutedForeground", "card"],
  ["foreground", "canvas"],
  ["primaryForeground", "primary"],
];

export type ContrastAdjustment = { role: ColorRole; from: Oklch; to: Oklch; ratio: number };

// The model proposes hues, this decides readability. Lightness moves first so the palette keeps its
// identity; a tinted foreground that still cannot clear AA at any lightness loses its chroma too,
// because an unreadable label is a worse outcome than a slightly desaturated one.
export function gateContrast(colors: GeneratedColors): { colors: GeneratedColors; adjustments: ContrastAdjustment[] } {
  const gated: GeneratedColors = { ...colors };
  const adjustments: ContrastAdjustment[] = [];

  for (const [foregroundRole, surfaceRole] of GATED_PAIRS) {
    const foreground = gated[foregroundRole];
    const surface = gated[surfaceRole];
    const surfaceRgb = oklchToRgb(surface.L, surface.C, surface.H);

    const fittedLightness = fitLightnessForContrast(foreground, [surfaceRgb], AA_RATIO);
    if (fittedLightness === null) continue;

    let fitted: Oklch = { ...foreground, L: fittedLightness };
    let ratio = contrastFromRgb(oklchToRgb(fitted.L, fitted.C, fitted.H), surfaceRgb);

    if (ratio < AA_RATIO && foreground.C > 0) {
      const neutral: Oklch = { L: foreground.L, C: 0, H: foreground.H };
      const neutralLightness = fitLightnessForContrast(neutral, [surfaceRgb], AA_RATIO) ?? neutral.L;
      const neutralRatio = contrastFromRgb(oklchToRgb(neutralLightness, 0, foreground.H), surfaceRgb);
      if (neutralRatio > ratio) {
        fitted = { L: neutralLightness, C: 0, H: foreground.H };
        ratio = neutralRatio;
      }
    }

    gated[foregroundRole] = fitted;
    adjustments.push({ role: foregroundRole, from: foreground, to: fitted, ratio });
  }

  return { colors: gated, adjustments };
}

const cssColor = ({ L, C, H }: Oklch) => oklchColor(L, C, H);

// Black or white on the destructive fill, whichever reads better. The model never gets a say, because
// the only two defensible answers follow from the fill it already chose.
function destructiveForeground(destructive: Oklch): Oklch {
  const fill = oklchToRgb(destructive.L, destructive.C, destructive.H);
  const white = contrastFromRgb(oklchToRgb(1, 0, 0), fill);
  const black = contrastFromRgb(oklchToRgb(0, 0, 0), fill);
  return { L: white >= black ? 1 : 0, C: 0, H: 0 };
}

// Derived tokens are computed from whichever roles have landed, so a half-streamed palette never shows
// a new fill under the previous theme's text colour.
function tokensFromColors(colors: Partial<Record<ColorRole, Oklch>>): TokenValues {
  const tokens: TokenValues = {};
  for (const [role, name] of COLOR_ROLE_TOKENS) {
    const color = colors[role];
    if (color) tokens[name] = cssColor(color);
  }

  if (colors.card) tokens["--popover"] = cssColor(colors.card);
  if (colors.cardForeground) tokens["--popover-foreground"] = cssColor(colors.cardForeground);
  if (colors.foreground) {
    tokens["--secondary-foreground"] = cssColor(colors.foreground);
    tokens["--accent-foreground"] = cssColor(colors.foreground);
  }
  if (colors.destructive) tokens["--destructive-foreground"] = cssColor(destructiveForeground(colors.destructive));
  if (colors.border) tokens["--input"] = cssColor(colors.border);

  return tokens;
}

export function toTokenValues(theme: GeneratedTheme): { tokens: TokenValues; adjustments: ContrastAdjustment[] } {
  const { colors, adjustments } = gateContrast(theme.colors);
  return { tokens: { ...tokensFromColors(colors), "--radius": `${theme.radius}rem` }, adjustments };
}

const streamingThemeSchema = z.looseObject({
  radius: z.number().min(0).max(1.75).optional(),
  colors: z.record(z.string(), z.unknown()).optional(),
});

// Roles arrive one at a time while the model streams, so the drawer paints each the moment it lands.
// Contrast gating is deliberately skipped: a half-built palette has no stable pairs to gate against yet.
export function toStreamingTokenValues(chunk: unknown): TokenValues {
  const streaming = streamingThemeSchema.safeParse(chunk);
  if (!streaming.success) return {};

  const landed: Partial<Record<ColorRole, Oklch>> = {};
  for (const [role] of COLOR_ROLE_TOKENS) {
    const color = lch.safeParse(streaming.data.colors?.[role]);
    if (color.success) landed[role] = color.data;
  }

  const tokens = tokensFromColors(landed);
  if (typeof streaming.data.radius === "number") tokens["--radius"] = `${streaming.data.radius}rem`;
  return tokens;
}
