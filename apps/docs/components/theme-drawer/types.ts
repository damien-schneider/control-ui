"use client";

import type { SkinMetaId } from "@/app/(features)/model/types";

// The skin axis is the full catalog set (app/docs-catalog skinMetas), not a hand-kept runtime enum.
export type SkinId = SkinMetaId;

/** Sparse map of contract custom properties → raw CSS values ("--radius" → "12px"). */
export type TokenValues = Record<string, string>;

/** How token controls are captioned: curated human names, or the raw custom-property names. */
export type LabelMode = "friendly" | "css";

// Editor state over active skin, per-token. Selecting a skin clears every map so pack's own theme.css owns the look; controls DISPLAY skin's live values (readContractTokens) without authoring anything.
// Only user-edited tokens land in a map, writeVars authors those inline (outranks sheet) — a skin stays a live preset you edit per-token without losing the rest of its look.
// Color-valued tokens scope to mode edited in (light/dark, see buildOverrideDecls for the brand/text carry); everything else (geometry/motion/typography/opacities) applies in both modes (overrides).
export type ThemeState = {
  skin: SkinId;
  /** Local custom-theme identity. The runtime still resolves slots and structural CSS from `skin`. */
  customThemeId: string | null;
  // Manual motion kill-switch; effective reduced = this OR active skin's own motion:"reduced" flag, applied via data-motion attribute, never an override.
  reduceMotion: boolean;
  labelMode: LabelMode;
  /** Mode-agnostic token overrides (every non-color-valued contract token). */
  overrides: TokenValues;
  /** Color-valued token overrides authored while light mode was active. */
  light: TokenValues;
  /** Color-valued token overrides authored while dark mode was active. */
  dark: TokenValues;
  // Accessibility auto-fixes map each checked foreground token to a contrast-safe override.
  // Authored LAST in writeVars, wins in any skin/mode; reset to {} on every skin switch, like override maps.
  textFixes: Record<string, string>;
};

export type ControlUiThemeArtifactV1 = {
  format: "control-ui-theme/v1";
  name: string;
  baseSkin: SkinId;
  reduceMotion: boolean;
  tokens: {
    shared: TokenValues;
    light: TokenValues;
    dark: TokenValues;
  };
};

export type CustomThemeProfile = {
  id: string;
  name: string;
  baseSkin: SkinId;
  createdAt: string;
  updatedAt: string;
  reduceMotion: boolean;
  overrides: TokenValues;
  light: TokenValues;
  dark: TokenValues;
  textFixes: TokenValues;
};

// Preset VALUES for select-typed tokens (token-metadata.ts builds options from these); a select authors the raw CSS value, these maps are the curated choices offered.
export const EASE = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
  linear: "linear",
} as const;

export const EASE_LABEL = { standard: "Standard", emphasized: "Emphasized", linear: "Linear" } as const;

export const CORNER_LABEL = { round: "Round", squircle: "Squircle", scoop: "Scoop" } as const;

export const FONT = {
  // "mono" is the legacy storage key for the brand face (kept so the option ids stay stable).
  mono: 'var(--font-geist-sans, "Geist"), ui-sans-serif, system-ui, sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  helvetica: '"Helvetica Neue", Arial, "Segoe UI", sans-serif',
} as const;

export const FONT_LABEL = { mono: "Geist", system: "System", helvetica: "Helvetica" } as const;

export const FONT_MONO = {
  system: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  menlo: 'Menlo, Monaco, "Courier New", monospace',
  jetbrains: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const FONT_MONO_LABEL = { system: "System", menlo: "Menlo", jetbrains: "JetBrains" } as const;
