import { skinMetas } from "@/app/(features)/catalog/skins";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "control-ui:theme:v1";

export const DEFAULT_SKIN_ID = "refined";
export const THEME_INIT_SKIN_IDS = skinMetas.map((skin) => skin.id);

// Theme editor persists the active built-in/custom profile here. The v1 key is read once for migration.
export const THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v2";
export const LEGACY_THEME_EDITOR_STORAGE_KEY = "control-ui:theme-editor:v1";
export const CUSTOM_THEME_STORAGE_KEY = "control-ui:custom-themes:v1";

// Lock advertised on <html> when a mode-locked skin is active (write-vars sets it, theme toggle disables off it); value is the forced Theme.
export const COLOR_SCHEME_LOCK_ATTR = "data-color-scheme-lock";

// Skins with no adaptive light+dark: surfaces fixed, so page mode must follow skin (ControlUiSkin.colorScheme, enforced in write-vars).
// MIRROR of skin.config colorScheme fields, kept here not derived from client skin-registry, so init script stays free of React/skin-config import graph.
// Guard test (theme-color-scheme-lock.test.ts) fails if the two drift.
export const MODE_LOCKED_SKINS: Record<string, Theme> = {};

// Skins whose config declares motion:"reduced" (XP snaps instantly, Luna style); MIRROR of that field, kept here like MODE_LOCKED_SKINS so pre-paint init script can stamp data-motion before React without importing React/skin-config graph.
// Same guard test (theme-color-scheme-lock.test.ts) fails if this drifts from actual configs.
export const MOTION_REDUCED_SKINS: string[] = ["xp"];

// Visitor's own light/dark preference from storage or OS; used to RESTORE mode when leaving a mode-locked skin (lock forces .dark but never persists over this).
export function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* disabled storage — fall through to the OS preference */
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Pre-paint: applies a valid skin AND mode before React mounts, no flash. Paints data-skin so that skin's theme.css/skin.css owns the first frame, then resolves light/dark mode — a mode-locked skin wins over stored/OS preference.
// Exactly what write-vars does post-mount, so React's first effect re-writes same attributes with no churn.
// Interpolates mirror maps as literals so script needs no imports at runtime.
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
    // Motion: mirror write-vars' reduced = manual toggle OR the skin's own motion:"reduced" flag.
    if (reduceMotion || (skinId && MOTION_OFF.indexOf(skinId) !== -1)) {
      el.setAttribute("data-motion", "reduced");
    }
    // Color-scheme lock: a mode-locked skin forces its scheme.
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
