/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for skin validation. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { THEME_CONTRACT_NAMES } from "../src/registry/lib/theme-contract";
import {
  familyAttribute,
  familyPartAttribute,
  identityAttribute,
  isAnatomyMetadataAttribute,
  isFamilyQualifierAttribute,
  skinScopeAttribute,
  slotAttribute,
  surfaceAttribute,
} from "./control-anatomy";
import { knobPrefix, knobsByFamily, recipesDir } from "./knob-contracts/collect";
import {
  type Anatomy,
  collectEffectUtilities,
  collectKnobOwnership,
  createAnatomyResolver,
  createSubjectAnatomyResolver,
  knobsPainting,
} from "./knob-ownership";
import { flattenCompound } from "./selector-bucketing";
import { collectSkinContract } from "./skin-contract/collect";
import type { ContractPart } from "./skin-contract/model";
import { type AnatomyPair, pairSetKey, stampedAnatomyKeys } from "./stamped-anatomy";

const controlKnobContracts = knobsByFamily();

const contract = collectSkinContract();
const resolveAnatomy = createAnatomyResolver(contract);
const resolveSubjectAnatomy = createSubjectAnatomyResolver(contract);
// A recipe rule paints its subject. Crediting its knobs to the compounds above it would bar a skin from
// painting an ancestor those knobs never reach.
const knobOwnership = collectKnobOwnership(contract, resolveSubjectAnatomy);
const effectUtilities = collectEffectUtilities();
const knobsByPrefix: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(controlKnobContracts)
    .sort(([left], [right]) => right.length - left.length)
    .map(([family, knobs]) => [`${knobPrefix}${family}-`, knobs]),
);
const skinRoot = path.join(process.cwd(), "src/registry/skin-packs");
const componentRoots = ["src/registry/sources/control-ui", "src/registry/blocks/control-ui"].map((root) => path.join(process.cwd(), root));
const stampedAnatomies = stampedAnatomyKeys(
  componentRoots.flatMap((root) => filesUnder(root, [".ts", ".tsx"])).map((file) => ({ source: readFileSync(file, "utf8") })),
);
const shadowLayerKnobs = collectShadowLayerKnobs();
const failures: string[] = [];

function attributeValue(attribute: any): string | undefined {
  return typeof attribute?.value === "string" ? attribute.value : undefined;
}

function directCompounds(selector: any): any[][] {
  const compounds: any[][] = [[]];
  for (const node of selector.nodes ?? []) {
    if (node.type === "combinator") compounds.push([]);
    else compounds.at(-1)?.push(node);
  }
  return compounds.filter((compound) => compound.length > 0);
}

function nestedSelectors(nodes: any[]): any[] {
  return nodes.flatMap((node) => {
    const nested = node.nodes?.filter((child: any) => child.type === "selector") ?? [];
    return [...nested, ...nested.flatMap((selector: any) => nestedSelectors(selector.nodes ?? []))];
  });
}

function attributesIn(compound: any[]): any[] {
  return compound.filter((node) => node.type === "attribute");
}

const partsByAnatomy = new Map<string, ContractPart[]>();
for (const [scope, definition] of Object.entries(contract.scopes)) {
  for (const [slot, part] of Object.entries(definition.parts)) {
    for (const key of [`${scope}:${slot}`, ...(part.family ? [`${part.family}:${slot}`] : [])]) {
      partsByAnatomy.set(key, [...(partsByAnatomy.get(key) ?? []), part]);
    }
  }
}

const skinRuntimeStatePrefixes: Record<string, readonly string[]> = {
  "liquid-metal": ["data-liquid-metal"],
  "modern-apple": ["data-apple-liquid-glass"],
};

function isSkinRuntimeState(file: string, attribute: string): boolean {
  return Object.entries(skinRuntimeStatePrefixes).some(
    ([skin, prefixes]) => file.includes(`/skin-packs/${skin}/`) && prefixes.some((prefix) => attribute.startsWith(prefix)),
  );
}

function validateState(file: string, anatomy: string, attribute: any): void {
  if (isAnatomyMetadataAttribute(attribute.attribute)) return;
  if (isSkinRuntimeState(file, attribute.attribute)) return;
  const states = (partsByAnatomy.get(anatomy) ?? []).flatMap((part) =>
    part.states.filter((entry) => entry.attribute === attribute.attribute),
  );
  if (states.length === 0) {
    failures.push(`${file}: unsupported state ${anatomy} ${attribute.attribute}`);
    return;
  }
  const value = attributeValue(attribute);
  const enums = states.filter((state) => state.valueKind === "enum");
  if (value && enums.length === states.length && !enums.some((state) => state.values.includes(value))) {
    failures.push(`${file}: unsupported state value ${anatomy} ${attribute.attribute}=${value}`);
  }
}

const bareHostTags = new Set(["a", "button", "input", "select", "textarea"]);

function selectorAttributes(selector: any): any[] {
  const allAttributes: any[] = [];
  selector.walkAttributes((attribute: any) => allAttributes.push(attribute));
  return allAttributes;
}

function validateSelectorOwnership(file: string, selectorText: string, attributes: any[]): boolean {
  const hasSkin = attributes.some((attribute) => attribute.attribute === skinScopeAttribute);
  const hasControlUi = attributes.some((attribute) => [identityAttribute, familyAttribute].includes(attribute.attribute));
  if (hasControlUi && !hasSkin) {
    failures.push(`${file}: Control UI selector is not scoped by data-skin: ${selectorText}`);
  }
  return hasSkin;
}

function validateBareHost(file: string, selectorText: string, compound: any[], hasSkin: boolean, attributes: any[]): void {
  if (!hasSkin || attributes.some((attribute) => [identityAttribute, familyAttribute].includes(attribute.attribute))) return;
  if (compound.some((node) => node.type === "tag" && bareHostTags.has(node.value.toLowerCase()))) {
    failures.push(`${file}: bare host selector is not anatomy-safe: ${selectorText}`);
  }
}

function validateAnatomy(file: string, key: string | undefined, part: string | undefined, attributes: any[]): void {
  if (!key || !part) return;
  const anatomy = `${key}:${part}`;
  if (!partsByAnatomy.has(anatomy)) {
    failures.push(`${file}: unknown part ${anatomy}`);
    return;
  }
  for (const attribute of attributes) validateState(file, anatomy, attribute);
}

function validateCompound(file: string, selectorText: string, compound: any[], hasSkin: boolean): void {
  const attributes = attributesIn(compound);
  const scopeNode = attributes.find((attribute) => attribute.attribute === identityAttribute);
  const familyNode = attributes.find((attribute) => attribute.attribute === familyAttribute);
  const slotNode = attributes.find((attribute) => attribute.attribute === slotAttribute);
  const surfaceNode = attributes.find((attribute) => attribute.attribute === surfaceAttribute);
  const scope = attributeValue(scopeNode);
  const part = attributeValue(slotNode);
  const key = attributeValue(familyNode) ?? scope;

  if (slotNode && !familyNode) {
    failures.push(`${file}: anatomy part keys ${slotAttribute} without ${familyAttribute}: ${selectorText}`);
  }
  if (surfaceNode && (!familyNode || !slotNode)) {
    failures.push(`${file}: semantic selector is not Control UI scoped: ${selectorText}`);
  }
  if (scope && !(scope in contract.scopes)) failures.push(`${file}: unknown scope ${scope}`);
  validateAnatomy(file, key, part, attributes);
  validateBareHost(file, selectorText, compound, hasSkin, attributes);
}

function validateSelectorStructure(file: string, selectorText: string, selector: any): void {
  const attributes = selectorAttributes(selector);
  const hasSkin = validateSelectorOwnership(file, selectorText, attributes);

  const selectors = [selector, ...nestedSelectors(selector.nodes ?? [])];
  for (const current of selectors) {
    for (const compound of directCompounds(current)) validateCompound(file, selectorText, compound, hasSkin);
  }
}

function editDistance(left: string, right: string): number {
  const distances = Array.from({ length: left.length + 1 }, (_, index) => [index, ...new Array<number>(right.length).fill(0)]);
  for (let column = 1; column <= right.length; column++) distances[0][column] = column;
  for (let row = 1; row <= left.length; row++) {
    for (let column = 1; column <= right.length; column++) {
      const substitution = left[row - 1] === right[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitution,
      );
    }
  }
  return distances[left.length][right.length];
}

const nonPaintProperties = new Set(["--sidebar-width", "--sidebar-width-icon"]);

function validateKnobName(file: string, name: string, line: number | undefined): void {
  if (nonPaintProperties.has(name)) return;
  if (name.startsWith("--_")) return;
  const family = Object.entries(knobsByPrefix).find(([prefix]) => name.startsWith(prefix));
  if (!family || family[1].includes(name)) return;
  const [closest, distance] = family[1].map((knob): [string, number] => [knob, editDistance(name, knob)]).sort(([, a], [, b]) => a - b)[0];
  const hint = distance <= 3 ? ` — did you mean ${closest}?` : "";
  failures.push(`${file}:${line ?? "?"} unknown knob ${name}${hint}`);
}

function shadowLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === 0) {
      layers.push(value.slice(start, index));
      start = index + 1;
    }
  }
  return [...layers, value.slice(start)].map((layer) => layer.trim());
}

/** The custom property a layer hands its whole value to: `var(--x)` or `var(--x, fallback)` and nothing beside it. */
function layerReference(layer: string): string | undefined {
  const name = /^var\(\s*(--[\w-]+)/.exec(layer)?.[1];
  if (!name) return undefined;
  let depth = 0;
  for (let index = 0; index < layer.length; index++) {
    if (layer[index] === "(") depth += 1;
    if (layer[index] !== ")") continue;
    depth -= 1;
    if (depth === 0) return index === layer.length - 1 ? name : undefined;
  }
  return undefined;
}

type ShadowValue = { value: string; insideList: boolean };

/** The custom properties a shadow value hands whole layers to, and whether each sits in a comma-separated list. */
function layerReferences({ value, insideList }: ShadowValue): { name: string; isList: boolean }[] {
  const layers = shadowLayers(value);
  const isList = insideList || layers.length > 1;
  return layers.flatMap((layer) => {
    const name = layerReference(layer);
    return name ? [{ name, isList }] : [];
  });
}

/** The knobs that end up as one layer of a list, followed from the painted values through the properties that carry them. */
function shadowListKnobs(painted: string[], declared: Map<string, string[]>): Set<string> {
  const layerKnobs = new Set<string>();
  const followed = new Set<string>();
  const pending: ShadowValue[] = painted.map((value) => ({ value, insideList: false }));
  for (let current = pending.pop(); current; current = pending.pop()) {
    for (const { name, isList } of layerReferences(current)) {
      const visit = `${name} ${isList}`;
      if (followed.has(visit)) continue;
      followed.add(visit);
      if (isList && name.startsWith(knobPrefix)) layerKnobs.add(name);
      for (const value of declared.get(name) ?? []) pending.push({ value, insideList: isList });
    }
  }
  return layerKnobs;
}

/**
 * Every knob a recipe paints as one layer of a comma-separated `box-shadow`, followed through the
 * private aliases and knob defaults that carry it there. `none` is a whole-property keyword, so on one
 * of these it voids every other layer of the list: the rim, the focus ring, the elevation.
 */
function collectShadowLayerKnobs(): Set<string> {
  const declared = new Map<string, string[]>();
  const painted: string[] = [];
  for (const file of filesUnder(path.join(process.cwd(), recipesDir), [".css"])) {
    postcss.parse(readFileSync(file, "utf8"), { from: file }).walkDecls((declaration) => {
      if (declaration.prop.startsWith("--")) declared.set(declaration.prop, [...(declared.get(declaration.prop) ?? []), declaration.value]);
      else if (declaration.prop === "box-shadow") painted.push(declaration.value);
    });
  }
  return shadowListKnobs(painted, declared);
}

function validateShadowLayer(file: string, declaration: postcss.Declaration): void {
  if (!shadowLayerKnobs.has(declaration.prop) || declaration.value.trim() !== "none") return;
  failures.push(
    `${file}:${declaration.source?.start?.line ?? "?"} ${declaration.prop}: none voids the box-shadow list the recipe composes it into — use 0 0 transparent`,
  );
}

function validateKnobs(file: string, root: postcss.Root): void {
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    validateKnobName(file, declaration.prop, line);
    validateShadowLayer(file, declaration);
    for (const match of declaration.value.matchAll(/var\(\s*(--[\w-]+)/g)) validateKnobName(file, match[1] ?? "", line);
  });
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (Object.keys(knobsByPrefix).some((prefix) => name.startsWith(prefix))) {
      failures.push(
        `${file}:${atRule.source?.start?.line ?? "?"} @property ${name} — knob registration belongs to the core recipe, never a skin`,
      );
    }
  });
}

function enclosingLayer(rule: postcss.Rule): string | undefined {
  for (let node: postcss.Container | postcss.Document | undefined = rule.parent; node; node = node.parent) {
    if (!(node instanceof postcss.AtRule)) continue;
    if (node.name.endsWith("keyframes")) return "keyframes";
    if (node.name === "utility") return "utilities";
    if (node.name === "layer") return node.params.trim();
  }
  return undefined;
}

function paintingNodes(rule: postcss.Rule): (postcss.Declaration | postcss.AtRule)[] {
  return rule.nodes.filter(
    (node): node is postcss.Declaration | postcss.AtRule =>
      (node.type === "decl" && !node.prop.startsWith("--")) || (node.type === "atrule" && node.name === "apply"),
  );
}

/**
 * Layer membership decides who wins, so it is not housekeeping. Unlayered CSS outranks every layer,
 * including the `utilities` layer a consumer's own className lands in; and a skin rule below
 * `components` loses to the core recipe it means to restyle.
 */
function validateLayer(file: string, rule: postcss.Rule, targetsAnatomy: boolean): void {
  const layer = enclosingLayer(rule);
  if (layer === "keyframes" || paintingNodes(rule).length === 0) return;
  const at = `${file}:${rule.source?.start?.line ?? "?"}`;
  if (!layer) {
    failures.push(`${at} paints outside every @layer, so it outranks the consumer's own className: ${rule.selector}`);
    return;
  }
  if (targetsAnatomy && layer !== "components") {
    failures.push(`${at} paints Control UI anatomy from @layer ${layer}, which loses to the recipe in @layer components: ${rule.selector}`);
  }
}

/**
 * A skin re-values knobs; it never paints a part the recipe already drives from one, or the knob is
 * dead and the caller's `style={{ "--knob": … }}` silently stops working. `@apply` is banned on
 * anatomy for the same reason one step removed: its expansion is invisible here, so it is the one
 * escape hatch this check cannot see through — except for the effects the library itself composes
 * and applies the same way.
 */
function validateKnobBypass(file: string, rule: postcss.Rule, anatomies: readonly Anatomy[]): void {
  for (const node of paintingNodes(rule)) {
    const at = `${file}:${node.source?.start?.line ?? "?"}`;
    if (node.type === "atrule") {
      const applied = node.params.trim().split(/\s+/);
      if (applied.every((utility) => effectUtilities.has(utility))) continue;
      failures.push(`${at} @apply ${node.params} on Control UI anatomy — expand it, then re-value the knobs it paints`);
      continue;
    }
    const knobs = anatomies.flatMap((anatomy) => knobsPainting(knobOwnership, anatomy, node.prop));
    if (knobs.length > 0) failures.push(`${at} paints ${node.prop} directly — re-value ${[...new Set(knobs)].join(" or ")} instead`);
  }
}

/**
 * `.dark` lands on the same element as data-skin in an app that themes the whole page, and on an
 * ancestor when a preview scopes a skin inside one. A rule written only as a descendant of `.dark`
 * never matches the first shape, so its dark values silently vanish from the app: cover both.
 */
function validateModeScope(file: string, rule: postcss.Rule, selectors: any[]): void {
  const isMode = (node: any) => node.type === "class" && (node.value === "dark" || node.value === "light");
  const shapes = selectors.map((selector) => {
    const compounds = directCompounds(selector);
    const scopeIndex = compounds.findIndex((compound) => attributesIn(compound).some((a) => a.attribute === skinScopeAttribute));
    if (scopeIndex < 0) return "unscoped";
    if (compounds[scopeIndex].some(isMode)) return "self";
    return compounds.slice(0, scopeIndex).some((compound) => compound.some(isMode)) ? "ancestor" : "unscoped";
  });
  if (shapes.includes("ancestor") && !shapes.includes("self")) {
    failures.push(
      `${file}:${rule.source?.start?.line ?? "?"} mode class only matches as an ancestor of ${skinScopeAttribute}, so it drops out when both sit on the same element: ${rule.selector}`,
    );
  }
}

/** `:not(.dark, .dark *)` also rules out a dark ancestor, which makes it the one negation that does test the mode. */
function isLightOnlyGate(node: selectorParser.Node): boolean {
  if (node.type !== "pseudo" || node.value !== ":not") return "nodes" in node && node.nodes.some(isLightOnlyGate);
  let negatesDark = false;
  node.walkClasses((candidate) => {
    if (candidate.value === "dark") negatesDark = true;
  });
  const excludesDarkAncestors = node.nodes.some((argument) => {
    const compounds = directCompounds(argument);
    return compounds.length > 1 && compounds[0].some((part) => part.type === "class" && part.value === "dark");
  });
  return negatesDark && !excludesDarkAncestors;
}

/**
 * `:not(.dark)` asks whether one element lacks the class, not whether the page is light. `.dark` sits on
 * `<html>`, so `<body>` and every portalled `[data-skin]` surface under it satisfy the negation in dark
 * mode too and the light-only value leaks there. Only a compound pinned to the root element escapes that.
 */
function validateLightGate(file: string, rule: postcss.Rule, selectors: selectorParser.Selector[]): void {
  const gated = selectors.some((selector) => {
    const compounds: selectorParser.Node[][] = directCompounds(selector);
    if (!compounds.some((compound) => attributesIn(compound).some((attribute) => attribute.attribute === skinScopeAttribute))) return false;
    return compounds.some((compound) => {
      const pinnedToRoot = compound.some(
        (node) => (node.type === "pseudo" && node.value === ":root") || (node.type === "tag" && node.value.toLowerCase() === "html"),
      );
      return !pinnedToRoot && compound.some(isLightOnlyGate);
    });
  });
  if (!gated) return;
  failures.push(
    `${file}:${rule.source?.start?.line ?? "?"} :not(.dark) also matches in dark mode, on any element below the one carrying .dark — make the light value the base and reset it under .dark: ${rule.selector}`,
  );
}

/** The anatomy attributes one contract part can carry, including the qualifiers it only stamps conditionally. */
const contractAnatomies = new Map<string, Map<string, Set<string>>>();
for (const [scope, definition] of Object.entries(contract.scopes)) {
  for (const [slot, part] of Object.entries(definition.parts)) {
    const carried = new Map<string, Set<string>>([
      [identityAttribute, new Set([scope])],
      [slotAttribute, new Set([slot])],
    ]);
    if (part.family) carried.set(familyAttribute, new Set([part.family]));
    for (const state of part.states) {
      if (isFamilyQualifierAttribute(state.attribute)) carried.set(state.attribute, new Set(state.values));
    }
    contractAnatomies.set(`${scope}/${slot}`, carried);
  }
}
for (const [popupPart, sites] of Object.entries(contract.semanticFamilies.popup)) {
  for (const site of sites) {
    const carried = contractAnatomies.get(`${site.scope}/${site.part}`);
    const stamped = carried?.get(familyPartAttribute("popup")) ?? new Set<string>();
    carried?.set(familyPartAttribute("popup"), stamped.add(popupPart));
  }
}

/** The anatomy attributes a compound pins to one exact value. */
function anatomyPairs(compound: selectorParser.Node[]): AnatomyPair[] {
  const keyed = new Map<string, AnatomyPair>();
  for (const attribute of attributesIn(compound)) {
    const value = attributeValue(attribute);
    const name: string = attribute.attribute;
    const keysAnatomy =
      name === identityAttribute || name === familyAttribute || name === slotAttribute || isFamilyQualifierAttribute(name);
    if (value && attribute.operator === "=" && keysAnatomy) keyed.set(`${name}=${value}`, [name, value]);
  }
  return [...keyed.values()];
}

function isStampedAnatomy(pairs: AnatomyPair[]): boolean {
  if (pairs.length === 0 || stampedAnatomies.has(pairSetKey(pairs))) return true;
  return [...contractAnatomies.values()].some((carried) => pairs.every(([attribute, value]) => carried.get(attribute)?.has(value)));
}

/**
 * A compound that names a family no element carries, or a part its scope never stamps, parses and passes
 * every structural check while styling nothing. The anatomy attributes a compound keys must all sit
 * together on one element: either a literal stamp in the components, or a part the contract describes.
 */
function validateStampedAnatomy(file: string, rule: postcss.Rule, selectors: selectorParser.Selector[]): void {
  const unstamped = new Set<string>();
  for (const selector of selectors.flatMap((current) => [current, ...nestedSelectors(current.nodes)])) {
    for (const compound of directCompounds(selector).flatMap(flattenCompound)) {
      const pairs = anatomyPairs(compound);
      if (!isStampedAnatomy(pairs)) unstamped.add(pairSetKey(pairs));
    }
  }
  for (const key of unstamped) {
    failures.push(
      `${file}:${rule.source?.start?.line ?? "?"} ${key} is stamped on no element, so the rule styles nothing: ${rule.selector}`,
    );
  }
}

/**
 * An app that keeps its own `--background`/`--primary` block declares them at `:root`, which lands on the same
 * element as the skin scope at equal weight, so source order alone would decide the palette. Every pack token
 * selector repeats `[data-skin]` to out-specify that block and keep the installed pack authoritative.
 */
function validateTokenScopeWeight(file: string, rule: postcss.Rule, selectors: any[]): void {
  if (!file.includes("/skin-packs/") || !file.endsWith("/theme.css")) return;
  for (const selector of selectors) {
    for (const compound of directCompounds(selector)) {
      const skinAttributes = attributesIn(compound).filter((attribute: any) => attribute.attribute === skinScopeAttribute);
      if (skinAttributes.length !== 1) continue;
      if (!attributeValue(skinAttributes[0])) continue;
      failures.push(
        `${file}:${rule.source?.start?.line ?? "?"} pack tokens tie with an app's own :root block — repeat [${skinScopeAttribute}] in the compound: ${rule.selector}`,
      );
    }
  }
}

function validateCss(file: string, source: string): void {
  try {
    const root = postcss.parse(source, { from: file });
    root.walkRules((rule) => {
      const reported = failures.length;
      selectorParser((selectorRoot) => {
        selectorRoot.each((selector) => validateSelectorStructure(file, rule.selector.replace(/\s+/g, " "), selector));
        validateModeScope(file, rule, [...selectorRoot.nodes]);
        validateLightGate(file, rule, [...selectorRoot.nodes]);
        validateTokenScopeWeight(file, rule, [...selectorRoot.nodes]);
        if (failures.length === reported) validateStampedAnatomy(file, rule, [...selectorRoot.nodes]);
      }).processSync(rule.selector);
      validateLayer(file, rule, resolveAnatomy(rule.selector).length > 0);
      validateKnobBypass(file, rule, resolveSubjectAnatomy(rule.selector));
    });
    validateKnobs(file, root);
  } catch (error) {
    failures.push(`${file}: invalid CSS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function propertyName(node: any): string | undefined {
  if (node?.key?.type === "StringLiteral") return node.key.value;
  if (node?.key?.type === "Identifier") return node.key.name;
  return undefined;
}

function filesUnder(directory: string, extensions: string[]): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const candidate = path.join(directory, entry);
    if (statSync(candidate).isDirectory()) return filesUnder(candidate, extensions);
    return extensions.some((extension) => candidate.endsWith(extension)) && !candidate.includes(".test.") ? [candidate] : [];
  });
}

const STYLE_KEY_DECLARATION = /["'](--[\w-]+)["']\s*:/g;
const ARBITRARY_PROPERTY_DECLARATION = /\[(--[\w-]+):/g;
const CUSTOM_PROPERTY_DECLARATION = /(?:^|[;{\s])--[\w-]+\s*:/;

function declaredCustomProperties(root: string): Set<string> {
  const declared = new Set<string>();
  for (const file of filesUnder(root, [".css"])) {
    const source = readFileSync(file, "utf8");
    if (!CUSTOM_PROPERTY_DECLARATION.test(source)) continue;
    postcss.parse(source, { from: file }).walkDecls((declaration) => {
      if (declaration.prop.startsWith("--")) declared.add(declaration.prop);
    });
  }
  for (const file of filesUnder(root, [".ts", ".tsx"])) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(STYLE_KEY_DECLARATION)) declared.add(match[1]);
    for (const match of source.matchAll(ARBITRARY_PROPERTY_DECLARATION)) declared.add(match[1]);
  }
  return declared;
}

const registryDeclared = declaredCustomProperties(path.join(process.cwd(), "src/registry"));
const packDeclared = new Map(
  readdirSync(skinRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => [entry.name, declaredCustomProperties(path.join(skinRoot, entry.name))]),
);

function referenceResolves(name: string, packId: string | undefined): boolean {
  if (packId && name.startsWith(`--${packId}-`)) return packDeclared.get(packId)?.has(name) ?? false;
  return THEME_CONTRACT_NAMES.has(name) || name.startsWith("--tw-") || name.startsWith("--color-") || registryDeclared.has(name);
}

function walkStrings(node: any, callback: (value: string) => void): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "StringLiteral" && typeof node.value === "string") callback(node.value);
  if (node.type === "TemplateElement" && typeof node.value?.cooked === "string") callback(node.value.cooked);
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "start", "end"].includes(key)) continue;
    if (Array.isArray(value)) for (const child of value) walkStrings(child, callback);
    else walkStrings(value, callback);
  }
}

function validateVarReferences(file: string, ast: any): void {
  const packId = path.basename(path.dirname(path.resolve(file)));
  walkStrings(ast, (value) => {
    if (/shadow-\[var\(--/.test(value)) {
      failures.push(`${file}: shadow-[var(--…)] reads as a shadow COLOR under tailwind-merge; use shadow-(--…) in "${value}"`);
    }
    for (const match of value.matchAll(/var\((--[\w-]+)/g)) {
      if (!referenceResolves(match[1], packId)) failures.push(`${file}: var(${match[1]}) resolves to no declaration`);
    }
  });
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This validator reports every nested config failure in one source pass.
function validateConfig(file: string, source: string): void {
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  validateVarReferences(file, ast.program);
  for (const node of ast.program.body) {
    if (node.type !== "ExportNamedDeclaration" || node.declaration?.type !== "VariableDeclaration") continue;
    const declaration = node.declaration.declarations.find((candidate: any) => candidate.id.name === "skin");
    if (declaration?.init?.type !== "ObjectExpression") continue;
    const field = declaration.init.properties.find(
      (property) => property.type === "ObjectProperty" && propertyName(property) === "adornments",
    );
    if (field?.type !== "ObjectProperty" || field.value.type !== "ObjectExpression") continue;
    for (const scopeEntry of field.value.properties) {
      const scope = propertyName(scopeEntry);
      if (!scope || !(scope in contract.adornments)) {
        failures.push(`${file}: unknown adornments scope ${scope ?? "<dynamic>"}`);
        continue;
      }
      if (scopeEntry.type !== "ObjectProperty" || scopeEntry.value.type !== "ObjectExpression") {
        failures.push(`${file}: adornments.${scope} must be a scoped part map`);
        continue;
      }
      for (const partEntry of scopeEntry.value.properties) {
        const part = propertyName(partEntry);
        if (!part || !(part in contract.adornments[scope])) {
          failures.push(`${file}: unknown adornments hook ${scope}:${part ?? "<dynamic>"}`);
        }
      }
    }
  }
}

export function validateSkinFiles(files: readonly string[]): string[] {
  failures.length = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (file.endsWith(".css")) validateCss(path.relative(process.cwd(), file), source);
    else validateConfig(path.relative(process.cwd(), file), source);
  }
  return [...failures];
}

function packSkinFiles(): string[] {
  return readdirSync(skinRoot, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    return readdirSync(path.join(skinRoot, entry.name))
      .filter((name) => name.endsWith(".css") || name === "skin.config.tsx")
      .map((name) => path.join(skinRoot, entry.name, name));
  });
}

if (import.meta.main) {
  const supplied = process.argv.find((argument) => argument.startsWith("--skin="))?.slice("--skin=".length);
  const files = supplied ? [path.resolve(supplied)] : packSkinFiles();
  const found = validateSkinFiles(files);
  if (found.length > 0) {
    console.error(found.map((failure) => `- ${failure}`).join("\n"));
    process.exit(1);
  }
  console.log(`Validated ${files.length} skin files against skin-contract.json.`);
}
