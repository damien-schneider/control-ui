import { z } from "zod";

import { skinMetas } from "@/app/(features)/catalog/skins";
import {
  AA_RATIO,
  contrastFromRgb,
  fitLightnessForContrast,
  type Oklch,
  oklchColor,
  oklchToRgb,
} from "@/components/theme-drawer/color-math";
import type { TokenValues } from "@/components/theme-drawer/types";
import { findThemeFont, themeFontUrl } from "./theme-fonts";

// One list of skins, the one the docs already ship: a hand-typed copy here would go stale the next time
// a skin pack lands, and the model would keep offering an id the editor cannot select.
const SKIN_IDS = skinMetas.map((meta) => meta.id);

// The model authors channel triplets, never CSS strings: the contrast gate is then pure arithmetic on
// the server, and no model-authored text ever reaches a stylesheet.
export const oklchChannels = z.object({
  L: z.number().min(0).max(1).describe("OKLCH lightness, 0 black to 1 white"),
  C: z.number().min(0).max(0.37).describe("OKLCH chroma, 0 grey to ~0.37 vivid"),
  H: z.number().min(0).max(360).describe("OKLCH hue angle in degrees"),
});

// The model authors the roots of each group and nothing else. theme.css already derives the rest —
// --radius-sm from --radius, --control-h-sm from --control-h — so a handful of numbers moves the whole
// system, and asking for all 130 contract tokens would only give the model ways to contradict itself.
export const generatedThemeSchema = z.object({
  name: z.string().min(1).max(48).describe("Short human name for the theme"),
  skin: z
    .enum(SKIN_IDS)
    .describe(
      [
        "The base skin, which carries the depth tokens cannot express — gradients, live backdrop blur, refraction rims, glow, animated adornments.",
        "A gradient-washed marketing site or a glassy dashboard is one of these skins with its tokens tuned to the brief, never a flat surface approximating one.",
        "Reach for xp or windows-98 only when the brief is explicitly retro.",
        ...skinMetas.map((meta) => `${meta.id}: ${meta.description}`),
      ].join(" "),
    ),
  colors: z.object({
    canvas: oklchChannels.describe("Page paper behind every panel"),
    background: oklchChannels.describe("Base surface of panels and bubbles"),
    foreground: oklchChannels.describe("Default text on background and canvas"),
    card: oklchChannels.describe("Elevated card surface"),
    cardForeground: oklchChannels.describe("Text on card"),
    primary: oklchChannels.describe("The brand colour used by primary actions"),
    primaryForeground: oklchChannels.describe("Text on primary"),
    muted: oklchChannels.describe("Subdued fill for quiet surfaces"),
    mutedForeground: oklchChannels.describe("Secondary and meta text"),
    secondary: oklchChannels.describe("Secondary action fill"),
    accent: oklchChannels.describe("Hover and selection highlight fill"),
    destructive: oklchChannels.describe("Destructive action colour"),
    border: oklchChannels.describe("Hairline border colour"),
    ring: oklchChannels.describe("Focus ring colour"),
  }),
  radius: z.number().min(0).max(1.75).describe("Base corner radius in rem; 0 is square, 0.625 is the default").optional(),
  cornerShape: z.enum(["round", "squircle"]).describe("round is a normal corner, squircle is the softer Apple-style curve").optional(),
  typography: z
    .object({
      fontFamily: z
        .string()
        .min(1)
        .max(64)
        .describe(
          [
            "Typeface. One of the four families the app already loads — geometric (Geist), neutral (Inter), mono (JetBrains Mono), system —",
            "or any Google Fonts family name, given exactly as Google spells it.",
            "The four bundled ones need no network request, so prefer them unless the mood really calls for a distinctive face.",
            "An unknown name is ignored and the current face is kept.",
          ].join(" "),
        ),
      baseSize: z.number().min(0.75).max(1.125).describe("Body text size in rem; 0.875 is the default"),
      scale: z.number().min(1.05).max(1.25).describe("Ratio between type steps; 1.125 is the default, 1.25 is dramatic"),
      headingWeight: z.number().min(400).max(900).describe("Font weight for headings; 600 is the default"),
      headingTracking: z.number().min(-0.06).max(0.08).describe("Heading letter spacing in em; negative is tighter"),
    })
    .optional(),
  shadow: z
    .object({
      size: z.number().min(0).max(3).describe("Shadow spread; 0 is flat, 1 is normal, 3 is dramatic"),
      opacity: z.number().min(0).max(1).describe("Shadow strength"),
      y: z.number().min(0).max(4).describe("Downward shadow offset"),
    })
    .optional(),
  motion: z
    .object({
      baseDuration: z.number().min(60).max(600).describe("Base transition duration in ms; 200 is the default"),
      easing: z.enum(["standard", "snappy", "smooth", "springy"]).describe("Character of the motion curve"),
    })
    .optional(),
  layout: z
    .object({
      controlHeight: z.number().min(26).max(56).describe("Height of buttons and inputs in px; 36 is the default"),
      paddingX: z.number().min(6).max(32).describe("Horizontal padding inside controls in px; 16 is the default"),
      paddingY: z.number().min(2).max(20).describe("Vertical padding inside controls in px; 10 is the default"),
      focusRingWidth: z.number().min(1).max(4).describe("Focus ring thickness in px; 2 is the default"),
      controlRimWidth: z.number().min(0).max(2).describe("Hairline around controls in px; 1 is the default, 0 removes it"),
    })
    .optional(),
  surface: z
    .object({
      overlayOpacity: z.number().min(0).max(0.9).describe("Darkness of the scrim behind modals; 0.2 is the default"),
      backdropBlur: z.number().min(0).max(24).describe("Blur behind popovers and overlays in px; 0 is the default"),
      popoverOpacity: z.number().min(0.5).max(1).describe("Opacity of popover surfaces; 1 is solid, below 1 reads as glass"),
      scrollFadeSize: z.number().min(0).max(48).describe("Height of the fade at scroll edges in px; 0 is a hard edge"),
    })
    .optional(),
});

export type GeneratedTheme = z.infer<typeof generatedThemeSchema>;
export type ColorRole = keyof GeneratedTheme["colors"];
// Optional on the wire, never optional once a group has actually landed.
type ThemeGroup<K extends keyof GeneratedTheme> = NonNullable<GeneratedTheme[K]>;
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
export const CONTRAST_GATED_PAIRS: readonly (readonly [ColorRole, ColorRole])[] = [
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

  for (const [foregroundRole, surfaceRole] of CONTRAST_GATED_PAIRS) {
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
  // A grey shadow under a warm palette reads as dirt. Keep it dark and mostly neutral, but carry the
  // brand hue so depth belongs to the theme instead of sitting on top of it.
  if (colors.primary) tokens["--shadow-color"] = cssColor({ L: 0.22, C: Math.min(colors.primary.C * 0.25, 0.05), H: colors.primary.H });

  return tokens;
}

// Exponents on the type scale, measured so that scale 1.125 with base 0.875rem reproduces the stock
// ladder exactly. A larger scale then spreads the same ladder rather than inventing a new shape.
const TYPE_STEPS = [
  ["--text-micro", -2.86],
  ["--text-caption", -2.05],
  ["--text-label", -1.31],
  ["--text-body", 0],
  ["--text-heading-4", 0.59],
  ["--text-body-lg", 1.13],
  ["--text-heading-3", 2.13],
  ["--text-heading-2", 3.84],
  ["--text-heading-1", 6.47],
  ["--text-display", 8.02],
] as const;

const HEADING_TOKENS = ["--text-heading-4", "--text-heading-3", "--text-heading-2", "--text-heading-1", "--text-display"] as const;

const EASING_CURVES: Record<ThemeGroup<"motion">["easing"], string> = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  snappy: "cubic-bezier(0.3, 0, 0.1, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  springy: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const round = (value: number, places: number) => Number(value.toFixed(places));

// The ladder spans exponents -2.86 to 8.02, so it is exponentially sensitive at both ends. Below body the
// scale is held at the stock ratio — small text has no room to shrink and a dramatic heading scale is no
// reason to render a 7px caption — and every rung is clamped into a legible window, the typographic
// equivalent of the contrast gate the colours get.
const MIN_REM = 0.625;
const MAX_REM = 5;
const STOCK_SCALE = 1.125;

function typographyTokens({ fontFamily, baseSize, scale, headingWeight, headingTracking }: ThemeGroup<"typography">): TokenValues {
  const font = findThemeFont(fontFamily);
  const tokens: TokenValues = font ? { "--font-sans": font.stack } : {};
  for (const [name, step] of TYPE_STEPS) {
    const size = baseSize * (step < 0 ? Math.min(scale, STOCK_SCALE) : scale) ** step;
    tokens[name] = `${round(Math.min(Math.max(size, MIN_REM), MAX_REM), 4)}rem`;
  }
  for (const [name, step] of TYPE_STEPS) {
    if (!HEADING_TOKENS.some((heading) => heading === name)) continue;
    tokens[`${name}--font-weight`] = `${Math.round(headingWeight)}`;
    // Line height is unitless, so it only needs to tighten as the rung climbs; at the stock scale this
    // lands within 0.05 of the hand-tuned defaults.
    tokens[`${name}--line-height`] = `${round(Math.max(1.45 - step * 0.05, 1.05), 3)}`;
  }

  tokens["--text-heading-1--letter-spacing"] = `${round(headingTracking, 4)}em`;
  tokens["--text-display--letter-spacing"] = `${round(headingTracking * 1.4, 4)}em`;
  return tokens;
}

// One builder per group, each parsing its own slice of the contract. The streaming path feeds it a group
// that may still be half-written and the final path feeds it a validated one, so both paint from the same
// rules and an incomplete group simply yields nothing.
function groupTokens<T>(schema: z.ZodType<T>, build: (value: T) => TokenValues) {
  return (value: unknown): TokenValues => {
    const parsed = schema.safeParse(value);
    return parsed.success ? build(parsed.data) : {};
  };
}

// Every group but the palette is optional on the wire: a stream that stops early still yields a theme
// whose colours are right, and the groups that never arrived keep whatever the chosen skin sets. The
// token builders need the inner object, not the optional wrapper.
const { typography, shadow, motion, layout, surface } = {
  typography: generatedThemeSchema.shape.typography.unwrap(),
  shadow: generatedThemeSchema.shape.shadow.unwrap(),
  motion: generatedThemeSchema.shape.motion.unwrap(),
  layout: generatedThemeSchema.shape.layout.unwrap(),
  surface: generatedThemeSchema.shape.surface.unwrap(),
};

const GROUP_TOKENS = {
  typography: groupTokens(typography, typographyTokens),
  shadow: groupTokens(shadow, ({ size, opacity, y }) => ({
    "--shadow-size": `${round(size, 3)}`,
    "--shadow-opacity": `${round(opacity, 3)}`,
    "--shadow-y": `${round(y, 3)}`,
  })),
  motion: groupTokens(motion, ({ baseDuration, easing }) => ({
    "--duration-fast": `${Math.round(baseDuration * 0.75)}ms`,
    "--duration-base": `${Math.round(baseDuration)}ms`,
    "--duration-slow": `${Math.round(baseDuration * 1.5)}ms`,
    "--ease-standard": EASING_CURVES[easing],
    "--ease-emphasized": EASING_CURVES[easing === "standard" ? "springy" : easing],
  })),
  layout: groupTokens(layout, ({ controlHeight, paddingX, paddingY, focusRingWidth, controlRimWidth }) => ({
    "--control-h": `${Math.round(controlHeight)}px`,
    "--padding-x": `${Math.round(paddingX)}px`,
    "--padding-y": `${Math.round(paddingY)}px`,
    "--focus-ring-width": `${Math.round(focusRingWidth)}px`,
    "--control-rim-width": `${round(controlRimWidth, 2)}px`,
    // Popover padding is the inner gutter of the same control language, so it tracks vertical padding
    // rather than being a knob the model can set out of step with it.
    "--popover-padding": `${round(Math.max(paddingY * 0.25, 2) / 16, 4)}rem`,
  })),
  surface: groupTokens(surface, ({ overlayOpacity, backdropBlur, popoverOpacity, scrollFadeSize }) => ({
    "--overlay-opacity": `${round(overlayOpacity, 3)}`,
    "--backdrop-blur-overlay": `${Math.round(backdropBlur)}px`,
    "--backdrop-blur-popover": `${Math.round(backdropBlur)}px`,
    "--popover-opacity": `${round(popoverOpacity, 3)}`,
    "--scroll-fade-size": `${Math.round(scrollFadeSize)}px`,
  })),
};

export type GeneratedFont = { family: string; url: string | null };
export type GeneratedThemeTokens = { tokens: TokenValues; adjustments: ContrastAdjustment[]; font: GeneratedFont | null };

export function toTokenValues(theme: GeneratedTheme): GeneratedThemeTokens {
  const { colors, adjustments } = gateContrast(theme.colors);
  const tokens: TokenValues = {
    ...tokensFromColors(colors),
    ...(theme.radius === undefined ? {} : { "--radius": `${theme.radius}rem` }),
    ...(theme.cornerShape === undefined ? {} : { "--corner-shape": theme.cornerShape }),
    ...GROUP_TOKENS.typography(theme.typography),
    ...GROUP_TOKENS.shadow(theme.shadow),
    ...GROUP_TOKENS.motion(theme.motion),
    ...GROUP_TOKENS.layout(theme.layout),
    ...GROUP_TOKENS.surface(theme.surface),
  };
  // Left unwritten when the model named no resolvable family, the same way an absent radius or depth group
  // is: selectSkin clears every override before a finished theme is applied, so the skin's own face is what
  // remains rather than a stale one. The streaming path needs this too — a half-arrived "Playf" is a valid
  // string, and resolving it to a default would paint one face and swap to another on complete.
  if (theme.typography === undefined) return { tokens, adjustments, font: null };

  const font = findThemeFont(theme.typography.fontFamily);
  return { tokens, adjustments, font: font ? { family: font.family, url: themeFontUrl(font) } : null };
}

// Every group is optional here because the model streams them one at a time: each lands the moment it is
// complete and valid, and a half-written group simply is not painted yet. Contrast gating is deliberately
// skipped, because a half-built palette has no stable pairs to gate against.
const streamingThemeSchema = z.looseObject({
  colors: z.record(z.string(), z.unknown()).optional(),
  radius: z.number().min(0).max(1.75).optional(),
  cornerShape: generatedThemeSchema.shape.cornerShape.optional(),
});

export function toStreamingTokenValues(chunk: unknown): TokenValues {
  const streaming = streamingThemeSchema.safeParse(chunk);
  if (!streaming.success) return {};

  const landed: Partial<Record<ColorRole, Oklch>> = {};
  for (const [role] of COLOR_ROLE_TOKENS) {
    const color = oklchChannels.safeParse(streaming.data.colors?.[role]);
    if (color.success) landed[role] = color.data;
  }

  const tokens = tokensFromColors(landed);
  if (typeof streaming.data.radius === "number") tokens["--radius"] = `${streaming.data.radius}rem`;
  if (streaming.data.cornerShape) tokens["--corner-shape"] = streaming.data.cornerShape;

  for (const [group, build] of Object.entries(GROUP_TOKENS)) Object.assign(tokens, build(streaming.data[group]));

  return tokens;
}
