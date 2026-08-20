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

function visit(node: any, callback: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  callback(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) for (const child of value) visit(child, callback);
    else visit(value, callback);
  }
}

function validatePublicPart(sourcePath: string, node: any, violations: string[]): void {
  if (node.type !== "JSXOpeningElement") return;
  const scope = literalAttribute(node.attributes, "data-control-ui");
  const part = literalAttribute(node.attributes, "data-slot");
  const control = literalAttribute(node.attributes, "data-control");
  if (!scope.present && !part.present && !control.present) return;
  const location = `${relative(registryRoot, sourcePath)}:${node.loc?.start.line ?? 0}`;
  if (!scope.present || !part.present) violations.push(`${location} must emit both data-control-ui and data-slot`);
  if (scope.dynamic || part.dynamic) violations.push(`${location} anatomy must be literal`);
  if (scope.value && part.value?.startsWith(`${scope.value}-`)) {
    violations.push(`${location} data-slot must be local to its scope`);
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
      visit(ast, (node) => validatePublicPart(path, node, violations));
    }
    expect(violations).toEqual([]);
  });

  test("adornment hooks use explicit scope and part literals", () => {
    const violations: string[] = [];
    for (const path of files.filter((candidate) => [".ts", ".tsx"].includes(extname(candidate)))) {
      const source = readFileSync(path, "utf8");
      const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
      visit(ast, (node) => {
        if (node.type !== "CallExpression" || node.callee.type !== "Identifier") return;
        if (!["skinAdornment", "hasSkinAdornment"].includes(node.callee.name)) return;
        const [scope, part] = node.arguments;
        if (scope?.type === "StringLiteral" && part?.type === "StringLiteral") return;
        violations.push(`${relative(registryRoot, path)}:${node.loc?.start.line ?? 0} ${node.callee.name} needs literal scope and part`);
      });
    }
    expect(violations).toEqual([]);
  });
});
