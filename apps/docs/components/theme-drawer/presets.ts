"use client";

import { type CatalogSkinMeta, skinMetas } from "@/app/(features)/catalog/skins";
import { DEFAULT_SKIN_ID, LEGACY_THEME_EDITOR_STORAGE_KEY, THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { objectFromEntries } from "@/lib/typed-object";
import { isRecord } from "./is-record";
import type { LabelMode, SkinId, ThemeState, TokenValues } from "./types";

export const SKIN_META_BY_ID = objectFromEntries(skinMetas.map((meta): [SkinId, CatalogSkinMeta] => [meta.id, meta]));
export const THEME_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "theme" ? [meta.id] : []));
export const ADVANCED_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "advanced" ? [meta.id] : []));
export const ALL_SKIN_IDS = ["none", ...THEME_SKIN_IDS.filter((id) => id !== "none"), ...ADVANCED_SKIN_IDS] as const;

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && Object.hasOwn(SKIN_META_BY_ID, value);
}

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

export function loadStored(storage?: Pick<Storage, "getItem">): ThemeState | null {
  try {
    const themeStorage = storage ?? localStorage;
    const raw = themeStorage.getItem(THEME_EDITOR_STORAGE_KEY) ?? themeStorage.getItem(LEGACY_THEME_EDITOR_STORAGE_KEY);
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored)) return null;
    const storedSkin = stored.skin === "flat" ? "none" : stored.skin;
    const isLegacy = Array.isArray(stored.overrides) || typeof stored.primary === "string";
    return {
      ...DEFAULT_THEME,
      skin: isSkinId(storedSkin) ? storedSkin : DEFAULT_THEME.skin,
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

export function store(t: ThemeState, storage?: Pick<Storage, "setItem" | "removeItem">): boolean {
  try {
    const themeStorage = storage ?? localStorage;
    themeStorage.setItem(THEME_EDITOR_STORAGE_KEY, JSON.stringify(t));
    themeStorage.removeItem(LEGACY_THEME_EDITOR_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
