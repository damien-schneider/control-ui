import { skinMetas } from "@/app/(features)/catalog/skins";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "control-ui:theme:v1";

export const DEFAULT_SKIN_ID = "xp";
export const BASE_SKIN_ID = "refined";
export const THEME_INIT_SKIN_IDS = skinMetas.map((skin) => skin.id);

export const THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v2";
export const LEGACY_THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v1";
export const CUSTOM_THEME_STORAGE_KEY = "control-ui:custom-themes:v1";

export const COLOR_SCHEME_LOCK_ATTR = "data-color-scheme-lock";

export const MODE_LOCKED_SKINS: Record<string, Theme> = { "windows-98": "light" };

export const MOTION_REDUCED_SKINS: string[] = ["xp", "windows-98"];

export function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* disabled storage — fall through to the OS preference */
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
