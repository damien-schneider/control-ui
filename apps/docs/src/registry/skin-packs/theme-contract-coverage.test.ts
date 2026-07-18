import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type AtRule, type Declaration, type Node, type Root, type Rule } from "postcss";
import { assertCompleteSkinTokens } from "../lib/define-skin-tokens";
import { THEME_CONTRACT, THEME_CONTRACT_NAMES } from "../lib/theme-contract";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const CORE_THEME_PATH = fileURLToPath(new URL("../sources/control-ui/theme.css", import.meta.url));
const CORE_THEME = parseCss(CORE_THEME_PATH);

const packIds = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort();

const ANATOMY_SELECTOR_PATTERN = /\[data-slot=/;
const CONTROL_UI_SCOPE_PATTERN = /\[data-control-ui=(?:"[^"]+"|'[^']+'|[a-z0-9-]+)\]/;
const HOST_TEXT_SELECTOR_PATTERN =
  /\[data-skin[^\n{]*\][^\n{]*(?:^|[\s>+~,(])(?:pre|code|kbd|button|input|textarea|select)(?=$|[\s.#:[>+~),{])/;
const ANY_SKIN_SELECTOR_PATTERN = /\[data-skin\s*=\s*(?:"[^"]+"|'[^']+'|[a-z0-9-]+)\]/g;
const SQUIRCLE_FALLBACK_TOKENS = new Set([
  "--radius-control",
  "--radius-popup-item",
  "--radius-popup-item-fit",
  "--radius-popover",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-2xl",
  "--radius-field",
  "--radius-panel",
  "--radius-scene",
]);

type ThemeMode = "light" | "dark";

function parseCss(filePath: string): Root {
  return postcss.parse(readFileSync(filePath, "utf8"), { from: filePath });
}

function customDeclarations(root: Root): Declaration[] {
  const declarations: Declaration[] = [];
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) declarations.push(declaration);
  });
  return declarations;
}

function isAtRule(node: Node): node is AtRule {
  return node.type === "atrule";
}

function atRuleAncestors(node: Node): AtRule[] {
  const ancestors: AtRule[] = [];
  let parent: Node | undefined = node.parent;
  while (parent) {
    if (isAtRule(parent)) ancestors.push(parent);
    parent = parent.parent;
  }
  return ancestors;
}

function declarationRule(declaration: Declaration): Rule | undefined {
  return declaration.parent?.type === "rule" ? declaration.parent : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactSkinSelectorPattern(id: string, flags = ""): RegExp {
  const escaped = escapeRegExp(id);
  return new RegExp(`\\[data-skin\\s*=\\s*(?:"${escaped}"|'${escaped}'|${escaped})\\]`, flags);
}

function selectorOnlyScopesSkin(selector: string, id: string): boolean {
  const withoutSkin = selector.replace(exactSkinSelectorPattern(id, "g"), "");
  return (
    withoutSkin
      .replace(/:not\(\s*\.dark\s*\)/g, "")
      .replace(/\.dark\b/g, "")
      .replace(/:root\b/g, "")
      .replace(/:where\(/g, "")
      .replace(/[(),\s]/g, "").length === 0
  );
}

function selectorModes(selector: string, id: string): Set<ThemeMode> {
  const modes = new Set<ThemeMode>();
  const exactSkin = exactSkinSelectorPattern(id);

  for (const selectorPart of selector.split(",")) {
    if (!exactSkin.test(selectorPart)) continue;
    if (/:not\(\s*\.dark\s*\)/.test(selectorPart)) {
      modes.add("light");
      continue;
    }
    if (/\.dark\b/.test(selectorPart)) {
      modes.add("dark");
      continue;
    }
    modes.add("light");
    modes.add("dark");
  }

  return modes;
}

function coverageByMode(root: Root, id: string): Record<ThemeMode, Set<string>> {
  const coverage: Record<ThemeMode, Set<string>> = { light: new Set(), dark: new Set() };

  for (const declaration of customDeclarations(root)) {
    if (!THEME_CONTRACT_NAMES.has(declaration.prop)) continue;
    const rule = declarationRule(declaration);
    if (!rule || atRuleAncestors(rule).length > 0 || !selectorOnlyScopesSkin(rule.selector, id)) continue;
    for (const mode of selectorModes(rule.selector, id)) coverage[mode].add(declaration.prop);
  }

  return coverage;
}

function missingContractTokens(root: Root, id: string): string[] {
  const coverage = coverageByMode(root, id);
  return THEME_CONTRACT.flatMap((token) => {
    const missing: string[] = [];
    if (!coverage.light.has(token.name)) missing.push(`${token.name} (light)`);
    if (!coverage.dark.has(token.name)) missing.push(`${token.name} (dark)`);
    return missing;
  });
}

function coreContractDeclarationIsAllowed(declaration: Declaration): boolean {
  const atRules = atRuleAncestors(declaration);
  if (atRules.some((atRule) => atRule.name === "theme")) {
    return !declaration.important && declaration.value.trim() === `var(${declaration.prop})`;
  }

  const reducedMotionTokens = new Set(["--duration-fast", "--duration-base", "--duration-slow"]);
  const isReducedMotionOverride = reducedMotionTokens.has(declaration.prop) && declaration.value.trim() === "0ms" && declaration.important;
  if (
    isReducedMotionOverride &&
    atRules.some((atRule) => atRule.name === "media" && /prefers-reduced-motion\s*:\s*reduce/.test(atRule.params))
  ) {
    return true;
  }

  const selector = declarationRule(declaration)?.selector ?? "";
  if (isReducedMotionOverride && /\[data-motion\s*=\s*(?:"reduced"|'reduced'|reduced)\]/.test(selector)) return true;
  if (
    declaration.prop === "--corner-shape" &&
    /\[data-corners\s*=/.test(selector) &&
    /^(?:round|squircle|scoop)$/.test(declaration.value.trim())
  ) {
    return true;
  }

  const squircleFallback = atRules.some(
    (atRule) => atRule.name === "supports" && /not\s*\(corner-shape\s*:\s*squircle\)/.test(atRule.params),
  );
  const squircleQuery = atRules.some(
    (atRule) => atRule.name === "container" && /style\(\s*--corner-shape\s*:\s*squircle\s*\)/.test(atRule.params),
  );
  return squircleFallback && squircleQuery && SQUIRCLE_FALLBACK_TOKENS.has(declaration.prop) && declaration.value.includes("var(");
}

function sourceLabel(declaration: Declaration): string {
  const line = declaration.source?.start?.line ?? "?";
  return `${line}: ${declaration.prop} in ${declarationRule(declaration)?.selector ?? "an at-rule"}`;
}

function componentCssOffenders(root: Root): string[] {
  const offenders: string[] = [];
  root.walkAtRules((atRule) => {
    if (atRule.name === "layer" && /\bcomponents\b/.test(atRule.params)) offenders.push("@layer components");
    if (atRule.name === "utility") offenders.push("@utility");
    if (atRule.name === "keyframes") offenders.push("@keyframes");
  });
  root.walkRules((rule) => {
    if (/\[data-(?:ui|slot|control|component)=/.test(rule.selector)) offenders.push(`component selector: ${rule.selector}`);
  });
  return offenders;
}

function selectorLineOffenders(css: string, pattern: RegExp, requiredPattern: RegExp): string[] {
  return css
    .split("\n")
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => pattern.test(line) && !requiredPattern.test(line))
    .map(({ line, number }) => `${number}: ${line}`);
}

function isSkinRootSelector(selector: string): boolean {
  if (!ANY_SKIN_SELECTOR_PATTERN.test(selector)) return false;
  ANY_SKIN_SELECTOR_PATTERN.lastIndex = 0;
  return (
    selector
      .replace(ANY_SKIN_SELECTOR_PATTERN, "")
      .replace(/:not\(\s*\.dark\s*\)/g, "")
      .replace(/\.dark\b/g, "")
      .replace(/:root\b/g, "")
      .replace(/:where\(/g, "")
      .replace(/[(),\s]/g, "").length === 0
  );
}

function rootBlockDeclarationOffenders(root: Root): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (!isSkinRootSelector(rule.selector)) return;
    for (const node of rule.nodes) {
      if (node.type === "decl" && !node.prop.startsWith("--")) offenders.push(`${rule.selector}: ${node.prop}`);
    }
  });
  return offenders;
}

describe("theme contract ownership", () => {
  test("the contract is non-empty, unique, and holds its anchors", () => {
    expect(THEME_CONTRACT.length).toBeGreaterThan(100);
    expect(THEME_CONTRACT_NAMES.size).toBe(THEME_CONTRACT.length);
    expect(THEME_CONTRACT_NAMES.has("--primary")).toBe(true);
    expect(THEME_CONTRACT_NAMES.has("--primary-text")).toBe(true);
    expect(THEME_CONTRACT_NAMES.has("--destructive-text")).toBe(true);
    expect(THEME_CONTRACT_NAMES.has("--radius")).toBe(true);
  });

  test("core has no skin-specific selector", () => {
    const offenders: string[] = [];
    CORE_THEME.walkRules((rule) => {
      if (exactSkinSelectorPattern("refined").test(rule.selector)) offenders.push(rule.selector);
    });
    expect(offenders).toEqual([]);
  });

  test("core has no contract defaults", () => {
    const offenders = customDeclarations(CORE_THEME)
      .filter((declaration) => THEME_CONTRACT_NAMES.has(declaration.prop) && !coreContractDeclarationIsAllowed(declaration))
      .map(sourceLabel);
    expect(offenders).toEqual([]);
  });
});

describe("generated skin token maps", () => {
  const complete = Object.fromEntries(THEME_CONTRACT.map((token) => [token.name, "initial"]));

  test("accept complete explicit light and dark maps", () => {
    expect(() => assertCompleteSkinTokens({ light: complete, dark: complete }, "test skin")).not.toThrow();
  });

  test("reject a missing mode value", () => {
    const light = { ...complete };
    delete light["--primary"];
    expect(() => assertCompleteSkinTokens({ light, dark: complete }, "test skin")).toThrow("--primary (light)");
  });

  test("reject a token outside the contract", () => {
    expect(() => assertCompleteSkinTokens({ light: { ...complete, "--unknown": "1" }, dark: complete }, "test skin")).toThrow("--unknown");
  });
});

describe("skin pack theme.css stays within the token contract", () => {
  for (const id of packIds) {
    const themePath = path.join(SKIN_PACKS_DIR, id, "theme.css");
    const skinPath = path.join(SKIN_PACKS_DIR, id, "skin.css");
    const themeCss = readFileSync(themePath, "utf8");
    const skinCss = readFileSync(skinPath, "utf8");
    const themeRoot = postcss.parse(themeCss, { from: themePath });
    const skinRoot = postcss.parse(skinCss, { from: skinPath });

    test(`${id}/theme.css declares only contract tokens`, () => {
      const offenders = [
        ...new Set(
          customDeclarations(themeRoot)
            .map((declaration) => declaration.prop)
            .filter((name) => !THEME_CONTRACT_NAMES.has(name)),
        ),
      ].sort();
      expect(offenders).toEqual([]);
    });

    test(`${id}/theme.css declarations are scoped to its exact skin root`, () => {
      const offenders = customDeclarations(themeRoot).flatMap((declaration) => {
        const rule = declarationRule(declaration);
        return rule && selectorOnlyScopesSkin(rule.selector, id) ? [] : [sourceLabel(declaration)];
      });
      expect(offenders).toEqual([]);
    });

    test(`${id}/theme.css defines every contract token in light and dark`, () => {
      expect(missingContractTokens(themeRoot, id)).toEqual([]);
    });

    test(`${id}/theme.css ships no @theme block`, () => {
      const offenders: string[] = [];
      themeRoot.walkAtRules("theme", (atRule) => {
        offenders.push(`@theme ${atRule.params}`.trim());
      });
      expect(offenders).toEqual([]);
    });

    test(`${id}/theme.css does not include component CSS`, () => {
      expect(componentCssOffenders(themeRoot)).toEqual([]);
    });

    test(`${id}/skin.css never redeclares contract tokens`, () => {
      const offenders = [
        ...new Set(
          customDeclarations(skinRoot)
            .map((declaration) => declaration.prop)
            .filter((name) => THEME_CONTRACT_NAMES.has(name)),
        ),
      ].sort();
      expect(offenders).toEqual([]);
    });

    test(`${id}/skin.css component selectors are Control UI scoped`, () => {
      expect(selectorLineOffenders(skinCss, ANATOMY_SELECTOR_PATTERN, CONTROL_UI_SCOPE_PATTERN)).toEqual([]);
    });

    test(`${id}/skin.css avoids host text element selectors`, () => {
      expect(selectorLineOffenders(skinCss, HOST_TEXT_SELECTOR_PATTERN, CONTROL_UI_SCOPE_PATTERN)).toEqual([]);
    });

    test(`${id}/skin.css root skin blocks declare variables only`, () => {
      expect(rootBlockDeclarationOffenders(skinRoot)).toEqual([]);
    });
  }
});
