/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for anatomy scanning. */

import { parse } from "@babel/parser";
import { familyAttribute, identityAttribute, isFamilyQualifierAttribute, slotAttribute } from "./control-anatomy";

export type AnatomyPair = readonly [attribute: string, value: string];

type ReturnedJsx = { tag: string | undefined; pairs: AnatomyPair[] };
type CompositionUsage = { component: string; pairs: AnatomyPair[] };

type ScanState = {
  useRenderPairs: Map<string, AnatomyPair[]>;
  returnedJsx: Map<string, ReturnedJsx[]>;
  directStamps: AnatomyPair[][];
  composedUsages: CompositionUsage[];
};

const isIdentityAttributeName = (name: string) =>
  name === identityAttribute || name === familyAttribute || name === slotAttribute || isFamilyQualifierAttribute(name);

export const pairSetKey = (pairs: readonly AnatomyPair[]): string =>
  [...pairs]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([attribute, value]) => `[${attribute}="${value}"]`)
    .join("");

const addPairSubsets = (target: Set<string>, pairs: readonly AnatomyPair[]): void => {
  for (let mask = 1; mask < 2 ** pairs.length; mask++) target.add(pairSetKey(pairs.filter((_, index) => mask & (2 ** index))));
};

const componentNameOf = (node: any): string | undefined => {
  if (node.type === "FunctionDeclaration") return node.id?.name;
  if (
    node.type === "VariableDeclarator" &&
    node.id?.type === "Identifier" &&
    ["ArrowFunctionExpression", "FunctionExpression"].includes(node.init?.type)
  ) {
    return node.id.name;
  }
  return undefined;
};

const tagNameOf = (element: any): string | undefined => {
  const name = element?.openingElement?.name;
  return name?.type === "JSXIdentifier" ? name.name : undefined;
};

/** Uppercase JSX identifiers name components we can resolve locally; host tags and member expressions do not resolve. */
const componentTagOf = (element: any): string | undefined => {
  const tag = tagNameOf(element);
  return tag !== undefined && /^[A-Z]/.test(tag) ? tag : undefined;
};

const jsxLiteralPairs = (element: any): AnatomyPair[] =>
  (element?.openingElement?.attributes ?? []).flatMap((attribute: any) => {
    if (attribute.type !== "JSXAttribute") return [];
    if (attribute.name?.type !== "JSXIdentifier" || !isIdentityAttributeName(attribute.name.name)) return [];
    if (attribute.value?.type !== "StringLiteral") return [];
    return [[attribute.name.name, attribute.value.value] as AnatomyPair];
  });

const objectPropertyName = (property: any): string | undefined => {
  if (property.key?.type === "Identifier") return property.key.name;
  if (property.key?.type === "StringLiteral") return property.key.value;
  return undefined;
};

const objectLiteralPairs = (object: any): AnatomyPair[] =>
  (object?.properties ?? []).flatMap((property: any) => {
    const key = objectPropertyName(property);
    if (!key || !isIdentityAttributeName(key) || property.type !== "ObjectProperty" || property.value?.type !== "StringLiteral") return [];
    return [[key, property.value.value] as AnatomyPair];
  });

/** First JSXElement in a subtree — a `render` prop may hand its element over through an arrow body. */
const firstJsxElement = (node: any): any => {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === "JSXElement") return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = firstJsxElement(child);
      if (found) return found;
    }
    return undefined;
  }
  for (const child of Object.values(node)) {
    const found = firstJsxElement(child);
    if (found) return found;
  }
  return undefined;
};

const unwrapExpression = (node: any): any => {
  let current = node;
  while (current && ["ParenthesizedExpression", "TSAsExpression", "TSSatisfiesExpression", "TypeCastExpression"].includes(current.type)) {
    current = current.expression;
  }
  return current;
};

/** The JSX a `return` hands back directly — never JSX nested inside a useRender call's children. */
const topLevelJsxElement = (node: any): any => {
  const unwrapped = unwrapExpression(node);
  return unwrapped?.type === "JSXElement" ? unwrapped : undefined;
};

/** Callers spread their props after a component's internals (`{...internal} {...props}`), so earlier sources win per attribute. */
const mergePairs = (...sources: readonly AnatomyPair[][]): AnatomyPair[] => {
  const byAttribute = new Map<string, AnatomyPair>();
  for (const source of sources) {
    for (const pair of source) if (!byAttribute.has(pair[0])) byAttribute.set(pair[0], pair);
  }
  return [...byAttribute.values()];
};

const appendPairs = (map: Map<string, AnatomyPair[]>, component: string, pairs: readonly AnatomyPair[]): void => {
  if (pairs.length > 0) map.set(component, [...(map.get(component) ?? []), ...pairs]);
};

const collectUseRender = (node: any, component: string | undefined, state: ScanState): void => {
  if (!component) return;
  const props = (node.arguments?.[0]?.properties ?? []).find((property: any) => objectPropertyName(property) === "props");
  appendPairs(state.useRenderPairs, component, objectLiteralPairs(props?.value));
};

const collectReturn = (node: any, component: string | undefined, state: ScanState): void => {
  if (!component) return;
  const element = topLevelJsxElement(node.argument);
  if (!element) return;
  state.returnedJsx.set(component, [
    ...(state.returnedJsx.get(component) ?? []),
    { tag: tagNameOf(element), pairs: jsxLiteralPairs(element) },
  ]);
};

const collectObjectBundle = (node: any, _component: string | undefined, state: ScanState): void => {
  const pairs = objectLiteralPairs(node);
  if (pairs.length > 0) state.directStamps.push(pairs);
};

const collectJsxElement = (node: any, _component: string | undefined, state: ScanState): void => {
  const pairs = jsxLiteralPairs(node);
  const component = componentTagOf(node);
  if (pairs.length === 0) return;
  if (component) state.composedUsages.push({ component, pairs });
  else state.directStamps.push(pairs);
  if (!component) return;
  for (const attribute of node.openingElement?.attributes ?? []) {
    if (attribute.type !== "JSXAttribute" || attribute.name?.name !== "render") continue;
    const inner = firstJsxElement(attribute.value);
    if (!inner) continue;
    const innerPairs = jsxLiteralPairs(inner);
    if (innerPairs.length > 0) state.composedUsages.push({ component, pairs: innerPairs });
  }
};

const nodeCollectors: Record<string, (node: any, component: string | undefined, state: ScanState) => void> = {
  CallExpression: collectUseRender,
  ReturnStatement: collectReturn,
  ObjectExpression: collectObjectBundle,
  JSXElement: collectJsxElement,
};

const skippedChildKeys = new Set(["loc", "start", "end"]);

const visitNode = (node: any, component: string | undefined, state: ScanState): void => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) visitNode(child, component, state);
    return;
  }
  const nextComponent = componentNameOf(node) ?? component;
  nodeCollectors[node.type]?.(node, nextComponent, state);
  for (const [key, child] of Object.entries(node)) {
    if (skippedChildKeys.has(key)) continue;
    visitNode(child, nextComponent, state);
  }
};

/**
 * Every combination of anatomy attributes one rendered element can carry: literal JSX stamps,
 * anatomy bundles handed to `useRender` or DOM specs, and wrapper composition where a caller's
 * attributes land on a local component's own stamped element. Recipe selectors must match one
 * of these combinations or they style nothing.
 */
export function stampedAnatomyKeys(sources: readonly { source: string }[]): Set<string> {
  const state: ScanState = {
    useRenderPairs: new Map(),
    returnedJsx: new Map(),
    directStamps: [],
    composedUsages: [],
  };

  for (const { source } of sources) {
    const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
    visitNode(ast.program, undefined, state);
  }

  const localComponents = new Set([...state.useRenderPairs.keys(), ...state.returnedJsx.keys()]);
  const roots = new Map<string, AnatomyPair[]>();

  let changed = true;
  while (changed) {
    changed = false;
    for (const component of localComponents) {
      const wrapped = (state.returnedJsx.get(component) ?? []).flatMap(({ tag, pairs }) =>
        mergePairs(pairs, tag && localComponents.has(tag) ? (roots.get(tag) ?? []) : []),
      );
      const merged = mergePairs(state.useRenderPairs.get(component) ?? [], wrapped).sort(([left], [right]) => left.localeCompare(right));
      if (pairSetKey(merged) !== pairSetKey(roots.get(component) ?? [])) {
        roots.set(component, merged);
        changed = true;
      }
    }
  }

  const emitted = new Set<string>();
  for (const pairs of [...state.directStamps, ...state.useRenderPairs.values()]) addPairSubsets(emitted, pairs);
  for (const { component, pairs } of state.composedUsages) {
    addPairSubsets(emitted, mergePairs(pairs, roots.get(component) ?? []));
  }
  return emitted;
}
