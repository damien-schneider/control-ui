import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { familyAttribute, identityAttribute, isFamilyQualifierAttribute, slotAttribute } from "../../../scripts/control-anatomy";
import { knobsByFamily } from "../../../scripts/knob-contracts/collect";
import { bucketingOffenders, flattenCompound } from "../../../scripts/selector-bucketing";
import { type AnatomyPair, pairSetKey, stampedAnatomyKeys } from "../../../scripts/stamped-anatomy";

const controlKnobContracts = knobsByFamily();

const SOURCES_DIR = fileURLToPath(new URL("../sources/control-ui/", import.meta.url));
const RECIPES_DIR = path.join(SOURCES_DIR, "recipes");
const recipePaths = readdirSync(RECIPES_DIR)
  .filter((name) => name.endsWith(".css"))
  .sort()
  .map((name) => path.join(RECIPES_DIR, name));
const componentSources = readdirSync(SOURCES_DIR, { encoding: "utf8", recursive: true })
  .filter((name) => /\.(?:ts|tsx)$/.test(name) && !name.includes(".test."))
  .map((name) => ({ name, source: readFileSync(path.join(SOURCES_DIR, name), "utf8") }));
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

function recipeSourceStructureOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const componentLayers = root.nodes.filter(
    (node) => node.type === "atrule" && node.name === "layer" && node.params.trim() === "components",
  );
  const offenders = componentLayers.length === 1 ? [] : [`${file}: expected one @layer components block, found ${componentLayers.length}`];
  const lineCount = source.length === 0 ? 0 : source.split("\n").length - Number(source.endsWith("\n"));
  if (lineCount > 400) offenders.push(`${file}: exceeds 400 lines`);
  for (const recipeNode of root.nodes.filter((node) => !isAllowedRecipeRootNode(node))) {
    offenders.push(`${file}:${recipeNode.source?.start?.line ?? "?"} top-level ${recipeNode.type}`);
  }
  return offenders;
}

function recipeStructureOffenders(entries: readonly RecipeSource[]): string[] {
  return entries.flatMap(recipeSourceStructureOffenders);
}

function oneUsePrivateVariableOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const declarations = new Map<string, postcss.Declaration[]>();
  const references = new Map<string, postcss.Declaration[]>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--_")) {
      const entries = declarations.get(declaration.prop) ?? [];
      entries.push(declaration);
      declarations.set(declaration.prop, entries);
    }
    for (const match of declaration.value.matchAll(/var\(\s*(--_[\w-]+)/g)) {
      const name = match[1];
      if (!name) continue;
      const entries = references.get(name) ?? [];
      entries.push(declaration);
      references.set(name, entries);
    }
  });
  return [...declarations]
    .filter(([, declared]) => declared.length === 1)
    .flatMap(([name, declared]) => {
      const read = references.get(name) ?? [];
      const declaration = declared[0];
      const reference = read[0];
      if (read.length !== 1 || !declaration || !reference || declaration.parent !== reference.parent) return [];
      return [`${file}:${declaration.source?.start?.line ?? "?"} ${name}`];
    });
}

function unusedPrivateVariableOffenders(root: Root, renderedSource: string): string[] {
  const declarations = new Map<string, postcss.Declaration[]>();
  const references = new Set<string>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--_")) {
      const entries = declarations.get(declaration.prop) ?? [];
      entries.push(declaration);
      declarations.set(declaration.prop, entries);
    }
    for (const match of declaration.value.matchAll(/--_[\w-]+/g)) references.add(match[0]);
  });
  return [...declarations]
    .filter(([name]) => !references.has(name) && !renderedSource.includes(name))
    .flatMap(([name, entries]) =>
      entries.map(
        (declaration) =>
          `${path.basename(declaration.source?.input.file ?? "recipe.css")}:${declaration.source?.start?.line ?? "?"} ${name}`,
      ),
    );
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

function selectorContext(rule: postcss.Rule): string {
  const ancestors: string[] = [];
  for (let node: postcss.Container | postcss.Document | undefined = rule.parent; node; node = node.parent) {
    if (node instanceof postcss.AtRule && node.name !== "layer") ancestors.push(`@${node.name} ${node.params}`);
  }
  return ancestors.reverse().join(" > ");
}

function normalizedSelector(selector: string): string {
  return selector
    .replace(/\s+/g, " ")
    .replace(/\s*([,>+~])\s*/g, "$1")
    .trim();
}

function duplicateSelectorOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const firstLineBySelector = new Map<string, number | string>();
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    const selector = normalizedSelector(rule.selector);
    const key = `${selectorContext(rule)}\u0000${selector}`;
    const line = rule.source?.start?.line ?? "?";
    const firstLine = firstLineBySelector.get(key);
    if (firstLine === undefined) firstLineBySelector.set(key, line);
    else offenders.push(`${file}:${line} duplicates line ${firstLine}: ${selector}`);
  });
  return offenders;
}

function selectorBucketSplitOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const offenders: string[] = [];
  root.walkRules((rule) => {
    for (const offender of bucketingOffenders(rule.selector)) {
      if (offender.includes("split the subject")) offenders.push(`${file}:${rule.source?.start?.line ?? "?"} ${offender}`);
    }
  });
  return offenders;
}

function consumerClassSelectorOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const offenders: string[] = [];
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkClasses((className) => {
        if (!/^(?:group|peer)(?:\/|$)/.test(className.value)) return;
        offenders.push(`${file}:${rule.source?.start?.line ?? "?"} .${className.value}`);
      });
    }).processSync(rule.selector);
  });
  return offenders;
}

function adHocPartAttributeOffenders({ file, source }: RecipeSource): string[] {
  const root = postcss.parse(source, { from: file });
  const offenders: string[] = [];
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkAttributes((attribute) => {
        if (!/^data-[a-z0-9-]+-part$/.test(attribute.attribute) || attribute.attribute === "data-popup-part") return;
        offenders.push(`${file}:${rule.source?.start?.line ?? "?"} ${attribute.attribute}`);
      });
    }).processSync(rule.selector);
  });
  return offenders;
}

function adHocSourcePartAttributes(source: string): string[] {
  return [...new Set([...source.matchAll(/\bdata-[a-z0-9-]+-part\b/g)].map((match) => match[0]))].filter(
    (attribute) => attribute !== "data-popup-part",
  );
}

const recipeSources = recipePaths.map((recipePath) => ({
  file: path.basename(recipePath),
  source: readFileSync(recipePath, "utf8"),
}));

const stampedAnatomiesInComponents = stampedAnatomyKeys(componentSources);

describe("recipe hygiene", () => {
  test("private variables earn reuse or state indirection", () => {
    expect(recipeSources.flatMap(oneUsePrivateVariableOffenders)).toEqual([]);
  });

  test("rejects one-use private aliases inside one rule", () => {
    const invalid = { file: "invalid.css", source: "a { --_paint: red; color: var(--_paint); }" };
    expect(oneUsePrivateVariableOffenders(invalid)).toEqual(["invalid.css:1 --_paint"]);
  });

  test("private variables reach rendered CSS or component source", () => {
    expect(unusedPrivateVariableOffenders(recipes, sourceText)).toEqual([]);
  });

  test("rejects unused private variables", () => {
    const invalid = postcss.parse("a { --_unused: red; }", { from: "invalid.css" });
    expect(unusedPrivateVariableOffenders(invalid, "")).toEqual(["invalid.css:1 --_unused"]);
  });

  test("knob defaults read only private variables declared in the same rule", () => {
    expect(knobReadingForeignPrivateOffenders(recipes)).toEqual([]);
  });

  test("rejects a knob default computed from another slot's private variable", () => {
    const invalid = postcss.parse(
      '[data-slot="root"] { --cui-x-radius: calc(var(--_fit) + 1px); }\n[data-slot="list"] { --_fit: 1px; }\n[data-slot="list"][data-size="sm"] { --cui-x-gap: var(--_fit); }',
      { from: "invalid.css" },
    );
    expect(knobReadingForeignPrivateOffenders(invalid)).toEqual(["invalid.css:1 --cui-x-radius reads --_fit"]);
  });

  test("selectors open once per at-rule context", () => {
    expect(recipeSources.flatMap(duplicateSelectorOffenders)).toEqual([]);
  });

  test("rejects duplicate selectors in one context", () => {
    const invalid = { file: "invalid.css", source: "a { color: red; }\na { background: blue; }" };
    expect(duplicateSelectorOffenders(invalid)).toEqual(["invalid.css:2 duplicates line 1: a"]);
  });

  test("subject selectors stay bucketable", () => {
    expect(recipeSources.flatMap(selectorBucketSplitOffenders)).toEqual([]);
  });

  test("rejects multi-argument subject where selectors", () => {
    const invalid = { file: "invalid.css", source: ":where([data-a], [data-b]) {}" };
    expect(selectorBucketSplitOffenders(invalid)).toEqual([
      "invalid.css:1 :where([data-a], [data-b]) — split the subject's :where() into one selector per argument",
    ]);
  });

  test("recipes key relationships on emitted anatomy, never consumer classes", () => {
    expect(recipeSources.flatMap(consumerClassSelectorOffenders)).toEqual([]);
  });

  test("rejects group and peer selector coupling", () => {
    const invalid = { file: "invalid.css", source: ":where(.group\\/turn:hover *) { color: red; }\n.peer:disabled ~ a {}" };
    expect(consumerClassSelectorOffenders(invalid)).toEqual(["invalid.css:1 .group/turn", "invalid.css:2 .peer"]);
  });

  test("component anatomy uses data-slot; only the cross-component popup family needs a part qualifier", () => {
    expect(recipeSources.flatMap(adHocPartAttributeOffenders)).toEqual([]);
    expect(adHocSourcePartAttributes(sourceText)).toEqual([]);
  });

  test("rejects ad hoc family part aliases", () => {
    const invalid = {
      file: "invalid.css",
      source: ':where([data-control-family="select"][data-select-part="trigger"]) { color: red; }',
    };
    expect(adHocPartAttributeOffenders(invalid)).toEqual(["invalid.css:1 data-select-part"]);
  });
});

function literalGeometryUtilities(classList: string): string[] {
  return classList
    .split(/\s+/)
    .filter((utility) => /^-?(?:h|min-h|max-h|w|min-w|size|p|px|py|ps|pe|pt|pb|gap|rounded)(?:-|$)/.test(utility))
    .filter((utility) => !utility.includes("var(--"));
}

const popupStructureConst = componentSources.find(({ name }) => name === "surface-variants.ts");
const popupStructureClasses = popupStructureConst?.source.match(/popupItemStructureClasses = "([^"]*)"/)?.[1] ?? "";

describe("recipe reachability", () => {
  test("every public knob reaches rendered CSS or a structural utility", () => {
    expect(deadKnobs(recipes, contractKnobs, sourceText)).toEqual([]);
  });

  test("rejects a registered knob with no rendered consumer", () => {
    const invalid = postcss.parse("a { --example-dead: red; }");
    expect(deadKnobs(invalid, ["--example-dead"], "")).toEqual(["--example-dead"]);
  });

  test("every selector targets a compound of identity attributes one element stamps together", () => {
    expect(deadSelectors(recipes, stampedAnatomiesInComponents)).toEqual([]);
  });

  test("rejects an unstamped selector compound", () => {
    const invalid = postcss.parse(':where([data-control-ui="missing-control"]) { color: red; }', { from: "invalid.css" });
    expect(deadSelectors(invalid, new Set())).toEqual(['invalid.css:1 [data-control-ui="missing-control"] is not stamped by any element']);
  });

  test("every recipe keeps one bounded component layer", () => {
    const entries = recipePaths.map((recipePath) => ({
      file: path.basename(recipePath),
      source: readFileSync(recipePath, "utf8"),
    }));
    expect(recipeStructureOffenders(entries)).toEqual([]);
  });

  test("rejects split layers and unlayered rules", () => {
    const invalid = [{ file: "invalid.css", source: "@layer components {}\n@layer components {}\na {}" }];
    expect(recipeStructureOffenders(invalid)).toEqual([
      "invalid.css: expected one @layer components block, found 2",
      "invalid.css:3 top-level rule",
    ]);
  });

  test("allows top-level keyframes beside the bounded component layer", () => {
    const valid = [{ file: "valid.css", source: "@layer components {}\n@keyframes fade { from { opacity: 0; } to { opacity: 1; } }" }];
    expect(recipeStructureOffenders(valid)).toEqual([]);
  });

  test("rejects oversized recipe files", () => {
    const invalid = [{ file: "invalid.css", source: `@layer components {\n${"\n".repeat(399)}}` }];
    expect(recipeStructureOffenders(invalid)).toEqual(["invalid.css: exceeds 400 lines"]);
  });

  test("shared popup structure stays free of literal geometry the popup recipe owns", () => {
    expect(popupStructureClasses).not.toBe("");
    expect(literalGeometryUtilities(popupStructureClasses)).toEqual([]);
  });

  test("rejects literal geometry smuggled into a shared structure const", () => {
    expect(literalGeometryUtilities("flex min-h-[2rem] items-center gap-2 p-[var(--popover-padding)]")).toEqual(["min-h-[2rem]", "gap-2"]);
  });
});
