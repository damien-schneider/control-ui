/* biome-ignore-all lint/suspicious/noExplicitAny: Babel parser nodes are the dynamic input boundary for contract tests. */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { parse } from "@babel/parser";

const registryRoot = join(import.meta.dir);
const canonicalRoots = [
  join(registryRoot, "sources"),
  join(registryRoot, "blocks"),
  join(registryRoot, "examples"),
  join(registryRoot, "skin-packs"),
];

function filesUnder(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory() ? filesUnder(path) : [path];
    })
    .filter((path) => [".css", ".ts", ".tsx"].includes(extname(path)) && !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"));
}

function literalAttribute(attributes: any[], name: string): { present: boolean; value?: string; dynamic?: boolean } {
  const attribute = attributes.find((candidate) => candidate.type === "JSXAttribute" && candidate.name.name === name);
  if (!attribute) return { present: false };
  if (attribute.value?.type === "StringLiteral") return { present: true, value: attribute.value.value };
  return { present: true, dynamic: true };
}

function literalObjectProperty(node: any, name: string): string | undefined {
  const property = node.properties.find((candidate: any) => {
    if (candidate.type !== "ObjectProperty") return false;
    return (candidate.key.type === "StringLiteral" ? candidate.key.value : candidate.key.name) === name;
  });
  return property?.value?.type === "StringLiteral" ? property.value.value : undefined;
}

function visit(node: any, callback: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  callback(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) for (const child of value) visit(child, callback);
    else visit(value, callback);
  }
}

function skinSlotCalls(node: any): Array<{ scope?: string; part?: string }> {
  const calls: Array<{ scope?: string; part?: string }> = [];
  visit(node, (candidate) => {
    if (candidate.type !== "CallExpression" || candidate.callee.type !== "Identifier" || candidate.callee.name !== "skinSlot") return;
    const [scope, part] = candidate.arguments;
    calls.push({
      scope: scope?.type === "StringLiteral" ? scope.value : undefined,
      part: part?.type === "StringLiteral" ? part.value : undefined,
    });
  });
  return calls;
}

function objectProperty(node: any, name: string): any | undefined {
  return node.properties.find((candidate: any) => {
    if (candidate.type !== "ObjectProperty") return false;
    return (candidate.key.type === "StringLiteral" ? candidate.key.value : candidate.key.name) === name;
  });
}

function skinSlotMismatch(
  sourcePath: string,
  node: any,
  emittedScope: string | undefined,
  emittedPart: string | undefined,
  calls: Array<{ scope?: string; part?: string }>,
): string {
  const location = `${relative(registryRoot, sourcePath)}:${node.loc?.start.line ?? 0}`;
  const styledParts = calls.map((call) => `${call.scope}:${call.part}`).join(", ");
  return `${location} emits ${emittedScope ?? "<none>"}:${emittedPart ?? "<none>"} but styles ${styledParts}`;
}

function validateJsxSkinSlot(sourcePath: string, node: any, violations: string[]): void {
  if (node.type !== "JSXOpeningElement") return;
  const className = node.attributes.find((attribute: any) => attribute.type === "JSXAttribute" && attribute.name.name === "className");
  const calls = skinSlotCalls(className?.value);
  if (calls.length === 0) return;
  const emittedScope = literalAttribute(node.attributes, "data-control-ui").value;
  const emittedPart = literalAttribute(node.attributes, "data-slot").value;
  const matches = calls.some((call) => call.scope === emittedScope && call.part === emittedPart);
  if (!matches) {
    violations.push(skinSlotMismatch(sourcePath, node, emittedScope, emittedPart, calls));
  }
}

function validateObjectSkinSlot(sourcePath: string, node: any, violations: string[]): void {
  if (node.type !== "ObjectExpression") return;
  const calls = skinSlotCalls(objectProperty(node, "className")?.value);
  if (calls.length === 0) return;
  const emittedScope = literalObjectProperty(node, "data-control-ui");
  const emittedPart = literalObjectProperty(node, "data-slot");
  if (!calls.some((call) => call.scope === emittedScope && call.part === emittedPart)) {
    violations.push(skinSlotMismatch(sourcePath, node, emittedScope, emittedPart, calls));
  }
}

describe("Control UI anatomy contract", () => {
  const files = canonicalRoots.flatMap(filesUnder);

  test("contains no legacy anatomy selectors or attributes", () => {
    const violations = files.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return /data-(?:ui|component)(?:=|\b)/.test(source) ? [relative(registryRoot, path)] : [];
    });
    expect(violations).toEqual([]);
  });

  test("Control UI booleans render true or stay omitted", () => {
    const violations = files.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return /data-[a-z-]+=\{[^\n]*\?\s*["']true["']\s*:\s*["']false["']/.test(source) ? [relative(registryRoot, path)] : [];
    });
    expect(violations).toEqual([]);
  });

  test("every rendered public part has one literal scope and local part", () => {
    const violations: string[] = [];
    for (const path of files.filter((candidate) => [".ts", ".tsx"].includes(extname(candidate)))) {
      const source = readFileSync(path, "utf8");
      const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The assertion reports all invalid literal anatomy combinations from one traversal.
      visit(ast, (node) => {
        if (node.type !== "JSXOpeningElement") return;
        const scope = literalAttribute(node.attributes, "data-control-ui");
        const part = literalAttribute(node.attributes, "data-slot");
        const control = literalAttribute(node.attributes, "data-control");
        if (!scope.present && !part.present && !control.present) return;
        const location = `${relative(registryRoot, path)}:${node.loc?.start.line ?? 0}`;
        if (!scope.present || !part.present) violations.push(`${location} must emit both data-control-ui and data-slot`);
        if (scope.dynamic || part.dynamic) violations.push(`${location} anatomy must be literal`);
        if (scope.value && part.value?.startsWith(`${scope.value}-`)) violations.push(`${location} data-slot must be local to its scope`);
      });
    }
    expect(violations).toEqual([]);
  });

  test("skin hooks use explicit scope and part literals", () => {
    const violations: string[] = [];
    const renderedParts = new Set<string>();
    const slotHooks = new Set<string>();
    for (const path of files.filter((candidate) => [".ts", ".tsx"].includes(extname(candidate)))) {
      const source = readFileSync(path, "utf8");
      const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: The assertion cross-checks JSX and object anatomy hooks in one traversal.
      visit(ast, (node) => {
        if (node.type === "JSXOpeningElement") {
          const scope = literalAttribute(node.attributes, "data-control-ui").value;
          const part = literalAttribute(node.attributes, "data-slot").value;
          if (scope && part) renderedParts.add(`${scope}:${part}`);
        }
        if (node.type === "ObjectExpression") {
          const scope = literalObjectProperty(node, "data-control-ui");
          const part = literalObjectProperty(node, "data-slot");
          if (scope && part) renderedParts.add(`${scope}:${part}`);
        }
        if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
        if (!["skinSlot", "skinPaint", "skinAdornment", "hasSkinAdornment"].includes(node.callee.name)) return;
        const [scope, part] = node.arguments;
        const location = `${relative(registryRoot, path)}:${node.loc?.start.line ?? 0}`;
        if (scope?.type !== "StringLiteral" || part?.type !== "StringLiteral")
          violations.push(`${location} ${node.callee.name} needs literal scope and part`);
        if (node.callee.name === "skinSlot" && scope?.type === "StringLiteral" && part?.type === "StringLiteral") {
          slotHooks.add(`${scope.value}:${part.value}`);
        }
      });
    }
    for (const hook of slotHooks) if (!renderedParts.has(hook)) violations.push(`${hook} is a skin slot without rendered anatomy`);
    expect(violations).toEqual([]);
  });

  test("skin slots style the element that emits their anatomy", () => {
    const violations: string[] = [];
    for (const path of files.filter((candidate) => [".ts", ".tsx"].includes(extname(candidate)))) {
      const source = readFileSync(path, "utf8");
      const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
      visit(ast, (node) => {
        validateJsxSkinSlot(path, node, violations);
        validateObjectSkinSlot(path, node, violations);
      });
    }
    expect(violations).toEqual([]);
  });
});
