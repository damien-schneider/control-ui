"use client";

import { type CatalogSkinMeta, skinMetas } from "@/app/(features)/catalog/skins";
import { DEFAULT_SKIN_ID, LEGACY_THEME_EDITOR_STORAGE_KEY, THEME_EDITOR_STORAGE_KEY } from "@/components/theme";
import { objectFromEntries } from "@/lib/typed-object";
import { isRecord } from "./is-record";
import type { KnobRule, LabelMode, SkinId, ThemeState, TokenValues } from "./types";

export const SKIN_META_BY_ID = objectFromEntries(skinMetas.map((meta): [SkinId, CatalogSkinMeta] => [meta.id, meta]));
export const THEME_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "theme" ? [meta.id] : []));
export const ADVANCED_SKIN_IDS = skinMetas.flatMap((meta) => (meta.kind === "advanced" ? [meta.id] : []));
export const ALL_SKIN_IDS = ["none", ...THEME_SKIN_IDS.filter((id) => id !== "none"), ...ADVANCED_SKIN_IDS] as const;

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && Object.hasOwn(SKIN_META_BY_ID, value);
}

export const DEFAULT_THEME: ThemeState = {
  skin: DEFAULT_SKIN_ID,
  reduceMotion: false,
  labelMode: "friendly",
  overrides: {},
  light: {},
  dark: {},
  textFixes: {},
  knobs: [],
  fontUrl: "",
  customSkinId: null,
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

// Knob rules are the one part of a stored theme that reaches a stylesheet as a selector rather than a
// declaration value, so tampered storage could otherwise close the rule and author anything after it.
const STYLESHEET_BREAKING = /[;{}<>\n\r]|\/\*|@import|url\s*\(|expression\s*\(|javascript:|data:/i;

function readKnobTokens(value: unknown): TokenValues {
  const tokens: TokenValues = {};
  for (const [name, raw] of Object.entries(readTokenMap(value))) {
    if (name.startsWith("--cui-") && !STYLESHEET_BREAKING.test(raw)) tokens[name] = raw;
  }
  return tokens;
}

function readKnobRule(entry: unknown): KnobRule | null {
  if (!isRecord(entry) || typeof entry.selector !== "string") return null;
  if (!entry.selector.trim() || STYLESHEET_BREAKING.test(entry.selector)) return null;
  const tokens = readKnobTokens(entry.tokens);
  return Object.keys(tokens).length > 0 ? { selector: entry.selector, tokens } : null;
}

function readKnobRules(value: unknown): KnobRule[] {
  if (!Array.isArray(value)) return [];
  return value.map(readKnobRule).filter((rule) => rule !== null);
}

// Only a Google Fonts stylesheet, and only one whose URL cannot close the href or the @import it is
// wrapped in: a stored theme is the one input to writeVars that a page can have tampered with.
const FONT_STYLESHEET = /^https:\/\/fonts\.googleapis\.com\/css2\?[\w=;:&+%@.,-]+$/;

function readFontUrl(value: unknown): string {
  return typeof value === "string" && FONT_STYLESHEET.test(value) ? value : "";
}

export function readThemeState(stored: unknown): ThemeState | null {
  if (!isRecord(stored)) return null;
  const storedSkin = stored.skin === "flat" ? "none" : stored.skin;
  const isLegacy = Array.isArray(stored.overrides) || typeof stored.primary === "string";
  return {
    ...DEFAULT_THEME,
    skin: isSkinId(storedSkin) ? storedSkin : DEFAULT_THEME.skin,
    reduceMotion: stored.reduceMotion === true,
    labelMode: readLabelMode(stored.labelMode),
    overrides: isLegacy ? {} : readTokenMap(stored.overrides),
    light: isLegacy ? {} : readTokenMap(stored.light),
    dark: isLegacy ? {} : readTokenMap(stored.dark),
    textFixes: readTokenMap(stored.textFixes),
    knobs: readKnobRules(stored.knobs),
    fontUrl: readFontUrl(stored.fontUrl),
    customSkinId: typeof stored.customSkinId === "string" ? stored.customSkinId : null,
  };
}

export function loadStored(storage?: Pick<Storage, "getItem">): ThemeState | null {
  try {
    const themeStorage = storage ?? localStorage;
    const raw = themeStorage.getItem(THEME_EDITOR_STORAGE_KEY) ?? themeStorage.getItem(LEGACY_THEME_EDITOR_STORAGE_KEY);
    return raw ? readThemeState(JSON.parse(raw)) : null;
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
