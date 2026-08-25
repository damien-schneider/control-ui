import { cssColorToHex, darkBrand, darkText, hexToOklchColor } from "./color-utils";
import type { ThemeState } from "./types";

// DOM-free on purpose, so portal-fix contract stays unit-testable; write-vars.ts wires these to DOM.

// Brand and text carry across modes because light-mode --primary is intentional cross-mode decision; every other light colour leaves skin's dark values in charge.
// explicit dark edit always beats carry.
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

// Only overridden tokens appear; everything else flows from skin's own theme.css.
export function buildOverrideDecls(t: ThemeState, isDark: boolean): [string, string][] {
  const decls = new Map<string, string>();
  for (const [name, value] of Object.entries(t.overrides)) decls.set(name, value);
  const colorDecls = isDark ? buildDarkColorDecls(t) : Object.entries(t.light);
  for (const [name, value] of colorDecls) decls.set(name, value);
  // auto-fixes land last so they win over colour branch in both modes
  for (const [name, hex] of Object.entries(t.textFixes)) decls.set(name, hexToOklchColor(hex));
  return Array.from(decls);
}

// A pack repeats [data-skin] to outweigh an app's own :root block, so an override has to repeat it too or it never lands.
export function skinScopeSelector(skin: string): string {
  return `[data-skin="${skin}"][data-skin]`;
}

// Null on empty diff, so caller removes sheet and pack's own values win.
// portalled surface re-asserts data-skin, so pack's block sets tokens directly on it — only equally-scoped rule injected last wins them back.
export function buildOverrideSheetCss(skin: string, decls: [string, string][]): string | null {
  if (decls.length === 0) return null;
  const body = decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `${skinScopeSelector(skin)} {\n${body}\n}`;
}
