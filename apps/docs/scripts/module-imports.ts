import { parse } from "@babel/parser";

type AstNode = {
  type?: string;
  source?: unknown;
  callee?: unknown;
  arguments?: unknown;
  [key: string]: unknown;
};

function isNode(value: unknown): value is AstNode {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  if (!isNode(value)) return undefined;
  return value.type === "StringLiteral" && typeof value.value === "string" ? value.value : undefined;
}

const moduleSourceNodeTypes = new Set(["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration", "ImportExpression"]);
const ignoredTraversalKeys = new Set(["loc", "start", "end"]);

function moduleSpecifier(node: AstNode): string | undefined {
  if (node.type && moduleSourceNodeTypes.has(node.type)) return stringValue(node.source);
  if (node.type !== "CallExpression" || !isNode(node.callee) || node.callee.type !== "Import") return undefined;
  const [argument] = Array.isArray(node.arguments) ? node.arguments : [];
  return stringValue(argument);
}

function visitAstValues(values: unknown[], visited: Set<object>, visitNode: (node: AstNode) => void) {
  for (const value of values) visitAst(value, visited, visitNode);
}

function visitAst(value: unknown, visited: Set<object>, visitNode: (node: AstNode) => void) {
  if (Array.isArray(value)) {
    visitAstValues(value, visited, visitNode);
    return;
  }
  if (!isNode(value) || visited.has(value)) return;

  visited.add(value);
  visitNode(value);

  for (const [key, child] of Object.entries(value)) {
    if (ignoredTraversalKeys.has(key)) continue;
    visitAst(child, visited, visitNode);
  }
}

export function importSpecifiers(filePath: string, source: string) {
  const ast = parse(source, {
    sourceType: "module",
    plugins: filePath.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"],
  });
  const specifiers: string[] = [];
  const visited = new Set<object>();

  visitAst(ast, visited, (node) => {
    const specifier = moduleSpecifier(node);
    if (specifier) specifiers.push(specifier);
  });
  return specifiers;
}

export type ExportedBinding = { name: string; typeOnly: boolean };

type NamedExport = Extract<ReturnType<typeof parse>["program"]["body"][number], { type: "ExportNamedDeclaration" }>;

function declarationBindings(declaration: NamedExport["declaration"], typeOnly: boolean): ExportedBinding[] {
  if (!declaration) return [];
  if (declaration.type === "VariableDeclaration") {
    return declaration.declarations.flatMap((declarator) =>
      declarator.id.type === "Identifier" ? [{ name: declarator.id.name, typeOnly }] : [],
    );
  }
  if (!("id" in declaration) || declaration.id?.type !== "Identifier") return [];
  const isTypeDeclaration = declaration.type === "TSTypeAliasDeclaration" || declaration.type === "TSInterfaceDeclaration";
  return [{ name: declaration.id.name, typeOnly: typeOnly || isTypeDeclaration }];
}

function specifierBindings(specifiers: NamedExport["specifiers"], typeOnly: boolean): ExportedBinding[] {
  return specifiers.flatMap((specifier) => {
    if (specifier.type !== "ExportSpecifier") return [];
    const name = specifier.exported.type === "Identifier" ? specifier.exported.name : specifier.exported.value;
    return [{ name, typeOnly: typeOnly || specifier.exportKind === "type" }];
  });
}

export function exportedBindings(filePath: string, source: string): ExportedBinding[] {
  const ast = parse(source, {
    sourceType: "module",
    plugins: filePath.endsWith(".tsx") ? ["typescript", "jsx"] : ["typescript"],
  });
  return ast.program.body.flatMap((statement) => {
    if (statement.type === "ExportDefaultDeclaration") return [{ name: "default", typeOnly: false }];
    if (statement.type !== "ExportNamedDeclaration") return [];
    const typeOnly = statement.exportKind === "type";
    return [...declarationBindings(statement.declaration, typeOnly), ...specifierBindings(statement.specifiers, typeOnly)];
  });
}
