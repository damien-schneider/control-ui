import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { buttonShapes, buttonTones, buttonVariants } from "../contracts";
import { buttonKnobs } from "../knob-contracts";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const RECIPES_DIR = fileURLToPath(new URL("../sources/control-ui/recipes/", import.meta.url));
const CORE_THEME_PATH = fileURLToPath(new URL("../sources/control-ui/theme.css", import.meta.url));
const BUTTON_RECIPE_PATH = path.join(RECIPES_DIR, "button.css");
const RECIPE_PATHS = readdirSync(RECIPES_DIR)
  .filter((entry) => entry.endsWith(".css"))
  .sort()
  .map((name) => path.join(RECIPES_DIR, name));
const CORE_CSS_PATHS = [CORE_THEME_PATH, BUTTON_RECIPE_PATH];

// The base variant/tone IS the recipe root block — it needs no attribute selector of its own.
const BASE_VARIANT = "quiet";
const BASE_TONE = "neutral";

const KNOB_NAMES = new Set<string>(buttonKnobs);
const VARIANT_NAMES = new Set<string>(buttonVariants);
const TONE_NAMES = new Set<string>(buttonTones);

function parseCss(filePath: string): Root {
  return postcss.parse(readFileSync(filePath, "utf8"), { from: filePath });
}

const core = postcss.parse(CORE_CSS_PATHS.map((filePath) => readFileSync(filePath, "utf8")).join("\n"));
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: parseCss(path.join(SKIN_PACKS_DIR, id, "skin.css")) }));

function isButtonAnchor(node: selectorParser.Node): boolean {
  return (
    node.type === "attribute" &&
    ((node.attribute === "data-control-family" && node.value === "button") ||
      (node.attribute === "data-control-ui" && (node.value === "button" || node.value === "toggle")))
  );
}

function containsButtonAnchor(node: selectorParser.Node): boolean {
  if (isButtonAnchor(node)) return true;
  if (!("nodes" in node) || !Array.isArray(node.nodes)) return false;
  return node.nodes.some(containsButtonAnchor);
}
function isInheritancePseudo(node: selectorParser.Node["parent"]): node is selectorParser.Pseudo {
  return node?.type === "pseudo" && [":is", ":not", ":where"].includes(node.value);
}

function nodeCompoundHasButtonAnchor(node: selectorParser.Node): boolean {
  const selector = node.parent;
  if (selector?.type !== "selector") return false;
  const index = selector.nodes.indexOf(node);
  let start = index;
  let end = index + 1;
  while (start > 0 && selector.nodes[start - 1]?.type !== "combinator") start -= 1;
  while (end < selector.nodes.length && selector.nodes[end]?.type !== "combinator") end += 1;
  if (selector.nodes.slice(start, end).some(containsButtonAnchor)) return true;
  if (selector.nodes.some((candidate) => candidate.type === "combinator")) return false;
  const pseudo = selector.parent;
  if (!isInheritancePseudo(pseudo)) return false;
  return nodeCompoundHasButtonAnchor(pseudo);
}

function compoundHasButtonAnchor(attribute: selectorParser.Attribute): boolean {
  return nodeCompoundHasButtonAnchor(attribute);
}

function buttonAttributeValues(root: Root, attribute: string): Set<string> {
  const values = new Set<string>();
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkAttributes((node) => {
        if (node.attribute === attribute && compoundHasButtonAnchor(node)) values.add(node.value ?? "");
      });
    }).processSync(rule.selector);
  });
  return values;
}

function unknownKnobOffenders(root: Root, label: string): string[] {
  const offenders: string[] = [];
  const check = (name: string, line: number | undefined) => {
    if (!KNOB_NAMES.has(name)) offenders.push(`${label}:${line ?? "?"} ${name}`);
  };
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    if (declaration.prop.startsWith("--button-")) check(declaration.prop, line);
    for (const match of declaration.value.matchAll(/var\(\s*(--button-[\w-]+)/g)) check(match[1] ?? "", line);
  });
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith("--button-")) check(name, atRule.source?.start?.line);
  });
  return offenders;
}

describe("button paint contract", () => {
  test("core theme.css paints every variant and tone beyond the base", () => {
    const paintedVariants = buttonAttributeValues(core, "data-variant");
    const paintedTones = buttonAttributeValues(core, "data-tone");
    const missing = [
      ...buttonVariants.filter((variant) => variant !== BASE_VARIANT && !paintedVariants.has(variant)).map((v) => `variant ${v}`),
      ...buttonTones.filter((tone) => tone !== BASE_TONE && !paintedTones.has(tone)).map((t) => `tone ${t}`),
    ];
    expect(missing).toEqual([]);
  });

  test("core and skins target only declared variants and tones", () => {
    const offenders = [{ id: "core", root: core }, ...skins].flatMap(({ id, root }) => [
      ...[...buttonAttributeValues(root, "data-variant")].filter((value) => !VARIANT_NAMES.has(value)).map((v) => `${id}: variant ${v}`),
      ...[...buttonAttributeValues(root, "data-tone")].filter((value) => !TONE_NAMES.has(value)).map((t) => `${id}: tone ${t}`),
    ]);
    expect(offenders).toEqual([]);
  });

  test("every knob ships a default in the core recipe", () => {
    const declared = new Set<string>();
    core.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--button-")) declared.add(declaration.prop);
    });
    expect(buttonKnobs.filter((knob) => !declared.has(knob))).toEqual([]);
  });

  test("every knob is registered via @property", () => {
    const registered = new Set<string>();
    core.walkAtRules("property", (atRule) => {
      registered.add(atRule.params.trim());
    });
    expect(buttonKnobs.filter((knob) => !registered.has(knob))).toEqual([]);
  });

  test("core and skins reference only contract knobs", () => {
    const offenders = [...unknownKnobOffenders(core, "core"), ...skins.flatMap(({ id, root }) => unknownKnobOffenders(root, id))];
    expect(offenders).toEqual([]);
  });

  test("contract names follow the semver grammar", () => {
    const knobGrammar = /^--button-[a-z]+(?:-[a-z]+)*$/;
    const valueGrammar = /^[a-z]+(?:-[a-z]+)*$/;
    const privateGrammar = /^--_[a-z]+(?:-[a-z]+)*$/;
    const offenders = [
      ...buttonKnobs.filter((knob) => !knobGrammar.test(knob)).map((knob) => `knob ${knob}`),
      ...[...buttonVariants, ...buttonTones, ...buttonShapes].filter((value) => !valueGrammar.test(value)).map((value) => `value ${value}`),
    ];
    core.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--_") && !privateGrammar.test(declaration.prop)) {
        offenders.push(`private ${declaration.prop}`);
      }
    });
    expect(offenders).toEqual([]);
  });

  test("recipes never hardcode motion — durations and easings ride the shared tokens", () => {
    const offenders = RECIPE_PATHS.flatMap((recipePath) => {
      const found: string[] = [];
      parseCss(recipePath).walkDecls(/^(transition|animation)/, (declaration) => {
        const literalDuration = /(^|[\s,(])\d+(\.\d+)?m?s\b/.test(declaration.value);
        const literalEasing = /cubic-bezier\(|steps\(|linear\(/.test(declaration.value);
        if (literalDuration || literalEasing) {
          found.push(`${path.basename(recipePath)}:${declaration.source?.start?.line ?? "?"} ${declaration.prop}: ${declaration.value}`);
        }
      });
      return found;
    });
    expect(offenders).toEqual([]);
  });
});
