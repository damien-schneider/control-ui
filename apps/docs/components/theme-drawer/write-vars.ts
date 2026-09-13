"use client";

import { COLOR_SCHEME_LOCK_ATTR, MODE_LOCKED_SKINS, MOTION_REDUCED_SKINS, preferredTheme } from "@/components/theme";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";
import { hexToOklchColor } from "./color-utils";
import { buildDarkColorDecls, buildOverrideDecls, buildOverrideSheetCss, skinScopeSelector } from "./override-decls";
import type { ThemeState } from "./types";

const OVERRIDE_STYLE_ID = "control-ui-editor-overrides";

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
  if (el.textContent !== css) el.textContent = css;
  if (document.head.lastElementChild !== el) document.head.appendChild(el);
}

export function writeVars(t: ThemeState) {
  const html = document.documentElement;
  html.dataset.skin = t.skin;

  const forcedScheme = MODE_LOCKED_SKINS[t.skin];
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

  const reduced = t.reduceMotion || MOTION_REDUCED_SKINS.includes(t.skin);
  if (reduced) html.dataset.motion = "reduced";
  else delete html.dataset.motion;

  const decls = buildOverrideDecls(t, html.classList.contains("dark"));

  const root = html.style;
  for (const name of THEME_CONTRACT_NAMES) root.removeProperty(name);
  for (const [name, value] of decls) root.setProperty(name, value);

  writeOverrideSheet(t.skin, decls);
}

export function toCss(t: ThemeState): string {
  const rootDecls: [string, string][] = [...Object.entries(t.overrides), ...Object.entries(t.light)];
  for (const [name, hex] of Object.entries(t.textFixes)) rootDecls.push([name, hexToOklchColor(hex)]);
  const darkDecls = buildDarkColorDecls(t);
  for (const [name, hex] of Object.entries(t.textFixes)) darkDecls.push([name, hexToOklchColor(hex)]);

  if (rootDecls.length === 0 && darkDecls.length === 0) {
    return `/* No token edits — the "${t.skin}" skin's own theme.css already defines every token. */`;
  }
  const block = (decls: [string, string][]) => decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  const parts: string[] = [
    `/* Paste after the "${t.skin}" skin's theme.css import — the selector matches the pack's own weight, so source order decides. */`,
  ];
  const scope = skinScopeSelector(t.skin);
  if (rootDecls.length > 0) parts.push(`${scope} {\n${block(rootDecls)}\n}`);
  if (darkDecls.length > 0) parts.push(`:where(.dark) ${scope},\n.dark${scope} {\n${block(darkDecls)}\n}`);
  return parts.join("\n\n");
}
