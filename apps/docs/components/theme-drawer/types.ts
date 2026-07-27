"use client";

import type { SkinMetaId } from "@/app/(features)/model/types";

// derived from catalog, never hand-kept runtime enum
export type SkinId = SkinMetaId;

/** Sparse map of contract custom properties → raw CSS values ("--radius" → "12px"). */
export type TokenValues = Record<string, string>;

/** How token controls are captioned: curated human names, or raw custom-property names. */
export type LabelMode = "friendly" | "css";

// Selecting skin clears every map, so pack's own theme.css owns look and controls only display its live values.
// Colour-valued tokens scope to mode they were edited in; everything else applies to both.
export type ThemeState = {
  skin: SkinId;
  /** Local custom-theme identity. runtime still resolves slots and structural CSS from `skin`. */
  customThemeId: string | null;
  // effective reduced = this OR skin's own motion:"reduced" — never override
  reduceMotion: boolean;
  labelMode: LabelMode;
  /** Mode-agnostic token overrides (every non-color-valued contract token). */
  overrides: TokenValues;
  /** Color-valued token overrides authored while light mode was active. */
  light: TokenValues;
  /** Color-valued token overrides authored while dark mode was active. */
  dark: TokenValues;
  // authored last in writeVars so it wins in any skin or mode; cleared on every skin switch
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

// select authors raw CSS value; these are only curated choices offered
export const EASE = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
  linear: "linear",
} as const;

export const EASE_LABEL = { standard: "Standard", emphasized: "Emphasized", linear: "Linear" } as const;

export const CORNER_LABEL = { round: "Round", squircle: "Squircle", scoop: "Scoop" } as const;

export const FONT = {
  // "mono" is legacy storage key for brand face (kept so option ids stay stable).
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
