import { BADGE_HUES, THEME_CONTRACT, type ThemeContractGroup, type ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { CORNER_LABEL, EASE, EASE_LABEL, FONT, FONT_LABEL, FONT_MONO, FONT_MONO_LABEL } from "./types";

// Editor-side metadata over token contract SSOT (lib/theme-contract.ts): which CONTROL each token gets, slider range, preset options, human label.
// Contract stays single source of names/groups/tiers — this module only decides how each is EDITED.
// A token added to the contract auto-appears in editor (text-input fallback until it gets a richer spec).

export type SliderSpec = { kind: "slider"; min: number; max: number; step: number; unit: "px" | "ms" | "" };
export type SelectOption = { label: string; value: string };
export type SelectSpec = { kind: "select"; options: readonly SelectOption[] };
export type TokenControlSpec = { kind: "color" } | { kind: "text" } | SliderSpec | SelectSpec;

const slider = (min: number, max: number, step: number, unit: SliderSpec["unit"]): SliderSpec => ({
  kind: "slider",
  min,
  max,
  step,
  unit,
});

// Preset options reuse value maps old enum knobs shipped (types.ts) — select now authors raw CSS value, off-preset skin value displays as "Custom".
const FONT_OPTIONS: readonly SelectOption[] = [
  { label: FONT_LABEL.mono, value: FONT.mono },
  { label: FONT_LABEL.system, value: FONT.system },
  { label: FONT_LABEL.helvetica, value: FONT.helvetica },
];
const MONO_OPTIONS: readonly SelectOption[] = [
  { label: FONT_MONO_LABEL.system, value: FONT_MONO.system },
  { label: FONT_MONO_LABEL.menlo, value: FONT_MONO.menlo },
  { label: FONT_MONO_LABEL.jetbrains, value: FONT_MONO.jetbrains },
];
const EASE_OPTIONS: readonly SelectOption[] = [
  { label: EASE_LABEL.standard, value: EASE.standard },
  { label: EASE_LABEL.emphasized, value: EASE.emphasized },
  { label: EASE_LABEL.linear, value: EASE.linear },
];
const CORNER_OPTIONS: readonly SelectOption[] = [
  { label: CORNER_LABEL.round, value: "round" },
  { label: CORNER_LABEL.squircle, value: "squircle" },
  { label: CORNER_LABEL.scoop, value: "scoop" },
];

// Ranges for tokens whose value space is known; absent tokens fall through to generic rules in tokenControlSpec, then raw text input — never hidden.
const SLIDER_SPECS: Record<string, SliderSpec> = {
  "--radius": slider(0, 32, 1, "px"),
  "--radius-sm": slider(0, 48, 1, "px"),
  "--radius-md": slider(0, 48, 1, "px"),
  "--radius-lg": slider(0, 48, 1, "px"),
  "--radius-xl": slider(0, 48, 1, "px"),
  "--radius-2xl": slider(0, 48, 1, "px"),
  "--radius-control": slider(0, 48, 1, "px"),
  "--radius-field": slider(0, 48, 1, "px"),
  "--radius-panel": slider(0, 48, 1, "px"),
  "--radius-scene": slider(0, 48, 1, "px"),
  "--radius-popup-item": slider(0, 48, 1, "px"),
  "--radius-popover": slider(0, 48, 1, "px"),
  "--ring-opacity": slider(0, 1, 0.01, ""),
  "--popover-opacity": slider(0, 1, 0.01, ""),
  "--overlay-opacity": slider(0, 1, 0.01, ""),
  "--popup-item-disabled-opacity": slider(0, 1, 0.01, ""),
  "--shadow-size": slider(0, 2, 0.05, ""),
  "--shadow-opacity": slider(0, 2, 0.05, ""),
  "--shadow-y": slider(0, 2, 0.05, ""),
  "--shadow-control-multiplier": slider(0, 3, 0.05, ""),
  "--shadow-panel-multiplier": slider(0, 3, 0.05, ""),
  "--shadow-popover-multiplier": slider(0, 3, 0.05, ""),
  "--shadow-modal-multiplier": slider(0, 3, 0.05, ""),
  "--shadow-ambient-multiplier": slider(0, 3, 0.05, ""),
  "--backdrop-blur-popover": slider(0, 32, 1, "px"),
  "--backdrop-blur-overlay": slider(0, 32, 1, "px"),
  "--scroll-fade-size": slider(0, 64, 1, "px"),
  "--popover-padding": slider(0, 24, 1, "px"),
  "--padding-x": slider(0, 32, 1, "px"),
  "--padding-y": slider(0, 24, 1, "px"),
  "--control-h": slider(20, 64, 1, "px"),
  "--control-h-xs": slider(16, 64, 1, "px"),
  "--control-h-sm": slider(16, 64, 1, "px"),
  "--control-h-md": slider(16, 64, 1, "px"),
  "--control-h-lg": slider(16, 64, 1, "px"),
  "--duration-fast": slider(0, 600, 10, "ms"),
  "--duration-base": slider(0, 600, 10, "ms"),
  "--duration-slow": slider(0, 600, 10, "ms"),
};

export function tokenControlSpec(token: ThemeContractToken): TokenControlSpec {
  const name = token.name;
  if (name === "--font-mono") return { kind: "select", options: MONO_OPTIONS };
  if (name === "--font-sans" || name === "--font-body" || name === "--font-display") {
    return { kind: "select", options: FONT_OPTIONS };
  }
  if (name.startsWith("--ease-")) return { kind: "select", options: EASE_OPTIONS };
  if (name.startsWith("--corner-shape")) return { kind: "select", options: CORNER_OPTIONS };
  const explicit = SLIDER_SPECS[name];
  if (explicit) return explicit;
  if (name.endsWith("--font-weight")) return slider(100, 900, 10, "");
  if (name.endsWith("--line-height") || name.endsWith("--letter-spacing")) return { kind: "text" };
  if (token.group === "typography" && name.startsWith("--text-")) return slider(8, 48, 1, "px");
  if (name === "--shadow-color") return { kind: "color" };
  // --shadow-highlight carries its resting alpha; a hex picker would silently drop it.
  if (name === "--shadow-highlight") return { kind: "text" };
  if (token.group === "color") return { kind: "color" };
  return { kind: "text" };
}

// Color-VALUED tokens are ones theme.css re-values under `.dark`, so editor scopes overrides per mode (ThemeState.light/.dark); everything else mode-agnostic. Opacity knobs live in color group but hold numbers, stay mode-agnostic.
const COLOR_VALUED = new Set(
  THEME_CONTRACT.flatMap((token) =>
    (token.group === "color" && !token.name.endsWith("-opacity")) || token.name === "--shadow-color" || token.name === "--shadow-highlight"
      ? [token.name]
      : [],
  ),
);

export function isColorValuedToken(name: string): boolean {
  return COLOR_VALUED.has(name);
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const FRIENDLY_LABELS: Record<string, string> = {
  "--background": "Surface",
  "--foreground": "Text",
  "--card": "Card",
  "--card-foreground": "Card text",
  "--popover": "Popover",
  "--popover-foreground": "Popover text",
  "--primary": "Brand",
  "--primary-foreground": "Text on brand",
  "--primary-text": "Brand text",
  "--secondary": "Secondary fill",
  "--secondary-foreground": "Secondary text",
  "--muted": "Muted fill",
  "--muted-foreground": "Muted text",
  "--accent": "Highlight fill",
  "--accent-foreground": "Highlight text",
  "--destructive": "Destructive",
  "--destructive-foreground": "Text on destructive",
  "--destructive-text": "Destructive text",
  "--border": "Border",
  "--input": "Field border",
  "--ring": "Focus ring",
  "--canvas": "Page canvas",
  "--ring-opacity": "Border opacity",
  "--popup-item-foreground": "Menu row text",
  "--popup-item-icon-foreground": "Menu row icon",
  "--popup-item-highlight-background": "Menu row highlight",
  "--font-sans": "UI typeface",
  "--font-mono": "Code typeface",
  "--font-body": "Body font role",
  "--font-display": "Heading font role",
  "--radius": "Radius",
  "--radius-control": "Control radius",
  "--radius-field": "Field radius",
  "--radius-panel": "Panel radius",
  "--radius-scene": "Scene radius",
  "--radius-popover": "Popover radius",
  "--radius-popup-item": "Menu row radius",
  "--radius-popup-item-fit": "Menu row radius fit",
  "--corner-shape": "Corner shape",
  "--corner-shape-control": "Control corner shape",
  "--corner-shape-popover": "Popover corner shape",
  "--corner-shape-panel": "Panel corner shape",
  "--corner-radius-fit": "Squircle fallback radius",
  "--shadow-color": "Shadow tint",
  "--shadow-highlight": "Top edge highlight",
  "--shadow-size": "Shadow size",
  "--shadow-opacity": "Shadow opacity",
  "--shadow-y": "Shadow vertical bias",
  "--shadow-control-multiplier": "Controls elevation",
  "--shadow-panel-multiplier": "Panels elevation",
  "--shadow-popover-multiplier": "Popovers elevation",
  "--shadow-modal-multiplier": "Modals elevation",
  "--shadow-ambient-multiplier": "Ambient elevation",
  "--ease-standard": "Standard easing",
  "--ease-emphasized": "Emphasized easing",
  "--duration-fast": "Fast tempo",
  "--duration-base": "Base tempo",
  "--duration-slow": "Slow tempo",
  "--popover-opacity": "Popover opacity",
  "--backdrop-blur-popover": "Popover blur",
  "--overlay-opacity": "Overlay dim",
  "--backdrop-blur-overlay": "Overlay blur",
  "--scroll-fade-size": "Scroll edge fade",
  "--popup-item-disabled-opacity": "Disabled row opacity",
  "--popover-padding": "Popover padding",
  "--padding-x": "Padding X",
  "--padding-y": "Padding Y",
  "--control-h": "Control height",
  "--control-h-xs": "Control height xs",
  "--control-h-sm": "Control height sm",
  "--control-h-md": "Control height md",
  "--control-h-lg": "Control height lg",
};

// "--text-heading-1--line-height" → "Text heading 1 line height"
function humanize(name: string): string {
  const words = name.replace(/^--/, "").split("-").filter(Boolean).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function tokenLabel(token: ThemeContractToken): string {
  return FRIENDLY_LABELS[token.name] ?? humanize(token.name);
}

// ─── Category layout ─────────────────────────────────────────────────────────

export type TokenCategory = {
  group: ThemeContractGroup;
  title: string;
  core: ThemeContractToken[];
  advanced: ThemeContractToken[];
};

const GROUP_TITLES: Record<ThemeContractGroup, string> = {
  color: "Colors",
  typography: "Typography",
  radius: "Radius & corners",
  shadow: "Shadows",
  motion: "Motion",
  surface: "Surfaces & overlays",
  layout: "Layout & density",
};

const GROUP_ORDER: readonly ThemeContractGroup[] = ["color", "typography", "radius", "shadow", "motion", "surface", "layout"];

const isBadgeToken = (token: ThemeContractToken) => token.name.startsWith("--badge-");

// Contract → editor sections in stable curated order; 88 badge tokens get own per-hue subgroup (BADGE_TOKEN_ROWS) instead of drowning color category's advanced list.
export const TOKEN_CATEGORIES: readonly TokenCategory[] = GROUP_ORDER.map((group) => {
  const tokens = THEME_CONTRACT.filter((token) => token.group === group && !isBadgeToken(token));
  return {
    group,
    title: GROUP_TITLES[group],
    core: tokens.filter((token) => token.tier === "core"),
    advanced: tokens.filter((token) => token.tier === "advanced"),
  };
});

export type BadgeTokenRow = { hue: string; tokens: ThemeContractToken[] };

const CONTRACT_BY_NAME = new Map(THEME_CONTRACT.map((token) => [token.name, token]));

export const BADGE_TOKEN_ROWS: readonly BadgeTokenRow[] = BADGE_HUES.map((hue) => ({
  hue,
  tokens: [`--badge-${hue}`, `--badge-${hue}-foreground`, `--badge-${hue}-border`, `--badge-${hue}-hover`].flatMap((name) => {
    const token = CONTRACT_BY_NAME.get(name);
    return token ? [token] : [];
  }),
}));
