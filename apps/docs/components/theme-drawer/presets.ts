"use client";

import { type CatalogSkinMeta, skinMetas } from "@/app/(features)/catalog/skins";
import { DEFAULT_SKIN_ID, LEGACY_THEME_EDITOR_STORAGE_KEY, THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { objectFromEntries } from "@/lib/typed-object";
import type { LabelMode, SkinId, ThemeState, TokenValues } from "./types";

export const SKIN_META_BY_ID = objectFromEntries(skinMetas.map((meta): [SkinId, CatalogSkinMeta] => [meta.id, meta]));
export const THEME_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "theme" ? [meta.id] : []));
export const ADVANCED_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "advanced" ? [meta.id] : []));
// one flat list, theme skins first — section title already names them
export const ALL_SKIN_IDS = [...THEME_SKIN_IDS, ...ADVANCED_SKIN_IDS];

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && value in SKIN_META_BY_ID;
}

// no stored edits — controls read skin's live tokens straight from DOM
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

// Docs-only, keyed from theme.ts so pre-paint init script reads same slot; that script touches only `skin` and `reduceMotion`, which every stored shape carries at top level.
const STORAGE_KEY = THEME_EDITOR_STORAGE_KEY;

// anything else, legacy scalar knobs included, collapses to {}
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
    // JSON.parse is typed `any` — annotated rather than asserted
    const stored: Record<string, unknown> = JSON.parse(raw);
    // legacy scalar-knob payload does not map 1:1 onto per-token overrides, so only skin, motion, and textFixes survive
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
