/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for skin validation. */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { collectSkinContract } from "./skin-contract/collect";

const contract = collectSkinContract();
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

function validateCss(file: string, source: string): void {
  try {
    postcss.parse(source, { from: file }).walkRules((rule) => {
      selectorParser((root) => {
        root.each((selector) => validateSelectorStructure(file, rule.selector.replace(/\s+/g, " "), selector));
      }).processSync(rule.selector);
    });
  } catch (error) {
    failures.push(`${file}: invalid CSS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function propertyName(node: any): string | undefined {
  if (node?.key?.type === "StringLiteral") return node.key.value;
  if (node?.key?.type === "Identifier") return node.key.name;
  return undefined;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This validator reports every nested config failure in one source pass.
function validateConfig(file: string, source: string): void {
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  for (const node of ast.program.body) {
    if (node.type !== "ExportNamedDeclaration" || node.declaration?.type !== "VariableDeclaration") continue;
    const declaration = node.declaration.declarations.find((candidate: any) => candidate.id.name === "skin");
    if (declaration?.init?.type !== "ObjectExpression") continue;
    for (const fieldName of ["slots", "paints", "adornments"] as const) {
      const field = declaration.init.properties.find(
        (property) => property.type === "ObjectProperty" && propertyName(property) === fieldName,
      );
      if (field?.type !== "ObjectProperty" || field.value.type !== "ObjectExpression") continue;
      const allowed = fieldName === "slots" ? contract.scopes : contract[fieldName];
      for (const scopeEntry of field.value.properties) {
        const scope = propertyName(scopeEntry);
        if (!scope || !(scope in allowed)) {
          failures.push(`${file}: unknown ${fieldName} scope ${scope ?? "<dynamic>"}`);
          continue;
        }
        if (scopeEntry.type !== "ObjectProperty" || scopeEntry.value.type !== "ObjectExpression") {
          failures.push(`${file}: ${fieldName}.${scope} must be a scoped part map`);
          continue;
        }
        for (const partEntry of scopeEntry.value.properties) {
          const part = propertyName(partEntry);
          const allowedParts = fieldName === "slots" ? contract.scopes[scope].parts : contract[fieldName][scope];
          if (!part || !(part in allowedParts)) failures.push(`${file}: unknown ${fieldName} hook ${scope}:${part ?? "<dynamic>"}`);
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
