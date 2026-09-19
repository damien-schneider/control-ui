import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import { visitAst } from "@/scripts/module-imports";

export type DevSourceFile = { path: string; code: string; elementLines: number[] };

const previewableExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css", ".md", ".mdx"]);
const jsxExtensions = new Set([".tsx", ".jsx"]);

function isPreviewable(filePath: string, repoRoot: string) {
  return filePath.startsWith(`${repoRoot}${path.sep}`) && previewableExtensions.has(path.extname(filePath));
}

function grabbedPosition(searchParams: URLSearchParams) {
  const line = Number(searchParams.get("line"));
  const column = Number(searchParams.get("column"));
  return Number.isInteger(line) && line >= 1 && Number.isInteger(column) && column >= 0 ? { line, column } : null;
}

function offsetOfPosition(code: string, line: number, column: number) {
  const linesBefore = code.split("\n").slice(0, line - 1);
  return linesBefore.reduce((offset, text) => offset + text.length + 1, 0) + column;
}

function lineOfOffset(code: string, offset: number) {
  return code.slice(0, offset).split("\n").length;
}

function tryParseJsx(code: string) {
  try {
    return parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], errorRecovery: true });
  } catch {
    return null;
  }
}

function lineNumbersBetween(first: number, last: number) {
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

function jsxElementLines(filePath: string, code: string, { line, column }: { line: number; column: number }) {
  const startLineOnly = [line];
  const ast = jsxExtensions.has(path.extname(filePath)) ? tryParseJsx(code) : null;
  if (!ast) return startLineOnly;

  const elementStart = offsetOfPosition(code, line, column);
  let elementEnd: number | undefined;
  visitAst(ast, new Set(), (node) => {
    const isJsxElement = node.type === "JSXElement" || node.type === "JSXFragment";
    if (isJsxElement && node.start === elementStart && typeof node.end === "number") elementEnd = node.end;
  });
  return elementEnd === undefined ? startLineOnly : lineNumbersBetween(line, lineOfOffset(code, elementEnd));
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });

  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get("path");
  if (!requestedPath) return Response.json({ error: "Pass the source file as ?path=." }, { status: 400 });

  const repoRoot = await realpath(path.resolve(process.cwd(), "../.."));
  const filePath = await realpath(path.resolve(process.cwd(), requestedPath)).catch(() => null);
  if (!filePath || !isPreviewable(filePath, repoRoot)) {
    return Response.json({ error: `${requestedPath} is not a source file inside the repository.` }, { status: 404 });
  }

  const code = await readFile(filePath, "utf8");
  const position = grabbedPosition(searchParams);
  const elementLines = position ? jsxElementLines(filePath, code, position) : [];
  const sourceFile: DevSourceFile = { path: path.relative(repoRoot, filePath), code, elementLines };
  return Response.json(sourceFile);
}
