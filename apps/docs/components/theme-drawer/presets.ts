"use client";

import { type CatalogSkinMeta, skinMetas } from "@/app/(features)/catalog/skins";
import { DEFAULT_SKIN_ID, LEGACY_THEME_EDITOR_STORAGE_KEY, THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { objectFromEntries } from "@/lib/typed-object";
import type { LabelMode, SkinId, ThemeState, TokenValues } from "./types";

// Skin catalog from skinMetas (single source of truth); two classes drive selector groups: theme skins (tokens only) vs advanced (tokens + skin.config + skin.css).
export const SKIN_META_BY_ID = objectFromEntries(skinMetas.map((meta): [SkinId, CatalogSkinMeta] => [meta.id, meta]));
export const THEME_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "theme" ? [meta.id] : []));
export const ADVANCED_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "advanced" ? [meta.id] : []));
// Editor treats every skin the same now — one flat group (theme skins first, then advanced), no group labels since "Skin" section title already names them.
export const ALL_SKIN_IDS = [...THEME_SKIN_IDS, ...ADVANCED_SKIN_IDS];

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && value in SKIN_META_BY_ID;
}

// Blank slate: Refined is selected and no visitor edits are stored; controls read the skin's complete live tokens from the DOM.
export const DEFAULT_THEME: ThemeState = {
  skin: DEFAULT_SKIN_ID,
  customThemeId: null,
  reduceMotion: false,
  labelMode: "friendly",
  overrides: {},
  light: {},
  dark: {},
  textFixes: {},
};

// Docs-only persistence: keeps visitor's tweaked theme across reloads, not shipped in registry — editor doesn't reset to Refined on every page load while exploring.
// Keyed from theme.ts so pre-paint init script reads same slot.
// Init script only touches `skin`/`reduceMotion`, which both stored shapes carry at top level.
const STORAGE_KEY = THEME_EDITOR_STORAGE_KEY;

// Accept only a { "--token": "value" } shape; anything else (legacy scalar knobs, garbage) → {}.
function readTokenMap(value: unknown): TokenValues {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const out: TokenValues = {};
  for (const [name, raw] of Object.entries(value)) {
    if (name.startsWith("--") && typeof raw === "string") out[name] = raw;
  }
  return out;
}

function readLabelMode(value: unknown): LabelMode {
  return value === "css" ? "css" : "friendly";
}

export function loadStored(storage: Pick<Storage, "getItem"> = localStorage): ThemeState | null {
  try {
    const raw = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_THEME_EDITOR_STORAGE_KEY);
    if (!raw) return null;
    // JSON.parse is typed `any`; annotate the binding to narrow it without an assertion.
    const stored: Record<string, unknown> = JSON.parse(raw);
    // Legacy payloads (scalar-knob editor) stored `overrides` as ARRAY of knob keys + per-knob fields (primary/radius/…); those don't map 1:1 onto per-token overrides, so keep only skin/motion/textFixes.
    const isLegacy = Array.isArray(stored.overrides) || typeof stored.primary === "string";
    return {
      ...DEFAULT_THEME,
      skin: isSkinId(stored.skin) ? stored.skin : DEFAULT_THEME.skin,
      customThemeId: typeof stored.customThemeId === "string" ? stored.customThemeId : null,
      reduceMotion: stored.reduceMotion === true,
      labelMode: readLabelMode(stored.labelMode),
      overrides: isLegacy ? {} : readTokenMap(stored.overrides),
      light: isLegacy ? {} : readTokenMap(stored.light),
      dark: isLegacy ? {} : readTokenMap(stored.dark),
      textFixes: readTokenMap(stored.textFixes),
    };
  } catch {
    return null;
  }
}

export function store(t: ThemeState, storage: Pick<Storage, "setItem" | "removeItem"> = localStorage): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(t));
    storage.removeItem(LEGACY_THEME_EDITOR_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
