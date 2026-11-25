import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { familyAttribute, identityAttribute, isFamilyQualifierAttribute, slotAttribute } from "../../../scripts/control-anatomy";
import { knobsByFamily } from "../../../scripts/knob-contracts/collect";
import { paintedStates } from "../../../scripts/painted-states";
import { flattenCompound } from "../../../scripts/selector-bucketing";
import { type AnatomyPair, pairSetKey, stampedAnatomyKeys } from "../../../scripts/stamped-anatomy";

const controlKnobContracts = knobsByFamily();

const SOURCES_DIR = fileURLToPath(new URL("../sources/control-ui/", import.meta.url));
const RECIPES_DIR = path.join(SOURCES_DIR, "recipes");
const recipePaths = readdirSync(RECIPES_DIR)
  .filter((name) => name.endsWith(".css"))
  .sort()
  .map((name) => path.join(RECIPES_DIR, name));
const BLOCKS_DIR = fileURLToPath(new URL("../blocks/control-ui/", import.meta.url));
const componentSources = [
  { directory: SOURCES_DIR, prefix: "" },
  { directory: BLOCKS_DIR, prefix: "blocks/" },
].flatMap(({ directory, prefix }) =>
  readdirSync(directory, { encoding: "utf8", recursive: true })
    .filter((name) => /\.(?:ts|tsx)$/.test(name) && !name.includes(".test."))
    .map((name) => ({ name: `${prefix}${name}`, source: readFileSync(path.join(directory, name), "utf8") })),
);
const sourceText = componentSources.map(({ source }) => source).join("\n");
const recipes = postcss.root();
for (const recipePath of recipePaths) {
  recipes.append(postcss.parse(readFileSync(recipePath, "utf8"), { from: recipePath }).nodes);
}
const contractKnobs = Object.values(controlKnobContracts).flat();

function knobReachesRenderedProperty(
  knob: string,
  dependents: ReadonlyMap<string, ReadonlySet<string>>,
  rendered: ReadonlySet<string>,
): boolean {
  const pending = [knob];
  const visited = new Set(pending);
  while (pending.length > 0) {
    const property = pending.shift();
    if (!property) continue;
    if (rendered.has(property)) return true;
    for (const dependent of dependents.get(property) ?? []) {
      if (visited.has(dependent)) continue;
      visited.add(dependent);
      pending.push(dependent);
    }
  }
  return false;
}

function deadKnobs(root: Root, knobs: readonly string[], renderedSource: string): string[] {
  const dependents = new Map<string, Set<string>>();
  const rendered = new Set<string>();
  root.walkDecls((declaration) => {
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const dependency = match[1];
      if (!dependency) continue;
      if (!declaration.prop.startsWith("--")) {
        rendered.add(dependency);
        continue;
      }
      const properties = dependents.get(dependency) ?? new Set<string>();
      properties.add(declaration.prop);
      dependents.set(dependency, properties);
    }
  });
  for (const knob of knobs) {
    if (renderedSource.includes(knob)) rendered.add(knob);
  }
  return knobs.filter((knob) => !knobReachesRenderedProperty(knob, dependents, rendered));
}

const isIdentityAttribute = (attribute: string) =>
  attribute === identityAttribute || attribute === familyAttribute || attribute === slotAttribute || isFamilyQualifierAttribute(attribute);

function compoundOffenders(compound: selectorParser.Node[], stamped: Set<string>): string[] {
  return flattenCompound(compound).flatMap((flat) => {
    const identities = flat
      .filter((node): node is selectorParser.Attribute => node.type === "attribute")
      .flatMap((node) => (isIdentityAttribute(node.attribute) && node.value ? [[node.attribute, node.value] as AnatomyPair] : []));
    if (identities.length === 0 || stamped.has(pairSetKey(identities))) return [];
    return [`${pairSetKey(identities)} is not stamped by any element`];
  });
}

function deadSelectors(root: Root, stamped: Set<string>): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    const line = rule.source?.start?.line ?? "?";
    const file = rule.source?.input.file ? path.basename(rule.source.input.file) : "recipe.css";
    selectorParser((selectors) => {
      selectors.each((selector) => {
        const compounds: selectorParser.Node[][] = [[]];
        for (const node of selector.nodes) {
          if (node.type === "combinator") compounds.push([]);
          else compounds.at(-1)?.push(node);
        }
        for (const compound of compounds.filter((nodes) => nodes.length > 0)) {
          offenders.push(...compoundOffenders(compound, stamped).map((offender) => `${file}:${line} ${offender}`));
        }
      });
    }).processSync(rule.selector);
  });
  return offenders;
}

type RecipeSource = { file: string; source: string };

function isAllowedRecipeRootNode(node: Root["nodes"][number]): boolean {
  if (node.type === "comment") return true;
  if (node.type !== "atrule") return false;
  if (node.name === "property" || node.name === "keyframes") return true;
  return node.name === "layer" && node.params.trim() === "components";
}

function unlayeredRecipeOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  return root.nodes
    .filter((node) => !isAllowedRecipeRootNode(node))
    .map((node) => `${file}:${node.source?.start?.line ?? "?"} top-level ${node.type}`);
}

/** Same file, same family and slot: the element a rule's declarations compute on, whatever its state or variant. */
function elementKey(rule: postcss.Rule): string {
  const identity = rule.selector.match(/data-(?:control-family|slot)="[^"]*"/g) ?? [];
  return `${rule.source?.input.file ?? ""} ${identity.join("")}`;
}

function knobReadingForeignPrivateOffenders(root: Root): string[] {
  const declaredOn = new Map<string, Set<string>>();
  root.walkDecls(/^--_/, (declaration) => {
    const rule = declaration.parent;
    if (!(rule instanceof postcss.Rule)) return;
    const key = elementKey(rule);
    declaredOn.set(key, (declaredOn.get(key) ?? new Set()).add(declaration.prop));
  });
  const offenders: string[] = [];
  root.walkRules((rule) => {
    const declaredHere = declaredOn.get(elementKey(rule)) ?? new Set<string>();
    rule.each((node) => {
      if (node.type !== "decl" || !node.prop.startsWith("--cui-")) return;
      for (const [reference] of node.value.matchAll(/--_[\w-]+/g)) {
        if (declaredHere.has(reference)) continue;
        offenders.push(
          `${path.basename(node.source?.input.file ?? "recipe.css")}:${node.source?.start?.line ?? "?"} ${node.prop} reads ${reference}`,
        );
      }
    });
  });
  return offenders;
}

function paletteReadOffenders({ file, source }: RecipeSource): string[] {
  return source.split("\n").flatMap((line, index) => {
    const paletteRead = /var\((--(?:color-[a-z]+-\d+|scale-[a-z0-9-]+))\)/.exec(line);
    return paletteRead ? [`${file}:${index + 1} ${paletteRead[1]}`] : [];
  });
}

/**
 * A skin re-values a knob on the bare part at (0,1,0), above every zero-specificity recipe rule. A state rule that
 * re-values the same knob is therefore masked the moment a skin touches the base value; the state has to travel through
 * a private property the base rule reads.
 */
function stateRuleOwnKnobOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (paintedStates(rule.selector).length === 0) return;
    const subjectFamilies = new Set(Array.from(rule.selector.matchAll(/data-control-family="([^"]*)"/g), ([, family]) => family));
    rule.each((node) => {
      if (node.type !== "decl" || !node.prop.startsWith("--cui-")) return;
      const family = Object.keys(controlKnobContracts).find((candidate) => controlKnobContracts[candidate]?.includes(node.prop));
      if (family && subjectFamilies.size > 0 && !subjectFamilies.has(family)) return;
      offenders.push(`${file}:${node.source?.start?.line ?? "?"} ${node.prop}`);
    });
  });
  return offenders;
}

function hasTopLevelComma(value: string): boolean {
  let depth = 0;
  for (const character of value) {
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === 0) return true;
  }
  return false;
}

/** `none` is not a shadow layer: one `none` inside a comma list invalidates the whole `box-shadow`. */
function listComposedShadowNoneOffenders(root: Root): string[] {
  const listComposed = new Set<string>();
  root.walkDecls((declaration) => {
    if (!hasTopLevelComma(declaration.value)) return;
    for (const [, knob] of declaration.value.matchAll(/var\((--cui-[\w-]+-shadow)\)/g)) listComposed.add(knob);
  });
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    if (!listComposed.has(declaration.prop) || declaration.value.trim() !== "none") return;
    offenders.push(
      `${path.basename(declaration.source?.input.file ?? "recipe.css")}:${declaration.source?.start?.line ?? "?"} ${declaration.prop}`,
    );
  });
  return offenders;
}

/** WebKit resolves `inherit` on a non-inheriting registered property once, then keeps that value when the parent's changes. */
function stalledInheritOffenders(root: Root): string[] {
  const nonInheriting = new Set<string>();
  const theme = postcss.parse(readFileSync(path.join(SOURCES_DIR, "theme.css"), "utf8"));
  for (const sheet of [root, theme]) {
    sheet.walkAtRules("property", (rule) => {
      if (rule.nodes?.some((node) => node.type === "decl" && node.prop === "inherits" && node.value.trim() === "false"))
        nonInheriting.add(rule.params.trim());
    });
  }
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    if (declaration.value.trim() !== "inherit" || !nonInheriting.has(declaration.prop)) return;
    offenders.push(
      `${path.basename(declaration.source?.input.file ?? "recipe.css")}:${declaration.source?.start?.line ?? "?"} ${declaration.prop}`,
    );
  });
  return offenders;
}

const recipeSources = recipePaths.map((recipePath) => ({
  file: path.basename(recipePath),
  source: readFileSync(recipePath, "utf8"),
}));

const stampedAnatomiesInComponents = stampedAnatomyKeys(componentSources);

describe("recipe hygiene", () => {
  test("knob defaults read only private variables declared in the same rule", () => {
    expect(knobReadingForeignPrivateOffenders(recipes)).toEqual([]);
  });

  test("recipes paint roles, never a palette or ramp step", () => {
    expect(recipeSources.flatMap(paletteReadOffenders)).toEqual([]);
  });

  test("state rules carry their value through a private property, never the family's own knob", () => {
    expect(recipeSources.flatMap(stateRuleOwnKnobOffenders)).toEqual([]);
  });

  test("a shadow knob composed into a list never defaults to none", () => {
    expect(listComposedShadowNoneOffenders(recipes)).toEqual([]);
  });

  test("a value that changes reaches its readers by inheritance, never by inherit on a non-inheriting property", () => {
    expect(stalledInheritOffenders(recipes)).toEqual([]);
  });
});

describe("recipe reachability", () => {
  test("every public knob reaches rendered CSS or a structural utility", () => {
    expect(deadKnobs(recipes, contractKnobs, sourceText)).toEqual([]);
  });

  test("every selector targets a compound of identity attributes one element stamps together", () => {
    expect(deadSelectors(recipes, stampedAnatomiesInComponents)).toEqual([]);
  });

  test("every recipe rule sits inside @layer components, below consumer utilities", () => {
    expect(recipeSources.flatMap(unlayeredRecipeOffenders)).toEqual([]);
  });
});
