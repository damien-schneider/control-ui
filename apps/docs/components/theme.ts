import { skinMetas } from "@/app/(features)/catalog/skins";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "control-ui:theme:v1";

export const DEFAULT_SKIN_ID = "refined";
export const THEME_INIT_SKIN_IDS = skinMetas.map((skin) => skin.id);

// the v1 key is read once, for migration
export const THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v2";
export const LEGACY_THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v1";
export const CUSTOM_THEME_STORAGE_KEY = "control-ui:custom-themes:v1";

// advertised on <html> so the theme toggle can disable off it
export const COLOR_SCHEME_LOCK_ATTR = "data-color-scheme-lock";

// Mirrors each skin.config's colorScheme rather than deriving it, so the pre-paint init script stays clear of the React and skin-config import graph.
// theme-color-scheme-lock.test.ts fails if the two drift.
export const MODE_LOCKED_SKINS: Record<string, Theme> = {};

// Mirrored for the same reason as MODE_LOCKED_SKINS, and guarded by the same test.
export const MOTION_REDUCED_SKINS: string[] = ["xp"];

// restores the mode when leaving a mode-locked skin — the lock forces .dark but never persists over this
export function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* disabled storage — fall through to the OS preference */
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Runs before React mounts so the skin owns the first frame with no flash, doing exactly what write-vars does after, which leaves the first effect writing the same attributes.
// The mirror maps interpolate as literals, so the script needs no runtime imports.
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var LOCK = ${JSON.stringify(MODE_LOCKED_SKINS)};
    var MOTION_OFF = ${JSON.stringify(MOTION_REDUCED_SKINS)};
    var SKINS = ${JSON.stringify(THEME_INIT_SKIN_IDS)};
    var el = document.documentElement;
    var skinId = "${DEFAULT_SKIN_ID}";
    var reduceMotion = false;
    try {
      var editorRaw = localStorage.getItem("${THEME_EDITOR_STORAGE_KEY}") || localStorage.getItem("${LEGACY_THEME_EDITOR_STORAGE_KEY}");
      if (editorRaw) {
        var payload = JSON.parse(editorRaw);
        if (SKINS.indexOf(payload.skin) !== -1) skinId = payload.skin;
        reduceMotion = payload.reduceMotion === true;
      }
    } catch (_) {}
    el.setAttribute("data-skin", skinId);
    // mirrors write-vars: reduced = manual toggle OR the skin's own flag
    if (reduceMotion || (skinId && MOTION_OFF.indexOf(skinId) !== -1)) {
      el.setAttribute("data-motion", "reduced");
    }
    var lockedScheme = skinId && Object.prototype.hasOwnProperty.call(LOCK, skinId) ? LOCK[skinId] : null;
    var storedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = lockedScheme ? lockedScheme === "dark" : storedTheme === "dark" ? true : storedTheme === "light" ? false : prefersDark;
    el.classList.toggle("dark", isDark);
    if (lockedScheme) {
      el.setAttribute("${COLOR_SCHEME_LOCK_ATTR}", lockedScheme);
      el.style.colorScheme = lockedScheme;
    }
  } catch (_) {}
})();
`;
