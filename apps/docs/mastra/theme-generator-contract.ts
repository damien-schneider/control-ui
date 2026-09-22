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

// The model authors the roots of each group and nothing else. theme.css already derives the rest —
// --radius-sm from --radius, --control-h-sm from --control-h — so a handful of numbers moves the whole
// system, and asking for all 130 contract tokens would only give the model ways to contradict itself.
export const generatedThemeSchema = z.object({
  name: z.string().min(1).max(48).describe("Short human name for the theme"),
  skin: z
    .enum(["none", "refined", "modern-apple", "linear", "cuicui", "rig", "liquid-metal", "xp", "windows-98"])
    .describe(
      [
        "The base skin, which carries the depth effects tokens cannot express — gradients, backdrop blur, rims, glow.",
        "none: flat surfaces, square corners, no shadow.",
        "refined: quiet neutral craft, pill controls, layered shadows.",
        "modern-apple: glass with live backdrop blur, canvas gradient and paired rims.",
        "linear: dark product UI, tight type, subtle gradients.",
        "cuicui: saturated gradients and animated gradient adornments.",
        "rig: brutalist, squared, dense.",
        "liquid-metal: polished metal shader surface.",
        "xp and windows-98: period operating system chrome — only for an explicitly retro brief.",
      ].join(" "),
    ),
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
  radius: z.number().min(0).max(1.75).describe("Base corner radius in rem; 0 is square, 0.625 is the default"),
  cornerShape: z.enum(["round", "squircle"]).describe("round is a normal corner, squircle is the softer Apple-style curve"),
  typography: z.object({
    fontFamily: z
      .enum(["geometric", "neutral", "mono", "system"])
      .describe("Typeface character: geometric is Geist, neutral is Inter, mono is JetBrains Mono, system is the OS default"),
    baseSize: z.number().min(0.75).max(1.125).describe("Body text size in rem; 0.875 is the default"),
    scale: z.number().min(1.05).max(1.25).describe("Ratio between type steps; 1.125 is the default, 1.25 is dramatic"),
    headingWeight: z.number().min(400).max(900).describe("Font weight for headings; 600 is the default"),
    headingTracking: z.number().min(-0.06).max(0.08).describe("Heading letter spacing in em; negative is tighter"),
  }),
  shadow: z.object({
    size: z.number().min(0).max(3).describe("Shadow spread; 0 is flat, 1 is normal, 3 is dramatic"),
    opacity: z.number().min(0).max(1).describe("Shadow strength"),
    y: z.number().min(0).max(4).describe("Downward shadow offset"),
  }),
  motion: z.object({
    baseDuration: z.number().min(60).max(600).describe("Base transition duration in ms; 200 is the default"),
    easing: z.enum(["standard", "snappy", "smooth", "springy"]).describe("Character of the motion curve"),
  }),
  layout: z.object({
    controlHeight: z.number().min(26).max(56).describe("Height of buttons and inputs in px; 36 is the default"),
    paddingX: z.number().min(6).max(32).describe("Horizontal padding inside controls in px; 16 is the default"),
    paddingY: z.number().min(2).max(20).describe("Vertical padding inside controls in px; 10 is the default"),
    focusRingWidth: z.number().min(1).max(4).describe("Focus ring thickness in px; 2 is the default"),
    controlRimWidth: z.number().min(0).max(2).describe("Hairline around controls in px; 1 is the default, 0 removes it"),
  }),
  surface: z.object({
    overlayOpacity: z.number().min(0).max(0.9).describe("Darkness of the scrim behind modals; 0.2 is the default"),
    backdropBlur: z.number().min(0).max(24).describe("Blur behind popovers and overlays in px; 0 is the default"),
    popoverOpacity: z.number().min(0.5).max(1).describe("Opacity of popover surfaces; 1 is solid, below 1 reads as glass"),
    scrollFadeSize: z.number().min(0).max(48).describe("Height of the fade at scroll edges in px; 0 is a hard edge"),
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

// The only families the app actually loads (app/layout.tsx), plus the stock system stack. The named face
// sits inside the var() fallback, not after it: in an app without these next/font variables, an undefined
// `var(--font-geist-sans), "Geist"` is invalid at computed-value time, so the whole declaration is thrown
// away and the rest of the list never gets a turn.
const FONT_STACKS: Record<GeneratedTheme["typography"]["fontFamily"], string> = {
  geometric: 'var(--font-geist-sans, "Geist"), ui-sans-serif, system-ui, sans-serif',
  neutral: 'var(--font-inter, "Inter"), ui-sans-serif, system-ui, sans-serif',
  mono: 'var(--font-jetbrains-mono, "JetBrains Mono"), ui-monospace, SFMono-Regular, monospace',
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
};

const EASING_CURVES: Record<GeneratedTheme["motion"]["easing"], string> = {
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

function typographyTokens({ fontFamily, baseSize, scale, headingWeight, headingTracking }: GeneratedTheme["typography"]): TokenValues {
  const tokens: TokenValues = { "--font-sans": FONT_STACKS[fontFamily] };
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

const { typography, shadow, motion, layout, surface } = generatedThemeSchema.shape;

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

export function toTokenValues(theme: GeneratedTheme): { tokens: TokenValues; adjustments: ContrastAdjustment[] } {
  const { colors, adjustments } = gateContrast(theme.colors);
  const tokens: TokenValues = {
    ...tokensFromColors(colors),
    "--radius": `${theme.radius}rem`,
    "--corner-shape": theme.cornerShape,
    ...GROUP_TOKENS.typography(theme.typography),
    ...GROUP_TOKENS.shadow(theme.shadow),
    ...GROUP_TOKENS.motion(theme.motion),
    ...GROUP_TOKENS.layout(theme.layout),
    ...GROUP_TOKENS.surface(theme.surface),
  };
  return { tokens, adjustments };
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
    const color = lch.safeParse(streaming.data.colors?.[role]);
    if (color.success) landed[role] = color.data;
  }

  const tokens = tokensFromColors(landed);
  if (typeof streaming.data.radius === "number") tokens["--radius"] = `${streaming.data.radius}rem`;
  if (streaming.data.cornerShape) tokens["--corner-shape"] = streaming.data.cornerShape;

  for (const [group, build] of Object.entries(GROUP_TOKENS)) Object.assign(tokens, build(streaming.data[group]));

  return tokens;
}

export type GeneratedSkin = GeneratedTheme["skin"];

const streamingSkinSchema = z.looseObject({ skin: generatedThemeSchema.shape.skin.optional() });

export function skinOf(chunk: unknown): GeneratedSkin | null {
  const streaming = streamingSkinSchema.safeParse(chunk);
  return streaming.success ? (streaming.data.skin ?? null) : null;
}
