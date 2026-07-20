/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for this generator. */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import { THEME_CONTRACT } from "../../src/registry/lib/theme-contract";
import { createRegistryItems } from "../registry-model";
import type { AnatomyReference, ContractPart, ContractState, SkinContract, ThemeContractArtifact } from "./model";

const appRoot = process.cwd();
const registryRoot = path.join(appRoot, "src/registry");
const anatomyMetadataAttributes: Record<string, true> = {
  "data-control-ui": true,
  "data-slot": true,
  "data-control": true,
  "data-surface": true,
  "data-popup-part": true,
  "data-skin": true,
  "data-effects": true,
};

type MutablePart = Omit<ContractPart, "registryItems"> & {
  controls: boolean;
  registryItems: Set<string>;
  surfaces: Set<"floating" | "modal" | "panel">;
  popupParts: Set<string>;
};

type BaseUiImport = { importedName: string; modulePath: string };

function filesUnder(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const candidate = path.join(directory, entry);
      return statSync(candidate).isDirectory() ? filesUnder(candidate) : [candidate];
    })
    .filter((candidate) => candidate.endsWith(".tsx") && !candidate.endsWith(".test.tsx"));
}

function visit(node: any, callback: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  callback(node);
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "start", "end"].includes(key)) continue;
    if (Array.isArray(value)) for (const child of value) visit(child, callback);
    else visit(value, callback);
  }
}

function jsxAttribute(attributes: any[], name: string): any | undefined {
  return attributes.find((attribute) => attribute.type === "JSXAttribute" && attribute.name.name === name);
}

function literalAttribute(attributes: any[], name: string): string | undefined {
  const attribute = jsxAttribute(attributes, name);
  return attribute?.value?.type === "StringLiteral" ? attribute.value.value : undefined;
}

function semanticSurfaceAttribute(attributes: any[]): string | undefined {
  const attribute = jsxAttribute(attributes, "data-surface");
  const expression = attribute?.value?.type === "JSXExpressionContainer" ? attribute.value.expression : attribute?.value;
  const staticValues = staticStateValues(expression);
  return staticValues.known ? staticValues.values.find((value) => ["floating", "modal", "panel"].includes(value)) : undefined;
}

function objectProperty(object: any, name: string): any | undefined {
  return object.properties.find((property: any) => {
    if (property.type !== "ObjectProperty") return false;
    return (property.key.type === "StringLiteral" ? property.key.value : property.key.name) === name;
  });
}

function literalObjectProperty(object: any, name: string): string | undefined {
  const property = objectProperty(object, name);
  return property?.value?.type === "StringLiteral" ? property.value.value : undefined;
}

function staticStateValues(node: any): { known: boolean; values: string[] } {
  if (!node) return { known: true, values: ["true"] };
  if (node.type === "StringLiteral" || node.type === "NumericLiteral" || node.type === "BooleanLiteral") {
    return { known: true, values: [String(node.value)] };
  }
  if (node.type === "Identifier" && node.name === "undefined") return { known: true, values: [] };
  if (node.type === "ConditionalExpression") {
    const consequent = staticStateValues(node.consequent);
    const alternate = staticStateValues(node.alternate);
    return { known: consequent.known && alternate.known, values: [...consequent.values, ...alternate.values] };
  }
  if (
    ["JSXExpressionContainer", "TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "ParenthesizedExpression"].includes(
      node.type,
    )
  ) {
    return staticStateValues(node.expression);
  }
  return { known: false, values: [] };
}

function contractState(attribute: string, source: ContractState["source"], values: string[]): ContractState {
  const uniqueValues = [...new Set(values)].filter((value) => value !== "" && value !== "undefined").sort();
  const presence = uniqueValues.length === 0 || (uniqueValues.length === 1 && uniqueValues[0] === "true");
  return {
    attribute,
    source,
    valueKind: presence ? "presence" : "enum",
    values: presence ? [] : uniqueValues,
  };
}

const externalStateAdditions: Record<string, ContractState[]> = {
  "tabs:tab": [{ attribute: "aria-selected", source: "external", valueKind: "enum", values: ["false", "true"] }],
  "command:item": [
    contractState("data-disabled", "external", []),
    { attribute: "data-selected", source: "external", valueKind: "enum", values: ["false", "true"] },
  ],
  "resizable:handle": [
    { attribute: "data-separator", source: "external", valueKind: "enum", values: ["active", "disabled", "focus", "hover"] },
  ],
};

function jsxElementName(name: any): string {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression") return `${jsxElementName(name.object)}.${jsxElementName(name.property)}`;
  return "";
}

function stateFromAttribute(attribute: any): ContractState | undefined {
  const name = attribute.name.name;
  if (typeof name !== "string" || !name.startsWith("data-")) return undefined;
  if (anatomyMetadataAttributes[name]) return undefined;
  const expression = attribute.value?.type === "JSXExpressionContainer" ? attribute.value.expression : attribute.value;
  const staticValues = staticStateValues(expression);
  return staticValues.known
    ? contractState(name, "control-ui", staticValues.values)
    : { attribute: name, source: "control-ui", valueKind: "open", values: [] };
}

function stateFromObjectProperty(property: any): ContractState | undefined {
  if (property.type !== "ObjectProperty") return undefined;
  const name = propertyName(property);
  if (!name.startsWith("data-") || anatomyMetadataAttributes[name]) return undefined;
  const staticValues = staticStateValues(property.value);
  return staticValues.known
    ? contractState(name, "control-ui", staticValues.values)
    : { attribute: name, source: "control-ui", valueKind: "open", values: [] };
}

function baseUiImports(ast: any): Map<string, BaseUiImport> {
  const imports = new Map<string, BaseUiImport>();
  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration" || !statement.source.value.startsWith("@base-ui/react/")) continue;
    const modulePath = statement.source.value.slice("@base-ui/react/".length);
    for (const specifier of statement.specifiers) {
      if (specifier.type !== "ImportSpecifier") continue;
      const importedName = specifier.imported.type === "StringLiteral" ? specifier.imported.value : specifier.imported.name;
      imports.set(specifier.local.name, { importedName, modulePath });
    }
  }
  return imports;
}

function exportedComponent(modulePath: string, exportedName: string, parts: boolean): { name: string; source: string } | undefined {
  const moduleRoot = path.join(appRoot, "node_modules", "@base-ui", "react", modulePath);
  const indexPath = path.join(moduleRoot, parts ? "index.parts.d.ts" : "index.d.ts");
  if (!existsSync(indexPath)) return undefined;
  const indexSource = readFileSync(indexPath, "utf8");
  for (const match of indexSource.matchAll(
    /export\s+\{\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?\s*\}\s+from\s+["']([^"']+)["']/g,
  )) {
    const publicName = match[2] ?? match[1];
    if (publicName !== exportedName) continue;
    return { name: match[1], source: path.resolve(moduleRoot, match[3].replace(/\.js$/, ".d.ts")) };
  }
  return undefined;
}

const externalStateCache = new Map<string, ContractState[]>();

function externalStatesFromDeclarations(component: { name: string; source: string }): ContractState[] {
  const declarationPath = path.join(path.dirname(component.source), `${component.name}DataAttributes.d.ts`);
  const cached = externalStateCache.get(declarationPath);
  if (cached) return cached;
  if (!existsSync(declarationPath)) return [];
  const source = readFileSync(declarationPath, "utf8");
  const states = [...source.matchAll(/\/\*\*([\s\S]*?)\*\/\s*[A-Za-z_$][\w$]*\s*=\s*["'](data-[^"']+)["']/g)].map((match) => {
    const documentedType = match[1].match(/@type\s+\{([^}]+)\}/)?.[1];
    const values = documentedType ? [...documentedType.matchAll(/["']([^"']+)["']/g)].map((value) => value[1]).sort() : [];
    return {
      attribute: match[2],
      source: "external" as const,
      valueKind: values.length > 0 ? ("enum" as const) : ("presence" as const),
      values,
    };
  });
  externalStateCache.set(declarationPath, states);
  return states;
}

function baseUiExternalStates(name: any, imports: Map<string, BaseUiImport>): ContractState[] {
  const elementName = jsxElementName(name);
  const [root, member] = elementName.split(".");
  const binding = imports.get(root);
  if (!binding) return [];
  const component = exportedComponent(binding.modulePath, member ?? binding.importedName, Boolean(member));
  return component ? externalStatesFromDeclarations(component) : [];
}

function sourceOwners(): Map<string, string[]> {
  const owners = new Map<string, string[]>();
  for (const item of createRegistryItems()) {
    for (const file of item.files) {
      const current = owners.get(file.path) ?? [];
      current.push(item.name);
      owners.set(file.path, current);
    }
  }
  return owners;
}

function propertyName(member: any): string {
  return member.key.type === "StringLiteral" ? member.key.value : member.key.name;
}

function contextFields(source: string, literal: any): Record<string, string> {
  if (literal.type !== "TSTypeLiteral") return {};
  return Object.fromEntries(
    literal.members
      .filter((member: any) => member.type === "TSPropertySignature" && member.typeAnnotation)
      .map((member: any) => [
        propertyName(member),
        source.slice(member.typeAnnotation.typeAnnotation.start, member.typeAnnotation.typeAnnotation.end),
      ]),
  );
}

function nestedContextType(typeName: string): Record<string, Record<string, Record<string, string>>> {
  const source = readFileSync(path.join(registryRoot, "skin.ts"), "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript"] });
  let result: Record<string, Record<string, Record<string, string>>> = {};
  visit(ast, (node) => {
    if (node.type !== "TSTypeAliasDeclaration" || node.id.name !== typeName || node.typeAnnotation.type !== "TSTypeLiteral") return;
    result = Object.fromEntries(
      node.typeAnnotation.members.map((scope: any) => {
        const scopeType = scope.typeAnnotation.typeAnnotation;
        const parts =
          scopeType.type === "TSTypeLiteral"
            ? Object.fromEntries(
                scopeType.members.map((part: any) => [propertyName(part), contextFields(source, part.typeAnnotation.typeAnnotation)]),
              )
            : {};
        return [propertyName(scope), parts];
      }),
    );
  });
  return result;
}

function sortRecord<Value>(record: Record<string, Value>, rootFirst = false): Record<string, Value> {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => {
      if (rootFirst && left === "root") return -1;
      if (rootFirst && right === "root") return 1;
      return left.localeCompare(right);
    }),
  );
}

function typeAliases(): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const file of [path.join(registryRoot, "skin.ts"), path.join(registryRoot, "contracts.ts")]) {
    const source = readFileSync(file, "utf8");
    const ast = parse(source, { sourceType: "module", plugins: ["typescript"] });
    visit(ast, (node) => {
      if (node.type !== "TSTypeAliasDeclaration") return;
      aliases.set(node.id.name, source.slice(node.typeAnnotation.start, node.typeAnnotation.end));
    });
  }
  return aliases;
}

function stateShapeFromType(
  type: string,
  aliases: Map<string, string>,
  seen = new Set<string>(),
): Pick<ContractState, "valueKind" | "values"> {
  const normalized = type.trim();
  if (normalized === "true") return { valueKind: "presence", values: [] };
  if (normalized === "boolean") return { valueKind: "enum", values: ["false", "true"] };
  const unionValues = [...normalized.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
  if (unionValues.length > 0) return { valueKind: "enum", values: [...new Set(unionValues)].sort() };
  if (/^[A-Za-z_$][\w$]*$/.test(normalized) && !seen.has(normalized)) {
    const alias = aliases.get(normalized);
    if (alias) return stateShapeFromType(alias, aliases, new Set([...seen, normalized]));
  }
  return { valueKind: "open", values: [] };
}

function emittedStateTypes(aliases: Map<string, string>): Map<string, Pick<ContractState, "valueKind" | "values">> {
  const file = path.join(import.meta.dir, "emitted-states.ts");
  const source = readFileSync(file, "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["typescript"] });
  const result = new Map<string, Pick<ContractState, "valueKind" | "values">>();
  visit(ast, (node) => {
    if (node.type !== "TSTypeAliasDeclaration" || node.id.name !== "EmittedStateContract" || node.typeAnnotation.type !== "TSTypeLiteral") {
      return;
    }
    for (const member of node.typeAnnotation.members) {
      if (member.type !== "TSPropertySignature" || member.key.type !== "StringLiteral" || !member.typeAnnotation) continue;
      result.set(
        member.key.value,
        stateShapeFromType(source.slice(member.typeAnnotation.typeAnnotation.start, member.typeAnnotation.typeAnnotation.end), aliases),
      );
    }
  });
  return result;
}

function mergeContractState(states: ContractState[], state: ContractState): void {
  const existing = states.find((candidate) => candidate.attribute === state.attribute);
  if (!existing) {
    states.push(state);
    return;
  }
  if (state.source === "control-ui") existing.source = "control-ui";
  existing.values = [...new Set([...existing.values, ...state.values])].sort();
  if (existing.values.length > 0) existing.valueKind = "enum";
  else if (state.valueKind !== "open") existing.valueKind = state.valueKind;
}

function mergePart(current: MutablePart, states: ContractState[], control: boolean, surface?: string, popupPart?: string): MutablePart {
  current.controls ||= control;
  if (surface === "floating" || surface === "modal" || surface === "panel") current.surfaces.add(surface);
  if (popupPart) current.popupParts.add(popupPart);
  for (const state of states) mergeContractState(current.states, state);
  return current;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: One deterministic pass joins AST anatomy, typed hooks, ownership, and semantic families.
export function collectSkinContract(): SkinContract {
  const parts = new Map<string, MutablePart>();
  const ownership = sourceOwners();
  const aliases = typeAliases();
  const emittedStates = emittedStateTypes(aliases);
  const popupParts = new Set(stateShapeFromType("SkinPopupPart", aliases).values);
  const registryItemMapping = new Map<string, Set<string>>();
  const files = [
    ...filesUnder(path.join(registryRoot, "sources", "control-ui")),
    ...filesUnder(path.join(registryRoot, "blocks", "control-ui")),
  ];

  const recordPart = (
    scope: string,
    part: string,
    sourceFile: string,
    states: ContractState[],
    control: boolean,
    surface?: string,
    popupPart?: string,
  ) => {
    const key = `${scope}:${part}`;
    const current = mergePart(
      parts.get(key) ?? { states: [], controls: false, registryItems: new Set(), surfaces: new Set(), popupParts: new Set() },
      states,
      control,
      surface,
      popupPart,
    );
    const relativeSource = path.relative(appRoot, sourceFile);
    const owners = registryItemMapping.get(scope) ?? new Set<string>();
    for (const owner of ownership.get(relativeSource) ?? [scope]) {
      current.registryItems.add(owner);
      owners.add(owner);
    }
    parts.set(key, current);
    registryItemMapping.set(scope, owners);
  };

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
    const baseUi = baseUiImports(ast);
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The visitor classifies the two supported literal anatomy shapes in one pass.
    visit(ast, (node) => {
      if (node.type === "JSXOpeningElement") {
        const scope = literalAttribute(node.attributes, "data-control-ui");
        const part = literalAttribute(node.attributes, "data-slot");
        const popupPart = literalAttribute(node.attributes, "data-popup-part");
        if (scope && part) {
          if (popupPart && !popupParts.has(popupPart)) {
            throw new Error(`${scope}:${part} emits unknown popup family part "${popupPart}"`);
          }
          recordPart(
            scope,
            part,
            file,
            [
              ...node.attributes.flatMap((attribute: any) =>
                attribute.type === "JSXAttribute" ? [stateFromAttribute(attribute)].filter(Boolean) : [],
              ),
              ...baseUiExternalStates(node.name, baseUi),
              ...(externalStateAdditions[`${scope}:${part}`] ?? []),
            ],
            Boolean(jsxAttribute(node.attributes, "data-control")),
            semanticSurfaceAttribute(node.attributes),
            popupPart,
          );
        }
      }
      if (node.type === "ObjectExpression") {
        const scope = literalObjectProperty(node, "data-control-ui");
        const part = literalObjectProperty(node, "data-slot");
        const popupPart = literalObjectProperty(node, "data-popup-part");
        if (scope && part) {
          if (popupPart && !popupParts.has(popupPart)) {
            throw new Error(`${scope}:${part} emits unknown popup family part "${popupPart}"`);
          }
          recordPart(
            scope,
            part,
            file,
            node.properties.flatMap((property: any) => [stateFromObjectProperty(property)].filter(Boolean)),
            Boolean(objectProperty(node, "data-control")),
            literalObjectProperty(node, "data-surface"),
            popupPart,
          );
        }
      }
    });
  }

  const slotContexts = nestedContextType("SkinSlotContexts");
  for (const [scope, scopeParts] of Object.entries(slotContexts)) {
    for (const [part, context] of Object.entries(scopeParts)) {
      const key = `${scope}:${part}`;
      const current = parts.get(key) ?? {
        states: [],
        controls: false,
        registryItems: new Set(),
        surfaces: new Set(),
        popupParts: new Set(),
      };
      current.context = context;
      parts.set(key, current);
    }
  }

  const unusedEmittedStates = new Set(emittedStates.keys());
  const undeclaredOpenStates: string[] = [];
  for (const [partKey, part] of parts) {
    for (const state of part.states) {
      if (state.source !== "control-ui") continue;
      const stateKey = `${partKey}:${state.attribute}`;
      const shape = emittedStates.get(stateKey);
      if (!shape) {
        if (state.valueKind === "open") undeclaredOpenStates.push(stateKey);
        continue;
      }
      state.valueKind = shape.valueKind;
      state.values = shape.values;
      unusedEmittedStates.delete(stateKey);
    }
  }
  if (undeclaredOpenStates.length > 0 || unusedEmittedStates.size > 0) {
    const failures = [
      ...undeclaredOpenStates.sort().map((key) => `${key} needs an EmittedStateContract entry`),
      ...[...unusedEmittedStates].sort().map((key) => `${key} is declared but never emitted`),
    ];
    throw new Error(failures.join("\n"));
  }

  const scopes: SkinContract["scopes"] = {};
  for (const [key, value] of parts) {
    const separator = key.indexOf(":");
    const scope = key.slice(0, separator);
    const part = key.slice(separator + 1);
    const scopeContract = scopes[scope] ?? { parts: {}, registryItems: [...(registryItemMapping.get(scope) ?? [scope])].sort() };
    scopeContract.parts[part] = {
      ...(value.context && Object.keys(value.context).length > 0 ? { context: sortRecord(value.context) } : {}),
      registryItems: [...value.registryItems].sort(),
      states: value.states.sort((left, right) => left.attribute.localeCompare(right.attribute)),
    };
    scopes[scope] = scopeContract;
  }
  for (const scope of Object.values(scopes)) scope.parts = sortRecord(scope.parts, true);

  const controls: AnatomyReference[] = [];
  const surfaces = { floating: [] as AnatomyReference[], modal: [] as AnatomyReference[], panel: [] as AnatomyReference[] };
  const popup = Object.fromEntries([...popupParts].map((part) => [part, [] as AnatomyReference[]]));
  for (const [key, value] of parts) {
    const [scope, part] = key.split(":");
    if (value.controls) controls.push({ scope, part });
    for (const surface of value.surfaces) surfaces[surface].push({ scope, part });
    for (const popupPart of value.popupParts) popup[popupPart].push({ scope, part });
  }
  const sortReferences = (references: AnatomyReference[]) =>
    references.sort((left, right) => `${left.scope}:${left.part}`.localeCompare(`${right.scope}:${right.part}`));

  const contextHooks = (name: string) =>
    sortRecord(
      Object.fromEntries(
        Object.entries(nestedContextType(name)).map(([scope, scopeParts]) => [
          scope,
          sortRecord(Object.fromEntries(Object.entries(scopeParts).map(([part, context]) => [part, { context: sortRecord(context) }]))),
        ]),
      ),
    );

  return {
    version: 5,
    selectorPattern: '[data-skin="{skin}"] :where([data-control-ui="{scope}"][data-slot="{part}"])',
    registryItemMapping: sortRecord(Object.fromEntries([...registryItemMapping].map(([scope, items]) => [scope, [...items].sort()]))),
    scopes: sortRecord(scopes),
    paints: contextHooks("SkinPaintContexts"),
    adornments: contextHooks("SkinAdornmentContexts"),
    semanticFamilies: {
      popup: sortRecord(Object.fromEntries(Object.entries(popup).map(([part, references]) => [part, sortReferences(references)]))),
      controls: sortReferences(controls),
      surfaces: {
        floating: sortReferences(surfaces.floating),
        modal: sortReferences(surfaces.modal),
        panel: sortReferences(surfaces.panel),
      },
    },
    externalStateAttributes: [
      ...new Set(
        [...parts.values()].flatMap((part) => part.states.filter((state) => state.source === "external").map((state) => state.attribute)),
      ),
    ].sort(),
  };
}

export function collectThemeContract(): ThemeContractArtifact {
  return { version: 1, tokens: THEME_CONTRACT.map((token) => ({ ...token })) };
}
