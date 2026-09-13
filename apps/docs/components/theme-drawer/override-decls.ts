import { cssColorToHex, darkBrand, darkText, hexToOklchColor } from "./color-utils";
import type { ThemeState } from "./types";

export function buildDarkColorDecls(t: ThemeState): [string, string][] {
  const decls = new Map<string, string>();
  const lightPrimary = t.light["--primary"];
  if (lightPrimary && !t.dark["--primary"]) {
    const hex = cssColorToHex(lightPrimary);
    if (hex) {
      const adapted = darkBrand(hex);
      decls.set("--primary", adapted.primary);
      if (!t.dark["--primary-foreground"]) decls.set("--primary-foreground", adapted.foreground);
    }
  }
  const lightForeground = t.light["--foreground"];
  if (lightForeground && !t.dark["--foreground"]) {
    const hex = cssColorToHex(lightForeground);
    if (hex) decls.set("--foreground", darkText(hex));
  }
  for (const [name, value] of Object.entries(t.dark)) decls.set(name, value);
  return Array.from(decls);
}

export function buildOverrideDecls(t: ThemeState, isDark: boolean): [string, string][] {
  const decls = new Map<string, string>();
  for (const [name, value] of Object.entries(t.overrides)) decls.set(name, value);
  const colorDecls = isDark ? buildDarkColorDecls(t) : Object.entries(t.light);
  for (const [name, value] of colorDecls) decls.set(name, value);

  for (const [name, hex] of Object.entries(t.textFixes)) decls.set(name, hexToOklchColor(hex));
  return Array.from(decls);
}

export function skinScopeSelector(skin: string): string {
  return `[data-skin="${skin}"][data-skin]`;
}

export function buildOverrideSheetCss(skin: string, decls: [string, string][]): string | null {
  if (decls.length === 0) return null;
  const body = decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `${skinScopeSelector(skin)} {\n${body}\n}`;
}

export function exportedThemeScopeSelector(skin: string): string {
  return skin === "none" ? ":root" : skinScopeSelector(skin);
}
