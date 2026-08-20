/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for skin validation. */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { controlKnobContracts } from "../src/registry/knob-contracts";
import { THEME_CONTRACT_NAMES } from "../src/registry/lib/theme-contract";
import { collectSkinContract } from "./skin-contract/collect";

const contract = collectSkinContract();
const knobsByPrefix: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(controlKnobContracts)
    .sort(([left], [right]) => right.length - left.length)
    .map(([family, knobs]) => [`--${family}-`, knobs]),
);
const supplied = process.argv.find((argument) => argument.startsWith("--skin="))?.slice("--skin=".length);
const skinRoot = path.join(process.cwd(), "src/registry/skin-packs");
const files = supplied
  ? [path.resolve(supplied)]
  : readdirSync(skinRoot, { withFileTypes: true }).flatMap((entry) => {
      if (!entry.isDirectory()) return [];
      return ["skin.css", "skin.config.tsx"].map((name) => path.join(skinRoot, entry.name, name)).filter(existsSync);
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

function validateState(file: string, scope: string, part: string, attribute: any): void {
  if (anatomyMetadataAttributes.has(attribute.attribute)) return;
  const state = contract.scopes[scope]?.parts[part]?.states.find((entry) => entry.attribute === attribute.attribute);
  if (!state) {
    failures.push(`${file}: unsupported state ${scope}:${part} ${attribute.attribute}`);
    return;
  }
  const value = attributeValue(attribute);
  if (value && state.valueKind === "enum" && !state.values.includes(value)) {
    failures.push(`${file}: unsupported state value ${scope}:${part} ${attribute.attribute}=${value}`);
  }
}

const anatomyMetadataAttributes = new Set(["data-control-ui", "data-slot", "data-control", "data-surface", "data-skin", "data-effects"]);
const bareHostTags = new Set(["a", "button", "input", "select", "textarea"]);

function selectorAttributes(selector: any): any[] {
  const allAttributes: any[] = [];
  selector.walkAttributes((attribute: any) => allAttributes.push(attribute));
  return allAttributes;
}

function validateSelectorOwnership(file: string, selectorText: string, attributes: any[]): boolean {
  const hasSkin = attributes.some((attribute) => attribute.attribute === "data-skin");
  const hasControlUi = attributes.some((attribute) => attribute.attribute === "data-control-ui");
  if (attributes.some((attribute) => ["data-ui", "data-component"].includes(attribute.attribute))) {
    failures.push(`${file}: contains a legacy data-ui or data-component selector`);
  }
  if (hasControlUi && !hasSkin) {
    failures.push(`${file}: Control UI selector is not scoped by data-skin: ${selectorText}`);
  }
  return hasSkin;
}

function validateBareHost(file: string, selectorText: string, compound: any[], hasSkin: boolean, attributes: any[]): void {
  if (!hasSkin || attributes.some((attribute) => attribute.attribute === "data-control-ui")) return;
  if (compound.some((node) => node.type === "tag" && bareHostTags.has(node.value.toLowerCase()))) {
    failures.push(`${file}: bare host selector is not anatomy-safe: ${selectorText}`);
  }
}

function validateCompound(file: string, selectorText: string, compound: any[], hasSkin: boolean): void {
  const attributes = attributesIn(compound);
  const scopeAttribute = attributes.find((attribute) => attribute.attribute === "data-control-ui");
  const partAttribute = attributes.find((attribute) => attribute.attribute === "data-slot");
  const surfaceAttribute = attributes.find((attribute) => attribute.attribute === "data-surface");
  const scope = attributeValue(scopeAttribute);
  const part = attributeValue(partAttribute);

  if (partAttribute && !scopeAttribute) failures.push(`${file}: anatomy part is missing data-control-ui: ${selectorText}`);
  if (surfaceAttribute && (!scopeAttribute || !partAttribute)) {
    failures.push(`${file}: semantic selector is not Control UI scoped: ${selectorText}`);
  }
  if (scope && !(scope in contract.scopes)) failures.push(`${file}: unknown scope ${scope}`);
  if (scope && part && contract.scopes[scope] && !contract.scopes[scope].parts[part]) {
    failures.push(`${file}: unknown part ${scope}:${part}`);
  }
  if (scope && part && contract.scopes[scope]?.parts[part]) {
    for (const attribute of attributes) validateState(file, scope, part, attribute);
  }
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

function validateCss(file: string, source: string): void {
  try {
    const root = postcss.parse(source, { from: file });
    root.walkRules((rule) => {
      selectorParser((selectorRoot) => {
        selectorRoot.each((selector) => validateSelectorStructure(file, rule.selector.replace(/\s+/g, " "), selector));
      }).processSync(rule.selector);
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
