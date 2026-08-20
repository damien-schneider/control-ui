import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { componentEntries } from "../../../app/(features)/catalog/components";
import { primitiveEntries } from "../../../app/(features)/catalog/primitives";
import { createRecipeSourceExpectations } from "../../../scripts/registry-model";
import { controlKnobContracts } from "../knob-contracts";
import { THEME_CONTRACT_NAMES } from "../lib/theme-contract";

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const COMPONENTS_DIR = fileURLToPath(new URL("../sources/control-ui/", import.meta.url));
const COMPONENT_REFERENCE_ROOTS = [
  { root: COMPONENTS_DIR, label: "src/registry/sources/control-ui" },
  { root: fileURLToPath(new URL("../examples/", import.meta.url)), label: "src/registry/examples" },
  { root: fileURLToPath(new URL("../../../app/", import.meta.url)), label: "app" },
  { root: fileURLToPath(new URL("../../../components/", import.meta.url)), label: "components" },
] as const;
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: postcss.parse(readFileSync(path.join(SKIN_PACKS_DIR, id, "skin.css"), "utf8")) }));

const recipeOptionalCatalogIds = ["aspect-ratio", "checkbox-group", "form", "responsive-dialog"] as const;
const catalogComponentSources = [
  ...componentEntries.map((entry) => ({ id: entry.id, source: entry.paths.source.path })),
  ...primitiveEntries
    .filter((entry) => entry.id !== "typography")
    .map((entry) => ({ id: entry.id, source: entry.paths.registry.source.path })),
];
function knobsWithRepeatedFamilyPrefix(knobs: readonly string[]): string[] {
  return knobs.filter((knob) => {
    const segments = knob.slice(2).split("-");
    for (let width = 1; width <= Math.floor(segments.length / 2); width += 1) {
      if (segments.slice(0, width).join("-") === segments.slice(width, width * 2).join("-")) return true;
    }
    return false;
  });
}

describe("knob naming", () => {
  test("never repeats the family prefix", () => {
    expect(knobsWithRepeatedFamilyPrefix(Object.values(controlKnobContracts).flat())).toEqual([]);
  });

  test("rejects a repeated multi-segment family prefix", () => {
    expect(knobsWithRepeatedFamilyPrefix(["--chat-composer-chat-composer-editor-font-size"])).toEqual([
      "--chat-composer-chat-composer-editor-font-size",
    ]);
  });
});

const COMPONENT_SOURCE_ROOT = "src/registry/sources/control-ui/";
const contractEntries = Object.entries(controlKnobContracts);

function recipeKnobFamilies(root: Root): string[] {
  const registered = new Set<string>();
  root.walkAtRules("property", (atRule) => {
    registered.add(atRule.params.trim());
  });
  const registeredFamilies = contractEntries.filter(([, knobs]) => knobs.some((knob) => registered.has(knob))).map(([family]) => family);
  if (registeredFamilies.length > 0) return registeredFamilies;

  const rendered = new Set<string>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) rendered.add(declaration.prop);
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const knob = match[1];
      if (knob) rendered.add(knob);
    }
  });
  return contractEntries.filter(([, knobs]) => knobs.some((knob) => rendered.has(knob))).map(([family]) => family);
}

function recipeFilenameFamily(recipePath: string): string | undefined {
  const stem = path.basename(recipePath, ".css");
  return contractEntries
    .map(([family]) => family)
    .filter((family) => stem === family || stem.startsWith(`${family}-`))
    .sort((left, right) => right.length - left.length)[0];
}

const familySources: Record<string, Set<string>> = Object.fromEntries(contractEntries.map(([family]) => [family, new Set<string>()]));
const familyRecipePaths: Record<string, Set<string>> = Object.fromEntries(contractEntries.map(([family]) => [family, new Set<string>()]));
const unresolvedRecipeFamilies: string[] = [];

for (const expectation of createRecipeSourceExpectations()) {
  const filePath = path.join(process.cwd(), expectation.recipe);
  const root = postcss.parse(readFileSync(filePath, "utf8"), { from: filePath });
  const renderedFamilies = recipeKnobFamilies(root);
  const recipeFamilies = renderedFamilies.length > 0 ? renderedFamilies : [recipeFilenameFamily(expectation.recipe)].filter(Boolean);
  if (recipeFamilies.length !== 1) {
    unresolvedRecipeFamilies.push(`${expectation.recipe}: ${recipeFamilies.join(", ") || "none"}`);
    continue;
  }
  const recipeFamily = recipeFamilies[0];
  if (!recipeFamily) continue;
  familyRecipePaths[recipeFamily]?.add(filePath);
  for (const source of expectation.sources) {
    familySources[recipeFamily]?.add(source.slice(COMPONENT_SOURCE_ROOT.length));
  }
}

const allRecipeRoot = postcss.root();
const allRecipePaths = [...new Set(Object.values(familyRecipePaths).flatMap((paths) => [...paths]))].sort();
for (const filePath of allRecipePaths) {
  allRecipeRoot.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
}

const families = contractEntries.map(([id, knobs]) => ({
  id,
  knobs,
  sources: [...(familySources[id] ?? [])],
}));

describe("family source coverage", () => {
  test("every recipe resolves to one knob contract", () => {
    expect(unresolvedRecipeFamilies).toEqual([]);
  });

  test("companion recipes resolve through rendered knobs or their family filename", () => {
    const companion = postcss.parse("a { color: var(--field-foreground); }");
    expect(recipeKnobFamilies(companion)).toEqual(["field"]);
    expect(recipeFilenameFamily("src/registry/sources/control-ui/recipes/field-parts.css")).toBe("field");
  });

  test("every knob contract owns recipe-attached component sources", () => {
    expect(Object.entries(familySources).filter(([, sources]) => sources.size === 0)).toEqual([]);
  });

  test("every painted catalog component attaches a recipe", () => {
    const recipeAttachedSources = new Set(Object.values(familySources).flatMap((sources) => [...sources]));
    const missing = catalogComponentSources
      .filter(({ source }) => !recipeAttachedSources.has(source.slice(COMPONENT_SOURCE_ROOT.length)))
      .map(({ id }) => id)
      .sort();
    expect(missing).toEqual([...recipeOptionalCatalogIds].sort());
  });
});
const knownKnobs: Set<string> = new Set(Object.values(controlKnobContracts).flat());

const runtimeProperties = new Set([
  ...THEME_CONTRACT_NAMES,
  "--accordion-panel-height",
  "--activity-content-max-height",
  "--toast-index",
  "--toast-swipe-movement-x",
  "--toast-swipe-movement-y",
  "--sidebar",
  "--code-foreground",
  "--sidebar-primary",
  "--sidebar-foreground",
  "--sidebar-border",
  "--sidebar-width",
  "--sidebar-width-icon",
  "--drawer-swipe-movement-x",
  "--drawer-swipe-movement-y",
  "--transform-origin",
  "--popup-height",
  "--popup-width",
  "--toast-frontmost-height",
  "--toast-height",
  "--toast-offset-y",
]);
const publicKnobPrefixes = new Set(
  [...knownKnobs].map((knob) => knob.match(/^--[a-z0-9]+-/)?.[0]).filter((prefix): prefix is string => prefix !== undefined),
);

function unknownComponentKnobReferences(): string[] {
  const offenders: string[] = [];
  for (const { root, label } of COMPONENT_REFERENCE_ROOTS) {
    const sourcePaths = readdirSync(root, { encoding: "utf8", recursive: true })
      .filter(
        (relativePath) =>
          (relativePath.endsWith(".ts") || relativePath.endsWith(".tsx")) &&
          !relativePath.endsWith(".test.ts") &&
          !relativePath.endsWith(".test.tsx"),
      )
      .sort();
    for (const relativePath of sourcePaths) {
      const source = readFileSync(path.join(root, relativePath), "utf8");
      for (const match of source.matchAll(/--[a-z][a-z0-9-]*/g)) {
        const knob = match[0];
        if (
          knob.endsWith("-") ||
          knob.startsWith("--_") ||
          knownKnobs.has(knob) ||
          runtimeProperties.has(knob) ||
          knob.startsWith("--code-token-") ||
          ![...publicKnobPrefixes].some((prefix) => knob.startsWith(prefix))
        ) {
          continue;
        }
        const line = source.slice(0, match.index).split("\n").length;
        offenders.push(`${label}/${relativePath}:${line} ${knob}`);
      }
    }
  }
  return offenders;
}

describe("component source knob references", () => {
  test("every family-prefixed custom property belongs to a contract", () => {
    expect(unknownComponentKnobReferences()).toEqual([]);
  });
});

function recipe(id: string): Root {
  const root = postcss.root();
  for (const filePath of familyRecipePaths[id] ?? []) {
    root.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
  }
  return root;
}

function unknownKnobOffenders(root: Root, prefix: string, knobs: readonly string[], label: string): string[] {
  const contract = new Set<string>(knobs);
  const offenders: string[] = [];
  const check = (name: string, line: number | undefined) => {
    if (runtimeProperties.has(name)) return;
    if (knownKnobs.has(name) && !contract.has(name)) return;
    if (name.startsWith("--_")) return;
    if (/^--badge-(?:neutral|red|orange|yellow|green|blue|purple|pink)(?:-(?:foreground|border|hover))?$/.test(name)) return;
    if (!contract.has(name)) offenders.push(`${label}:${line ?? "?"} ${name}`);
  };
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    if (declaration.prop.startsWith(prefix)) check(declaration.prop, line);
    for (const match of declaration.value.matchAll(new RegExp(`var\\(\\s*(${prefix}[\\w-]+)`, "g"))) check(match[1] ?? "", line);
  });
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith(prefix)) check(name, atRule.source?.start?.line);
  });
  return offenders;
}

function privateInheritanceBridgeOffenders(root: Root, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const offenders: string[] = [];

  root.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--_")) return;
    const publicKnob = declaration.value.match(/^var\((--(?!_)[\w-]+)\)$/)?.[1];
    if (publicKnob && contract.has(publicKnob) && declaration.prop === `--_${publicKnob.slice(2)}`) {
      offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop} -> ${publicKnob}`);
    }
  });

  return offenders;
}

function hasFunctionalSelectorAncestor(pseudo: selectorParser.Pseudo): boolean {
  let ancestor = pseudo.parent;
  while (ancestor) {
    if (ancestor.type === "pseudo" && (ancestor.value === ":where" || ancestor.value === ":is")) return true;
    ancestor = ancestor.parent;
  }
  return false;
}

function pseudoElementsInsideFunctionalSelectors(root: Root): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkPseudos((pseudo) => {
        if (!pseudo.value.startsWith("::") || !hasFunctionalSelectorAncestor(pseudo)) return;
        offenders.push(`${rule.source?.start?.line ?? "?"} ${rule.selector}`);
      });
    }).processSync(rule.selector);
  });
  return offenders;
}
function nonZeroSpecificitySelectors(root: Root): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    selectorParser((selectors) => {
      for (const selector of selectors.nodes) {
        const [where, pseudoElement, ...remainder] = selector.nodes;
        const hasZeroSpecificityBase = where?.type === "pseudo" && where.value === ":where";
        const hasValidTail = pseudoElement === undefined || (pseudoElement.type === "pseudo" && pseudoElement.value.startsWith("::"));
        if (hasZeroSpecificityBase && hasValidTail && remainder.length === 0) continue;
        offenders.push(`${rule.source?.start?.line ?? "?"} ${selector.toString()}`);
      }
    }).processSync(rule.selector);
  });
  return offenders;
}

type CustomPropertyCycleWalk = {
  references: Map<string, Set<string>>;
  active: Set<string>;
  completed: Set<string>;
  propertyPath: string[];
  recorded: Set<string>;
  offenders: string[];
  line: number | string;
};

function recordCustomPropertyCycle(reference: string, walk: CustomPropertyCycleWalk) {
  const cycleStart = walk.propertyPath.indexOf(reference);
  const members = [...new Set(walk.propertyPath.slice(cycleStart))].sort();
  const key = members.join("<>");
  if (walk.recorded.has(key)) return;
  walk.recorded.add(key);
  walk.offenders.push(`${walk.line} ${members.join(" <> ")}`);
}

function visitCustomProperty(property: string, walk: CustomPropertyCycleWalk) {
  if (walk.completed.has(property)) return;
  walk.active.add(property);
  walk.propertyPath.push(property);
  for (const reference of walk.references.get(property) ?? []) {
    if (!walk.references.has(reference)) continue;
    if (walk.active.has(reference)) recordCustomPropertyCycle(reference, walk);
    else visitCustomProperty(reference, walk);
  }
  walk.propertyPath.pop();
  walk.active.delete(property);
  walk.completed.add(property);
}

function customPropertyCycles(root: Root): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    const references = new Map<string, Set<string>>();
    rule.walkDecls((declaration) => {
      if (!declaration.prop.startsWith("--")) return;
      references.set(
        declaration.prop,
        new Set([...declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)].flatMap((match) => (match[1] ? [match[1]] : []))),
      );
    });
    const walk: CustomPropertyCycleWalk = {
      references,
      active: new Set(),
      completed: new Set(),
      propertyPath: [],
      recorded: new Set(),
      offenders,
      line: rule.source?.start?.line ?? "?",
    };
    for (const property of references.keys()) visitCustomProperty(property, walk);
  });
  return offenders;
}
function invalidPropertySyntaxOffenders(root: Root): string[] {
  const offenders: string[] = [];
  root.walkAtRules("property", (atRule) => {
    const syntax = atRule.nodes?.find((node) => node.type === "decl" && node.prop === "syntax");
    if (syntax?.type === "decl" && (/\{\d+(?:,\d*)?\}/.test(syntax.value) || />\s+</.test(syntax.value))) {
      offenders.push(`${atRule.source?.start?.line ?? "?"} ${atRule.params.trim()}`);
    }
  });
  return offenders;
}

const FAMILY_ROOT_MARKERS: Record<string, readonly string[]> = {
  button: ['[data-control-family="button"][data-slot="trigger"]', '[data-control-family="button"][data-dialog-part="close"]'],
  choice: [
    '[data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]',
    '[data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"]',
  ],
  "color-picker": ["area", "alpha", "hue", "output", "swatch", "trigger", "wheel"].map(
    (slot) => `[data-control-family="color-picker"][data-slot="${slot}"]`,
  ),
  drawer: ['[data-control-family="drawer"][data-slot="backdrop"]', '[data-control-family="drawer"][data-slot="content"]'],
  "phone-input": ['[data-control-family="field"][data-field-kind="phone-input"][data-slot="root"]'],
  popup: [
    '[data-popup-part="surface"]',
    '[data-popup-part="list-surface"]',
    '[data-popup-part="bar"]',
    '[data-surface="modal"]',
    '[data-surface="floating"]',
  ].map((part) => `[data-control-family="popup"]${part}`),
  resizable: ['[data-control-family="resizable"][data-slot="panel-group"]'],
  "rich-tooltip": ['[data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"]'],
  sidebar: ['[data-control-family="sidebar"][data-slot="wrapper"]'],
  tabs: ['[data-control-family="tabs"][data-slot="list"]'],
  "source-badge": ['[data-control-family="badge"][data-source-badge][data-slot="root"]'],
};

function selectorSubjects(selector: string): string[] {
  return selector
    .replace(/:(?:has|not)\([^)]*\)/g, "")
    .replace(/:(?:where|is)\(/g, " ")
    .split(",")
    .map(
      (part) =>
        part
          .split(/[\s>+~()]+/)
          .filter(Boolean)
          .at(-1) ?? "",
    );
}

function compoundIsFamilyRoot(compound: string, family: string): boolean {
  const markerMatches = (marker: string) => (marker.match(/\[[^\]]+\]/g) ?? []).every((attribute) => compound.includes(attribute));
  if (FAMILY_ROOT_MARKERS[family]?.some(markerMatches)) return true;
  if (!compound.includes(`[data-control-family="${family}"]`)) return false;
  return (
    compound.includes('[data-slot="root"]') || compound.includes('[data-control="true"]') || !/\[data-(?:slot|[a-z-]+-part)=/.test(compound)
  );
}

function selectorIsFamilyRoot(selector: string, family: string): boolean {
  return selectorSubjects(selector).every((subject) => compoundIsFamilyRoot(subject, family));
}

function knobRootDefaultOffenders(root: Root, family: string, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const declaredOnRoot = new Set<string>();
  const firstDeclarationLine = new Map<string, number | string>();
  root.walkDecls((declaration) => {
    if (!contract.has(declaration.prop)) return;
    firstDeclarationLine.set(declaration.prop, firstDeclarationLine.get(declaration.prop) ?? declaration.source?.start?.line ?? "?");
    if (declaration.parent?.type === "rule" && selectorIsFamilyRoot(declaration.parent.selector, family)) {
      declaredOnRoot.add(declaration.prop);
    }
  });
  return knobs.filter((knob) => !declaredOnRoot.has(knob)).map((knob) => `${firstDeclarationLine.get(knob) ?? "?"} ${knob}`);
}

function knobPlacementOffenders(root: Root, family: string, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const stateSelector =
    /\[data-(?:state|active|checked|indeterminate|disabled|invalid|open|selected|dragging|pressed|current|expanded|collapsed)[=\]]|:(?:hover|focus|focus-visible|focus-within|active|disabled|checked)/;
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    if (!contract.has(declaration.prop) || declaration.parent?.type !== "rule") return;
    if (!selectorIsFamilyRoot(declaration.parent.selector, family) && !stateSelector.test(declaration.parent.selector)) {
      offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop}`);
    }
  });
  return offenders;
}

function unreadKnobOffenders(root: Root, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const read = new Set<string>();
  const declarationLines = new Map<string, number | string>();
  root.walkDecls((declaration) => {
    if (contract.has(declaration.prop)) {
      declarationLines.set(declaration.prop, declarationLines.get(declaration.prop) ?? declaration.source?.start?.line ?? "?");
    }
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const knob = match[1];
      if (knob && contract.has(knob)) read.add(knob);
    }
  });
  return knobs.filter((knob) => !read.has(knob)).map((knob) => `${declarationLines.get(knob) ?? "?"} ${knob}`);
}

function privateFallbackOffenders(root: Root, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    for (const match of declaration.value.matchAll(/var\(\s*--_[\w-]+\s*,\s*var\(\s*(--[\w-]+)\s*\)\s*\)/g)) {
      const knob = match[1];
      if (knob && contract.has(knob)) offenders.push(`${declaration.source?.start?.line ?? "?"} ${knob}`);
    }
  });
  return offenders;
}

function recipeIdentitySelectorOffenders(root: Root): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    if (/\[data-control-ui=/.test(rule.selector) || !/\[data-control-family=/.test(rule.selector)) {
      offenders.push(`${rule.source?.start?.line ?? "?"} ${rule.selector}`);
    }
  });
  return offenders;
}

const FAMILY_SOURCE_MARKERS: Record<string, readonly string[]> = {
  badge: ['family = "badge"'],
  "phone-input": ['data-field-kind="phone-input"'],
  "rich-tooltip": ['data-popup-kind="rich-tooltip"'],
  "source-badge": ['data-source-badge=""'],
};

function semanticIdentityOffenders(family: string, sources: readonly { name: string; source: string }[]): string[] {
  const markers = [`data-control-family="${family}"`, `"data-control-family": "${family}"`, ...(FAMILY_SOURCE_MARKERS[family] ?? [])];
  return sources.flatMap(({ name, source }) => {
    if (markers.some((marker) => source.includes(marker))) return [];
    const identityIndex = source.search(/data-control-ui|"data-control-ui"/);
    const line = identityIndex < 0 ? 1 : source.slice(0, identityIndex).split("\n").length;
    return [`${name}:${line} missing data-control-family="${family}"`];
  });
}

function knobInheritanceOffenders(root: Root, knobs: readonly string[]): string[] {
  const inheritance = new Map<string, { value: string; line: number | string }>();
  root.walkAtRules("property", (atRule) => {
    const inherits = atRule.nodes?.find((node) => node.type === "decl" && node.prop === "inherits");
    if (inherits?.type === "decl") {
      inheritance.set(atRule.params.trim(), {
        value: inherits.value,
        line: atRule.source?.start?.line ?? "?",
      });
    }
  });
  return knobs.filter((knob) => inheritance.get(knob)?.value !== "true").map((knob) => `${inheritance.get(knob)?.line ?? "?"} ${knob}`);
}

describe("recipe architecture guards", () => {
  test("rejects private inheritance bridges", () => {
    const invalid = postcss.parse("a { --_example-child: var(--example-child); }");
    expect(privateInheritanceBridgeOffenders(invalid, ["--example-child"])).toEqual(["1 --_example-child -> --example-child"]);
  });

  test("rejects non-inheriting public knob registrations", () => {
    const invalid = postcss.parse(`
      :where([data-control-family="example"]) { --example-knob: red; color: var(--example-knob); }
      @property --example-knob { syntax: "<color>"; inherits: false; initial-value: transparent; }
    `);
    expect(knobInheritanceOffenders(invalid, ["--example-knob"])).toEqual(["3 --example-knob"]);
  });

  test("rejects public knob defaults outside the family root", () => {
    const invalid = postcss.parse(`
      :where([data-control-family="example"][data-slot="child"]) { --example-knob: red; color: var(--example-knob); }
    `);
    expect(knobRootDefaultOffenders(invalid, "example", ["--example-knob"])).toEqual(["2 --example-knob"]);
  });

  test("rejects unconditional skin knob re-values outside family roots", () => {
    const invalid = postcss.parse(`
      [data-skin="example"] :where([data-control-family="example"][data-slot="child"]) { --example-knob: red; }
    `);
    expect(knobPlacementOffenders(invalid, "example", ["--example-knob"])).toEqual(["2 --example-knob"]);
  });

  test("rejects public knobs that recipes never read", () => {
    const invalid = postcss.parse(`
      :where([data-control-family="example"]) { --example-knob: red; color: blue; }
    `);
    expect(unreadKnobOffenders(invalid, ["--example-knob"])).toEqual(["2 --example-knob"]);
  });

  test("rejects public knobs read through private fallbacks", () => {
    const invalid = postcss.parse(`
      :where([data-control-family="example"]) { --example-knob: red; color: var(--_example-knob, var(--example-knob)); }
    `);
    expect(privateFallbackOffenders(invalid, ["--example-knob"])).toEqual(["2 --example-knob"]);
  });

  test("rejects recipe selectors keyed by data-control-ui", () => {
    const invalid = postcss.parse(':where([data-control-ui="example"]) { color: red; }');
    expect(recipeIdentitySelectorOffenders(invalid)).toEqual(['1 :where([data-control-ui="example"])']);
  });

  test("rejects family sources missing semantic identity", () => {
    const source = 'const before = true;\n<div data-control-ui="example" />';
    expect(semanticIdentityOffenders("example", [{ name: "example.tsx", source }])).toEqual([
      'example.tsx:2 missing data-control-family="example"',
    ]);
  });

  test("rejects pseudo-elements inside functional selectors", () => {
    const invalid = postcss.parse(`:where([data-slot="root"]::before) { content: ""; }`);
    expect(pseudoElementsInsideFunctionalSelectors(invalid)).toEqual([`1 :where([data-slot="root"]::before)`]);
  });
  test("rejects state specificity outside the zero-specificity wrapper", () => {
    const invalid = postcss.parse(`:where([data-slot="root"]):hover { color: red; }`);
    expect(nonZeroSpecificitySelectors(invalid)).toEqual([`1 :where([data-slot="root"]):hover`]);
  });
  test("rejects unsupported property syntax composition", () => {
    const invalid = postcss.parse(
      '@property --repetition { syntax: "<number>{1,2}"; inherits: false; initial-value: 0; } @property --composition { syntax: "<length> <length>"; inherits: false; initial-value: 0px; }',
    );
    expect(invalidPropertySyntaxOffenders(invalid)).toEqual(["1 --repetition", "1 --composition"]);
  });

  test("rejects direct custom-property cycles", () => {
    const invalid = postcss.parse("a { --public: var(--_private); --_private: var(--public); }");
    expect(customPropertyCycles(invalid)).toEqual(["1 --_private <> --public"]);
  });
  test("rejects self-referential custom-property fallbacks", () => {
    const invalid = postcss.parse("a { --private: var(--private, red); }");
    expect(customPropertyCycles(invalid)).toEqual(["1 --private"]);
  });
});

for (const family of families) {
  describe(`${family.id} paint contract`, () => {
    const root = recipe(family.id);
    const prefix = `--${family.id}-`;

    test("every family source stamps its semantic identity", () => {
      const sources = family.sources.map((name) => ({
        name,
        source: readFileSync(path.join(COMPONENTS_DIR, name), "utf8"),
      }));
      expect(semanticIdentityOffenders(family.id, sources)).toEqual([]);
    });

    test("every knob inherits and declares its default on the family root", () => {
      expect(knobRootDefaultOffenders(root, family.id, family.knobs)).toEqual([]);
      expect(knobInheritanceOffenders(root, family.knobs)).toEqual([]);

      if (family.id === "range") {
        const registration = root.nodes.find(
          (node) => node.type === "atrule" && node.name === "property" && node.params.trim() === "--range-thumb-background",
        );
        expect(registration?.toString()).toContain('syntax: "*"');
      }
    });

    test("core and skins reference only contract knobs", () => {
      const offenders = [
        ...unknownKnobOffenders(root, prefix, family.knobs, "core"),
        ...skins.flatMap(({ id, root: skinRoot }) => unknownKnobOffenders(skinRoot, prefix, family.knobs, id)),
      ];
      expect(offenders).toEqual([]);
    });

    test("skin knob re-values live on family roots or explicit states", () => {
      const offenders = skins.flatMap(({ id, root: skinRoot }) =>
        knobPlacementOffenders(skinRoot, family.id, family.knobs).map((offender) => `${id}:${offender}`),
      );
      expect(offenders).toEqual([]);
    });

    test("recipe knob re-values live on family roots or explicit states", () => {
      expect(knobPlacementOffenders(root, family.id, family.knobs)).toEqual([]);
    });

    test("private inheritance bridges stay absent", () => {
      expect(privateInheritanceBridgeOffenders(root, family.knobs)).toEqual([]);
    });

    test("custom properties never form same-element cycles", () => {
      expect(customPropertyCycles(root)).toEqual([]);
    });

    test("every public knob is read somewhere in its recipe", () => {
      expect(unreadKnobOffenders(root, family.knobs)).toEqual([]);
    });

    test("public knobs are never read through a private fallback", () => {
      expect(privateFallbackOffenders(root, family.knobs)).toEqual([]);
    });

    test("recipe selectors key on data-control-family", () => {
      expect(recipeIdentitySelectorOffenders(root)).toEqual([]);
    });

    test("contract names follow the public knob grammar", () => {
      const grammar = new RegExp(`^${prefix}[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)*$`);
      expect(family.knobs.filter((knob) => !grammar.test(knob))).toEqual([]);
    });

    test("pseudo-elements remain outside functional selector arguments", () => {
      expect(pseudoElementsInsideFunctionalSelectors(root)).toEqual([]);
    });
    test("selectors keep states and descendants inside the zero-specificity wrapper", () => {
      expect(nonZeroSpecificitySelectors(root)).toEqual([]);
    });

    test("property registrations use supported syntax grammar", () => {
      expect(invalidPropertySyntaxOffenders(root)).toEqual([]);
    });

    test("motion rides the shared duration and easing tokens", () => {
      const offenders: string[] = [];
      root.walkDecls(/^(transition|animation)/, (declaration) => {
        if (/(^|[\s,(])\d+(\.\d+)?m?s\b|cubic-bezier\(|steps\(|linear\(/.test(declaration.value)) {
          offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop}: ${declaration.value}`);
        }
      });
      expect(offenders).toEqual([]);
    });
  });
}
