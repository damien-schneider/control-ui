import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { componentEntries } from "../../../app/(features)/catalog/components";
import { kitEntries } from "../../../app/(features)/catalog/kits";
import { isFamilyPartAttribute, slotAttribute, surfaceAttribute } from "../../../scripts/control-anatomy";
import { knobPrefix, knobsByFamily } from "../../../scripts/knob-contracts/collect";
import { readCssRulesWithImports } from "../../../scripts/read-css";
import { createRecipeSourceExpectations } from "../../../scripts/registry-model";
import type { SkinContract } from "../../../scripts/skin-contract/model";

import { THEME_CONTRACT_NAMES } from "../lib/theme-contract";

const controlKnobContracts = knobsByFamily();
const skinContract: SkinContract = JSON.parse(readFileSync(new URL("../../../public/r/skin-contract.json", import.meta.url), "utf8"));

const SKIN_PACKS_DIR = fileURLToPath(new URL("./", import.meta.url));
const COMPONENTS_DIR = fileURLToPath(new URL("../sources/control-ui/", import.meta.url));
const BLOCKS_DIR = fileURLToPath(new URL("../blocks/", import.meta.url));
const skins = readdirSync(SKIN_PACKS_DIR)
  .filter((entry) => statSync(path.join(SKIN_PACKS_DIR, entry)).isDirectory())
  .sort()
  .map((id) => ({ id, root: postcss.parse(readCssRulesWithImports(path.join(SKIN_PACKS_DIR, id, "skin.css"))) }));

const recipeOptionalCatalogIds = [
  "aspect-ratio",
  "checkbox-group",
  "email",
  "form",
  "live-status",
  "responsive-dialog",
  "typography",
] as const;
const catalogComponentSources = [
  ...kitEntries.map((entry) => ({ id: entry.id, source: entry.paths.source.path })),
  ...componentEntries.map((entry) => ({ id: entry.id, source: entry.paths.registry.source.path })),
];

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
  const filenameFamily = recipeFilenameFamily(expectation.recipe);
  const recipeFamilies = renderedFamilies.length === 1 || !filenameFamily ? renderedFamilies : [filenameFamily];
  if (recipeFamilies.length !== 1) {
    unresolvedRecipeFamilies.push(`${expectation.recipe}: ${recipeFamilies.join(", ") || "none"}`);
    continue;
  }
  const recipeFamily = recipeFamilies[0];
  if (!recipeFamily) continue;
  familyRecipePaths[recipeFamily]?.add(filePath);
  for (const source of expectation.sources) {
    familySources[recipeFamily]?.add(source);
  }
}

const allRecipeRoot = postcss.root();
const allRecipePaths = [...new Set(Object.values(familyRecipePaths).flatMap((paths) => [...paths]))].sort();
for (const filePath of allRecipePaths) {
  allRecipeRoot.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
}

const families = contractEntries.map(([id, knobs]) => ({ id, knobs }));

describe("family source coverage", () => {
  test("every recipe resolves to one knob contract", () => {
    expect(unresolvedRecipeFamilies).toEqual([]);
  });

  test("every knob contract owns recipe-attached component sources", () => {
    expect(Object.entries(familySources).filter(([, sources]) => sources.size === 0)).toEqual([]);
  });

  test("every painted catalog component attaches a recipe", () => {
    const recipeAttachedSources = new Set(Object.values(familySources).flatMap((sources) => [...sources]));
    const missing = catalogComponentSources
      .filter(({ source }) => !recipeAttachedSources.has(source))
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

function recipe(id: string): Root {
  const root = postcss.root();
  for (const filePath of familyRecipePaths[id] ?? []) {
    root.append(postcss.parse(readFileSync(filePath, "utf8"), { from: filePath }).nodes);
  }
  return root;
}

function appearanceValueIsImplemented(attribute: string, value: string, css: string, source: string): boolean {
  if (css.includes(`[${attribute}="${value}"]`)) return true;
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prop = attribute.slice("data-".length);
  return [
    new RegExp(`${attribute}\\s*=\\s*["']${escapedValue}["']`),
    new RegExp(`${attribute}\\s*=\\s*\\{[^}]*["']${escapedValue}["'][^}]*\\}`),
    new RegExp(`\\b${prop}\\s*(?:===|!==)\\s*["']${escapedValue}["']`),
    new RegExp(`^\\s*(?:["']${escapedValue}["']|${escapedValue})\\s*:`, "m"),
  ].some((pattern) => pattern.test(source));
}

function appearanceDefaults(attribute: string, source: string): Set<string> {
  const prop = attribute.slice("data-".length);
  return new Set([...source.matchAll(new RegExp(`\\b${prop}\\s*=\\s*["']([^"']+)["']`, "g"))].flatMap((match) => match[1] ?? []));
}

function unhandledAppearanceValues(attribute: string, values: readonly string[], css: string, source: string): string[] {
  const defaults = appearanceDefaults(attribute, source);
  return values.filter((value) => !defaults.has(value) && !appearanceValueIsImplemented(attribute, value, css, source));
}

type AppearancePart = {
  family?: string;
  states: readonly {
    attribute: string;
    valueKind: string;
    values: readonly string[];
  }[];
};

const appearanceSourceCache = new Map<string, string>();
const recipeCssCache = new Map<string, string>();
let componentSources: readonly string[] | undefined;

function readComponentSources(): readonly string[] {
  componentSources ??= [COMPONENTS_DIR, BLOCKS_DIR].flatMap((directory) =>
    readdirSync(directory, { encoding: "utf8", recursive: true })
      .filter((name) => /\.(?:ts|tsx)$/.test(name) && !name.includes(".test."))
      .map((name) => readFileSync(path.join(directory, name), "utf8")),
  );
  return componentSources;
}

function recipeCss(family: string): string {
  const cached = recipeCssCache.get(family);
  if (cached !== undefined) return cached;
  const css = recipe(family).toString();
  recipeCssCache.set(family, css);
  return css;
}

function appearanceSource(scope: string, family: string): string {
  const cacheKey = `${scope}:${family}`;
  const cached = appearanceSourceCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const scopeMarkers = [`data-control-ui="${scope}"`, `"data-control-ui": "${scope}"`];
  const familyMarkers = [`data-control-family="${family}"`, `"data-control-family": "${family}"`, `family = "${family}"`];
  const source = readComponentSources()
    .filter(
      (candidate) =>
        scopeMarkers.some((marker) => candidate.includes(marker)) && familyMarkers.some((marker) => candidate.includes(marker)),
    )
    .join("\n");
  appearanceSourceCache.set(cacheKey, source);
  return source;
}

function appearancePartOffenders(scope: string, partName: string, part: AppearancePart, checked: Set<string>): string[] {
  const family = part.family ?? scope;
  const offenders: string[] = [];
  for (const state of part.states) {
    if (!["data-variant", "data-tone"].includes(state.attribute) || state.valueKind !== "enum" || state.values.length < 2) continue;
    const key = `${family}:${partName}:${state.attribute}:${state.values.join(",")}`;
    if (checked.has(key)) continue;
    checked.add(key);
    const missing = unhandledAppearanceValues(state.attribute, state.values, recipeCss(family), appearanceSource(scope, family));
    if (missing.length > 0) offenders.push(`${family}:${partName}:${state.attribute} leaves ${missing.join(", ")} unimplemented`);
  }
  return offenders;
}

function appearanceVocabularyOffenders(): string[] {
  const checked = new Set<string>();
  return Object.entries(skinContract.scopes).flatMap(([scope, definition]) =>
    Object.entries(definition.parts).flatMap(([partName, part]) => appearancePartOffenders(scope, partName, part, checked)),
  );
}

describe("appearance vocabularies", () => {
  test("every typed variant and tone changes paint or rendering beyond one base value", () => {
    expect(appearanceVocabularyOffenders()).toEqual([]);
  });
});

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
  "audio-recorder": ['[data-control-ui="audio-recorder"][data-slot="root"]'],
  avatar: ['[data-control-family="avatar"][data-slot="favicon"]', '[data-control-family="avatar"][data-slot="source-favicon"]'],
  context: ['[data-control-family="context"][data-slot="content"]'],
  "dockable-panel": ['[data-control-family="popup"][data-popup-kind="drawer"][data-slot="content"][data-dockable-panel-root]'],
  "inline-citation": ['[data-control-ui="inline-citation"][data-slot="content"]'],
  button: ['[data-control-family="button"][data-slot="trigger"]', '[data-control-family="button"][data-popup-part="close"]'],
  choice: [
    '[data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]',
    '[data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"]',
  ],
  "color-picker": ["area", "output", "slider", "swatch", "trigger", "wheel"].map(
    (slot) => `[data-control-family="color-picker"][data-slot="${slot}"]`,
  ),
  "phone-input": ['[data-control-family="field"][data-field-kind="phone-input"][data-slot="root"]'],
  popup: [
    '[data-popup-part="surface"]',
    '[data-popup-part="list-surface"]',
    '[data-popup-part="bar"]',
    // A portalled backdrop is a root of its own: nothing above it carries popup knobs.
    '[data-popup-part="backdrop"]',
    '[data-surface="modal"]',
    '[data-surface="floating"]',
  ].map((part) => `[data-control-family="popup"]${part}`),
  resizable: ['[data-control-family="resizable"][data-slot="panel-group"]'],
  reveal: ['[data-control-family="reveal"][data-slot="scope"]'],
  "rich-tooltip": ['[data-control-family="popup"][data-popup-kind="rich-tooltip"][data-slot="content"]'],
  sidebar: ['[data-control-family="sidebar"][data-slot="wrapper"]'],
  tabs: ['[data-control-family="tabs"][data-slot="list"]'],
  "source-badge": ['[data-control-family="badge"][data-source-badge][data-slot="root"]'],
};

function selectorSubjects(selector: string): string[] {
  return selector
    .replace(/:(?:has|not)\([^)]*\)/g, "")
    .replace(/:is\((?:\s*[a-z]+\s*,?)+\)/g, "")
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

function selectorDataAttributes(selector: string): string[] {
  return [...selector.matchAll(/\[(data-[\w-]+)[=\]]/g)].map((match) => match[1]);
}

function compoundIsFamilyRoot(compound: string, family: string): boolean {
  const markerMatches = (marker: string) => (marker.match(/\[[^\]]+\]/g) ?? []).every((attribute) => compound.includes(attribute));
  if (FAMILY_ROOT_MARKERS[family]?.some(markerMatches)) return true;
  if (!compound.includes(`[data-control-family="${family}"]`)) return false;
  const namesAPart = selectorDataAttributes(compound).some((attribute) => attribute === slotAttribute || isFamilyPartAttribute(attribute));
  return compound.includes('[data-slot="root"]') || compound.includes('[data-control="true"]') || !namesAPart;
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

const stateAttributes = new Set(
  Object.values(skinContract.scopes).flatMap((scope) =>
    Object.values(scope.parts).flatMap((part) => part.states.map((state) => state.attribute)),
  ),
);
const STATE_PSEUDOS = /:(?:hover|focus|focus-visible|focus-within|active|disabled|checked)/;
const SKIN_RUNTIME_STATE_PREFIXES = ["data-apple-liquid-glass", "data-liquid-metal"] as const;

function isStateScoped(selector: string): boolean {
  if (STATE_PSEUDOS.test(selector)) return true;
  return selectorDataAttributes(selector).some(
    (attribute) =>
      stateAttributes.has(attribute) ||
      attribute === surfaceAttribute ||
      SKIN_RUNTIME_STATE_PREFIXES.some((prefix) => attribute.startsWith(prefix)),
  );
}
function knobPlacementOffenders(root: Root, family: string, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    if (!contract.has(declaration.prop) || declaration.parent?.type !== "rule") return;
    if (!selectorIsFamilyRoot(declaration.parent.selector, family) && !isStateScoped(declaration.parent.selector)) {
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

function knobFallbackOffenders(root: Root, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)\s*,\s*var\(\s*(--[\w-]+)\s*\)\s*\)/g)) {
      const [, outer, knob] = match;
      if (knob && contract.has(knob) && !contract.has(outer)) offenders.push(`${declaration.source?.start?.line ?? "?"} ${knob}`);
    }
  });
  return offenders;
}

// Slots hosted by another family's element (composed Button, render-prop trigger): the family attr belongs to the host, so recipes key them by data-control-ui.
const COMPOSED_HOST_SLOTS: Record<string, "*" | readonly string[]> = {
  "audio-recorder": "*",
  "hover-card": ["trigger"],
  "inline-citation": ["favicon", "content", "source-favicon"],
  "morphing-panel": ["trigger"],
};

// A family whose components each carry their own data-control-ui name.
const FAMILY_COMPONENTS: Record<string, readonly string[]> = {
  popup: ["hover-card"],
};

// Elements another family hosts and stamps with a protocol attribute: the family keys them by that attribute.
const HOSTED_PROTOCOL_IDENTITY: Record<string, string> = {
  "track-highlight": "[data-track-item]",
};

function selectorSlots(selector: string): string[] {
  return [...selector.matchAll(/\[data-slot="([\w-]+)"\]/g)].flatMap((match) => (match[1] ? [match[1]] : []));
}

function selectorCompoundsOf(selector: string): string[] {
  return selector
    .replace(/:(?:where|is|not|has)\(/g, " ")
    .split(/[\s>+~,()]+/)
    .filter((token) => token.includes("[data-"));
}

function isComposedHostCompound(compound: string, family: string | undefined): boolean {
  if (!family) return false;
  return [family, ...(FAMILY_COMPONENTS[family] ?? [])].some((component) => {
    const composedSlots = COMPOSED_HOST_SLOTS[component];
    if (!composedSlots || !compound.includes(`[data-control-ui="${component}"]`)) return false;
    if (composedSlots === "*") return true;
    const slots = selectorSlots(compound);
    return slots.length > 0 && slots.every((slot) => composedSlots.includes(slot));
  });
}

function recipeIdentitySelectorOffenders(root: Root, family?: string): string[] {
  const offenders: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    const compounds = selectorCompoundsOf(rule.selector);
    const uiCompounds = compounds.filter((compound) => compound.includes("[data-control-ui="));
    const composedOk = uiCompounds.every((compound) => isComposedHostCompound(compound, family));
    const hostedIdentity = family ? HOSTED_PROTOCOL_IDENTITY[family] : undefined;
    const hasIdentity =
      compounds.some((compound) => compound.includes("[data-control-family=")) ||
      uiCompounds.some((compound) => isComposedHostCompound(compound, family)) ||
      (hostedIdentity !== undefined && compounds.some((compound) => compound.includes(hostedIdentity)));
    if (!composedOk || !hasIdentity) offenders.push(`${rule.source?.start?.line ?? "?"} ${rule.selector}`);
  });
  return offenders;
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

for (const family of families) {
  describe(`${family.id} paint contract`, () => {
    const root = recipe(family.id);
    const prefix = `${knobPrefix}${family.id}-`;

    test("every knob inherits and declares its default on the family root", () => {
      expect(knobRootDefaultOffenders(root, family.id, family.knobs)).toEqual([]);
      expect(knobInheritanceOffenders(root, family.knobs)).toEqual([]);
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

    test("public knobs are never bypassed by contextual fallbacks", () => {
      expect(knobFallbackOffenders(root, family.knobs)).toEqual([]);
    });

    test("recipe selectors key on data-control-family", () => {
      expect(recipeIdentitySelectorOffenders(root, family.id)).toEqual([]);
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

function knobsReadingNestRadius(root: Root): string[] {
  const knobs = new Set<string>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--cui-") && /var\(\s*--nest-radius\s*,/.test(declaration.value)) knobs.add(declaration.prop);
  });
  return [...knobs].sort();
}

function nestRadiusBypassOffenders(root: Root, knobs: readonly string[]): string[] {
  const contract = new Set(knobs);
  const offenders: string[] = [];
  root.walkDecls((declaration) => {
    if (contract.has(declaration.prop) && !/var\(\s*--nest-radius\s*,/.test(declaration.value)) {
      offenders.push(`${declaration.source?.start?.line ?? "?"} ${declaration.prop}`);
    }
  });
  return offenders;
}

describe("nest radius contract", () => {
  const nestRadiusKnobs = knobsReadingNestRadius(allRecipeRoot);

  test("controls that can sit in a container's corner take their radius from it", () => {
    expect(nestRadiusKnobs).toEqual([
      "--cui-badge-radius",
      "--cui-button-radius",
      "--cui-chat-composer-shell-radius",
      "--cui-field-radius",
      "--cui-range-track-radius",
      "--cui-tabs-list-radius",
    ]);
  });

  for (const { id, root } of skins) {
    test(`${id} keeps the container fallback on nested radius knobs`, () => {
      expect(nestRadiusBypassOffenders(root, nestRadiusKnobs)).toEqual([]);
    });
  }
});
