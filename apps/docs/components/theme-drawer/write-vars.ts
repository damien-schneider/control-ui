"use client";

import { SKIN_CONFIGS } from "@/components/skin-registry";
import { COLOR_SCHEME_LOCK_ATTR, preferredTheme } from "@/components/theme";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";
import { hexToOklchColor } from "./color-utils";
import { buildDarkColorDecls, buildOverrideDecls, buildOverrideSheetCss } from "./override-decls";
import type { ThemeState } from "./types";

// The injected <style> that carries the editor's diff to portalled surfaces (see writeOverrideSheet).
const OVERRIDE_STYLE_ID = "control-ui-editor-overrides";

// Dialogs/sheets/menus/tooltips portal to <body> and RE-ASSERT data-skin, so pack's own [data-skin=id] block sets tokens DIRECTLY on portal element — beats editor's inline <html> override (element value always wins over inherited, regardless of specificity; :where() wouldn't change this).
// Mirrors same diff into a sheet scoped to active skin: equal specificity to pack block, injected last so it wins by source order and matches portal elements directly.
// Re-appended each call to stay last even if framework injects route CSS afterward.
function writeOverrideSheet(skin: string, decls: [string, string][]) {
  const css = buildOverrideSheetCss(skin, decls);
  let el = document.querySelector<HTMLStyleElement>(`#${OVERRIDE_STYLE_ID}`);
  if (css === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = OVERRIDE_STYLE_ID;
  }
  el.textContent = css;
  document.head.appendChild(el); // (re)append → last in <head>, wins the cascade by source order
}

export function writeVars(t: ThemeState) {
  const html = document.documentElement;
  html.dataset.skin = t.skin;

  // Color-scheme lock (ControlUiSkin.colorScheme): mode-locked skin fixes surfaces regardless of page mode, so MODE must follow skin — else anything keyed on .dark (Shiki dual-theme, native color-scheme, dark: utilities) resolves wrong.
  // Forces .dark to match, advertises lock on <html> (theme toggle disables off it), sets native color-scheme; runs BEFORE isDark read below so override color branch agrees with forced mode.
  // Leaving a locked skin restores visitor's own preference (lock forces class but never persists over it); guarded on attribute so an adaptive skin's ordinary writes (slider drags, mount) don't fight the free toggle.
  const forcedScheme = SKIN_CONFIGS[t.skin]?.colorScheme;
  if (forcedScheme) {
    html.setAttribute(COLOR_SCHEME_LOCK_ATTR, forcedScheme);
    html.style.colorScheme = forcedScheme;
    const wantDark = forcedScheme === "dark";
    if (html.classList.contains("dark") !== wantDark) html.classList.toggle("dark", wantDark);
  } else if (html.hasAttribute(COLOR_SCHEME_LOCK_ATTR)) {
    html.removeAttribute(COLOR_SCHEME_LOCK_ATTR);
    html.style.removeProperty("color-scheme");
    const wantDark = preferredTheme() === "dark";
    if (html.classList.contains("dark") !== wantDark) html.classList.toggle("dark", wantDark);
  }

  // Motion kill-switch (§H): manual "Reduce motion" toggle OR active skin's own motion:"reduced" flag stamps data-motion="reduced" on <html>; theme.css collapses --duration-* to 0 under that attribute, covers portals too.
  // Runs on every skin — not an override.
  const reduced = t.reduceMotion || SKIN_CONFIGS[t.skin]?.motion === "reduced";
  if (reduced) html.dataset.motion = "reduced";
  else delete html.dataset.motion;

  // User's diff over active skin: [name,value] pairs for ONLY overridden tokens (empty for fresh skin); isDark picks color branch — see buildOverrideDecls.
  const decls = buildOverrideDecls(t, html.classList.contains("dark"));

  // (1) Inline on <html>: drives page root + all in-page content that inherits from it; clean slate over WHOLE contract each call, then author only overridden tokens.
  const root = html.style;
  for (const name of THEME_CONTRACT_NAMES) root.removeProperty(name);
  for (const [name, value] of decls) root.setProperty(name, value);

  // (2) Portal sheet: same diff scoped to active skin, so portalled surfaces (dialogs/sheets/menus/selects/tooltips) that re-assert data-skin pick up override too (see writeOverrideSheet).
  writeOverrideSheet(t.skin, decls);
}

// Exports user's diff as authorable CSS: mode-agnostic overrides + light colors under :root, dark branch (explicit dark edits + brand/text carry, mirroring live behavior) under .dark.
// Untouched tokens deliberately absent — active skin's own theme.css already defines them, export composes onto it instead of forking it.
export function toCss(t: ThemeState): string {
  const rootDecls: [string, string][] = [...Object.entries(t.overrides), ...Object.entries(t.light)];
  for (const [name, hex] of Object.entries(t.textFixes)) rootDecls.push([name, hexToOklchColor(hex)]);
  const darkDecls = buildDarkColorDecls(t);
  for (const [name, hex] of Object.entries(t.textFixes)) darkDecls.push([name, hexToOklchColor(hex)]);

  if (rootDecls.length === 0 && darkDecls.length === 0) {
    return `/* No token edits — the "${t.skin}" skin's own theme.css already defines every token. */`;
  }
  const block = (decls: [string, string][]) => decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  const parts: string[] = [];
  if (rootDecls.length > 0) parts.push(`:root {\n${block(rootDecls)}\n}`);
  if (darkDecls.length > 0) parts.push(`.dark {\n${block(darkDecls)}\n}`);
  return parts.join("\n\n");
}
