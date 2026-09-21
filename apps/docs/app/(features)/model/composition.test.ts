import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parse } from "@babel/parser";
import { blockEntries } from "../catalog/blocks";
import { componentEntries } from "../catalog/components";
import { catalogCompositions } from "../catalog/compositions";
import type { CompositionNode } from "../catalog/compositions/types";
import { primitiveEntries } from "../catalog/primitives";

const docsRoot = resolve(import.meta.dir, "../../..");
const composedEntries = [
  ...componentEntries.map((entry) => ({
    id: entry.id,
    source: entry.paths.source.path,
    support: (entry.paths.supportFiles ?? []).map((file) => file.path),
  })),
  ...primitiveEntries.map((entry) => ({
    id: entry.id,
    source: entry.paths.registry.source.path,
    support: ("supportFiles" in entry.paths.registry ? entry.paths.registry.supportFiles : []).map((file) => file.path),
  })),
  ...blockEntries.map((entry) => ({
    id: entry.id,
    source: entry.paths.files[0].path,
    support: entry.paths.files.slice(1).map((file) => file.path),
  })),
];

function exportedParts(sourcePath: string): string[] {
  if (!sourcePath.endsWith(".tsx")) return [];
  const source = readFileSync(resolve(docsRoot, sourcePath), "utf8");
  const module = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });

  return module.program.body.flatMap((statement) => {
    if (statement.type !== "ExportNamedDeclaration" || statement.exportKind === "type") return [];
    const declaration = statement.declaration;
    if (declaration?.type === "FunctionDeclaration") {
      return declaration.id && /^[A-Z]/.test(declaration.id.name) ? [declaration.id.name] : [];
    }
    if (declaration?.type === "VariableDeclaration") {
      return declaration.declarations.flatMap(({ id, init }) => {
        if (id.type !== "Identifier" || !/^[A-Z]/.test(id.name) || init?.type !== "CallExpression") return [];
        const callee = init.callee;
        const isCompoundComponent =
          callee.type === "MemberExpression" && callee.object.type === "Identifier" && callee.object.name === "Object";
        return isCompoundComponent ? [id.name] : [];
      });
    }
    const reexportPath = statement.source?.value;
    const reexportedParts = reexportPath ? exportedParts(resolveReexport(sourcePath, reexportPath)) : [];
    return statement.specifiers.flatMap((specifier) => {
      if (specifier.type !== "ExportSpecifier" || specifier.exportKind === "type") return [];
      return reexportedParts.includes(moduleExportName(specifier.local)) ? [moduleExportName(specifier.exported)] : [];
    });
  });
}

function moduleExportName(node: { type: "Identifier"; name: string } | { type: "StringLiteral"; value: string }) {
  return node.type === "Identifier" ? node.name : node.value;
}

function resolveReexport(sourcePath: string, specifier: string) {
  const path = specifier.startsWith("@/components/control-ui/")
    ? resolve(docsRoot, specifier.replace("@/components/control-ui/", "src/registry/sources/control-ui/"))
    : resolve(docsRoot, dirname(sourcePath), specifier);
  return existsSync(`${path}.tsx`) ? `${path}.tsx` : `${path}.ts`;
}

function flattenTree(node: CompositionNode): CompositionNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

const partsByEntry = new Map(composedEntries.map((entry) => [entry.id, exportedParts(entry.source)]));
const publicParts = new Set([
  ...[...partsByEntry.values()].flat(),
  ...composedEntries.flatMap((entry) => entry.support.flatMap(exportedParts)),
]);
const reactEmailParts: Record<string, true> = { Img: true };

describe("authored composition contract", () => {
  test("every catalog page has an explicit composition", () => {
    expect(Object.keys(catalogCompositions).sort()).toEqual(composedEntries.map((entry) => entry.id).sort());
  });

  for (const entry of composedEntries) {
    test(`${entry.id} documents its public parts in valid trees`, () => {
      const examples = catalogCompositions[entry.id];
      const nodes = examples.flatMap((example) => flattenTree(example.tree));
      const names = new Set(nodes.filter((node) => node.kind === "part").map((node) => node.name));
      const missing = partsByEntry.get(entry.id)?.filter((name) => !names.has(name));
      expect(missing).toEqual([]);
      expect(new Set(examples.map((example) => example.title)).size).toBe(examples.length);

      nodes.forEach((node) => {
        expect(new Set(node.children.map((child) => child.name)).size).toBe(node.children.length);
        if (node.kind !== "part") return;
        expect(node.name).toMatch(/^[A-Za-z][A-Za-z0-9]*$/);
        const knownPart =
          /^[a-z]/.test(node.name) || publicParts.has(node.name) || (entry.id === "email" && reactEmailParts[node.name] === true);
        expect(knownPart, `${entry.id}: unknown component ${node.name}`).toBe(true);
      });
      if (names.size > 1) expect(examples.some((example) => example.tree.children.length > 0)).toBe(true);
    });
  }
});
