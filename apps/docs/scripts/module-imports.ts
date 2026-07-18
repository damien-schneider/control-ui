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
