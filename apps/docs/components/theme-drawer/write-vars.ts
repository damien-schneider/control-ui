"use client";

import { COLOR_SCHEME_LOCK_ATTR, MODE_LOCKED_SKINS, MOTION_REDUCED_SKINS, PAGE_LAYOUT_SKINS, preferredTheme } from "@/components/theme";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";
import { hexToOklchColor } from "./color-utils";
import {
  buildDarkColorDecls,
  buildOverrideDecls,
  buildOverrideSheetCss,
  declarationBlock,
  exportedThemeScopeSelector,
  knobRuleCss,
} from "./override-decls";
import type { ThemeState } from "./types";

const OVERRIDE_STYLE_ID = "control-ui-editor-overrides";
const FONT_LINK_ID = "control-ui-editor-font";

function writeOverrideSheet(t: ThemeState, decls: [string, string][]) {
  const css = buildOverrideSheetCss(t.skin, decls, t.knobs);
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

// A link rather than an @import in the override sheet: an @import must come before every rule, so it would
// pin the ordering of a sheet that is rewritten on every token edit, and it blocks where a link does not.
function writeFontLink(url: string) {
  let el = document.querySelector<HTMLLinkElement>(`#${FONT_LINK_ID}`);
  if (!url) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.id = FONT_LINK_ID;
    el.rel = "stylesheet";
  }
  if (el.getAttribute("href") !== url) el.href = url;
  if (!el.isConnected) document.head.appendChild(el);
}

export function writeVars(t: ThemeState) {
  const html = document.documentElement;
  html.dataset.skin = t.skin;
  html.dataset.docsLayout = PAGE_LAYOUT_SKINS.includes(t.skin) ? "page" : "contained";

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

  writeOverrideSheet(t, decls);
  writeFontLink(t.fontUrl);
}

export function toCss(t: ThemeState): string {
  const rootDecls: [string, string][] = [...Object.entries(t.overrides), ...Object.entries(t.light)];
  for (const [name, hex] of Object.entries(t.textFixes)) rootDecls.push([name, hexToOklchColor(hex)]);
  const darkDecls = buildDarkColorDecls(t);
  for (const [name, hex] of Object.entries(t.textFixes)) darkDecls.push([name, hexToOklchColor(hex)]);

  const scope = exportedThemeScopeSelector(t.skin);
  const knobRules = knobRuleCss(scope, t.knobs);
  if (rootDecls.length === 0 && darkDecls.length === 0 && knobRules.length === 0 && !t.fontUrl) {
    return "/* No token edits. The current theme uses its default values. */";
  }
  // @import has to precede every rule in the sheet, so the typeface leads and the comment sits above it.
  const parts: string[] = ["/* Import after the Control UI styles. */"];
  if (t.fontUrl) parts.push(`@import url('${t.fontUrl}');`);
  if (rootDecls.length > 0) parts.push(`${scope} {\n${declarationBlock(rootDecls)}\n}`);
  if (darkDecls.length > 0) parts.push(`:where(.dark) ${scope},\n.dark${scope} {\n${declarationBlock(darkDecls)}\n}`);
  parts.push(...knobRules);
  return parts.join("\n\n");
}
