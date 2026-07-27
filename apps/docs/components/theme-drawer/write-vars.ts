"use client";

import { SKIN_CONFIGS } from "@/components/skin-registry";
import { COLOR_SCHEME_LOCK_ATTR, preferredTheme } from "@/components/theme";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";
import { hexToOklchColor } from "./color-utils";
import { buildDarkColorDecls, buildOverrideDecls, buildOverrideSheetCss } from "./override-decls";
import type { ThemeState } from "./types";

// injected <style> that carries editor's diff to portalled surfaces (see writeOverrideSheet).
const OVERRIDE_STYLE_ID = "control-ui-editor-overrides";

// portalled surface re-asserts data-skin, so pack's own block sets tokens directly on it and an element value always beats the editor's inherited <html> override.
// Mirroring diff into equally-specific sheet, injected last, is what wins it back. Re-appended each call so framework route CSS cannot land after it.
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

  // mode-locked skin fixes its surfaces, so page mode must follow it or anything keyed on .dark resolves wrong.
  // Runs before isDark read below so colour branch agrees with forced mode; lock forces class but never persists over visitor's own preference.
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

  // manual toggle OR skin's own motion:"reduced" — runs on every skin, never as override
  const reduced = t.reduceMotion || SKIN_CONFIGS[t.skin]?.motion === "reduced";
  if (reduced) html.dataset.motion = "reduced";
  else delete html.dataset.motion;

  const decls = buildOverrideDecls(t, html.classList.contains("dark"));

  // cleared across whole contract each call, then re-authored, so removed override disappears
  const root = html.style;
  for (const name of THEME_CONTRACT_NAMES) root.removeProperty(name);
  for (const [name, value] of decls) root.setProperty(name, value);

  writeOverrideSheet(t.skin, decls);
}

// Untouched tokens are deliberately absent: export composes onto skin's own theme.css instead of forking it.
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
