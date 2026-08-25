/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for skin validation. */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { THEME_CONTRACT_NAMES } from "../src/registry/lib/theme-contract";
import {
  familyAttribute,
  identityAttribute,
  isAnatomyMetadataAttribute,
  skinScopeAttribute,
  slotAttribute,
  surfaceAttribute,
} from "./control-anatomy";
import { knobPrefix, knobsByFamily } from "./knob-contracts/collect";
import { type Anatomy, collectEffectUtilities, collectKnobOwnership, createAnatomyResolver, knobsPainting } from "./knob-ownership";
import { collectSkinContract } from "./skin-contract/collect";
import type { ContractPart } from "./skin-contract/model";

const controlKnobContracts = knobsByFamily();

const contract = collectSkinContract();
const knobOwnership = collectKnobOwnership(contract);
const resolveAnatomy = createAnatomyResolver(contract);
const effectUtilities = collectEffectUtilities();
const knobsByPrefix: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(controlKnobContracts)
    .sort(([left], [right]) => right.length - left.length)
    .map(([family, knobs]) => [`${knobPrefix}${family}-`, knobs]),
);
const supplied = process.argv.find((argument) => argument.startsWith("--skin="))?.slice("--skin=".length);
const skinRoot = path.join(process.cwd(), "src/registry/skin-packs");
const files = supplied
  ? [path.resolve(supplied)]
  : readdirSync(skinRoot, { withFileTypes: true }).flatMap((entry) => {
      if (!entry.isDirectory()) return [];
      return ["theme.css", "skin.css", "skin.config.tsx"].map((name) => path.join(skinRoot, entry.name, name)).filter(existsSync);
    });
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
  if (attributes.some((attribute) => ["data-ui", "data-component"].includes(attribute.attribute))) {
    failures.push(`${file}: contains a legacy data-ui or data-component selector`);
  }
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

function validateKnobs(file: string, root: postcss.Root): void {
  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line;
    validateKnobName(file, declaration.prop, line);
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
      selectorParser((selectorRoot) => {
        selectorRoot.each((selector) => validateSelectorStructure(file, rule.selector.replace(/\s+/g, " "), selector));
        validateModeScope(file, rule, [...selectorRoot.nodes]);
        validateTokenScopeWeight(file, rule, [...selectorRoot.nodes]);
      }).processSync(rule.selector);
      const anatomies = resolveAnatomy(rule.selector);
      validateLayer(file, rule, anatomies.length > 0);
      validateKnobBypass(file, rule, anatomies);
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

function declaredCustomProperties(root: string): Set<string> {
  const declared = new Set<string>();
  for (const file of filesUnder(root, [".css"])) {
    postcss.parse(readFileSync(file, "utf8"), { from: file }).walkDecls((declaration) => {
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

for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (file.endsWith(".css")) validateCss(path.relative(process.cwd(), file), source);
  else validateConfig(path.relative(process.cwd(), file), source);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Validated ${files.length} skin files against skin-contract.json.`);
