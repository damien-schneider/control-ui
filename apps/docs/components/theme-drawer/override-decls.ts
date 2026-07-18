import { cssColorToHex, darkBrand, darkText, hexToOklchColor } from "./color-utils";
import type { ThemeState } from "./types";

// Pure serializers for editor's per-token diff over active skin. DOM-free (no document/@/ imports) so portal-fix contract is unit-testable in bun — same split as contrast.ts vs contrast-panel.tsx.
// writeVars (write-vars.ts) wires these to the DOM.

// Dark side of diff: tokens edited while dark active, plus brand/text CARRY — light-mode --primary/--foreground is an intentional cross-mode decision.
// When dark has no own value, gets dark-readable adaptation (darkBrand/darkText) instead of skin's neutral dark defaults; other light colors do NOT carry, skin's own dark values stay in charge.
// Explicit dark edits always win over the carry.
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

// Editor's diff over active skin: [name,value] pairs for ONLY overridden tokens; everything else flows from skin's own theme.css [data-skin] block (folded over base :root), so untouched tokens stay intact.
// isDark picks color branch: mode-agnostic overrides always apply, color-valued tokens apply branch they were edited in (see ThemeState).
export function buildOverrideDecls(t: ThemeState, isDark: boolean): [string, string][] {
  const decls = new Map<string, string>();
  for (const [name, value] of Object.entries(t.overrides)) decls.set(name, value);
  const colorDecls = isDark ? buildDarkColorDecls(t) : Object.entries(t.light);
  for (const [name, value] of colorDecls) decls.set(name, value);
  // Accessibility auto-fixes land LAST, win over color branch (+ skin's --muted-foreground) in both modes; each token → override hex contrast panel computed to clear WCAG.
  for (const [name, hex] of Object.entries(t.textFixes)) decls.set(name, hexToOklchColor(hex));
  return Array.from(decls);
}

// Serializes diff into stylesheet rule scoped to active skin; null on empty diff so caller removes sheet, pack's own values win.
// Carries overrides to PORTALLED surfaces (dialogs, menus): they re-assert data-skin on <body>, so pack's own [data-skin=id] block sets tokens directly, shadowing editor's inline <html> override.
// Same-scoped rule injected last wins by source order.
export function buildOverrideSheetCss(skin: string, decls: [string, string][]): string | null {
  if (decls.length === 0) return null;
  const body = decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `[data-skin="${skin}"] {\n${body}\n}`;
}
