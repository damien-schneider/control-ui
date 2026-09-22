import { cssColorToHex, darkBrand, darkText, hexToOklchColor } from "./color-utils";
import type { KnobRule, ThemeState } from "./types";

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

export const declarationBlock = (decls: [string, string][]) => decls.map(([name, value]) => `  ${name}: ${value};`).join("\n");

// Knobs are declared on the component element itself, so a root-scoped custom property never reaches
// them. Prefixing the recipe's own selector with the skin scope adds the specificity that wins — and
// seven recipes declare a knob on a comma list, where prefixing only the first would scope only the first.
function scopeSelector(scope: string, selector: string): string {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (character === "(" || character === "[") depth += 1;
    else if (character === ")" || character === "]") depth -= 1;
    else if (character === "," && depth === 0) {
      parts.push(selector.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `${scope} ${part}`)
    .join(",\n");
}

export function knobRuleCss(scope: string, knobs: readonly KnobRule[]): string[] {
  return knobs.map((rule) => `${scopeSelector(scope, rule.selector)} {\n${declarationBlock(Object.entries(rule.tokens))}\n}`);
}

export function buildOverrideSheetCss(skin: string, decls: [string, string][], knobs: readonly KnobRule[]): string | null {
  const scope = skinScopeSelector(skin);
  const rules = decls.length > 0 ? [`${scope} {\n${declarationBlock(decls)}\n}`] : [];
  rules.push(...knobRuleCss(scope, knobs));
  return rules.length > 0 ? rules.join("\n\n") : null;
}

export function exportedThemeScopeSelector(skin: string): string {
  return skin === "none" ? ":root" : skinScopeSelector(skin);
}
