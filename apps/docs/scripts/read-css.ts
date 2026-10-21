import { readFileSync } from "node:fs";
import path from "node:path";

const CSS_IMPORT = /@import\s+"(\.[^"]+)"\s*;/g;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
const FONT_FACE_BLOCK = /@font-face\s*\{[^}]*\}/g;

type ReadCssOptions = { skipFontFaceOnly: boolean };

function isFontFaceOnly(css: string): boolean {
  return css.replace(CSS_COMMENT, "").replace(FONT_FACE_BLOCK, "").trim() === "";
}

function inlineImports(filePath: string, options: ReadCssOptions, importStack: string[]): string {
  const absolutePath = path.resolve(filePath);
  if (importStack.includes(absolutePath)) throw new Error(`Circular CSS import: ${[...importStack, absolutePath].join(" -> ")}`);
  const css = readFileSync(absolutePath, "utf8");
  if (options.skipFontFaceOnly && importStack.length > 0 && isFontFaceOnly(css)) return "";
  return css.replace(CSS_IMPORT, (_match: string, relativePath: string) =>
    inlineImports(path.resolve(path.dirname(absolutePath), relativePath), options, [...importStack, absolutePath]),
  );
}

export function readCssWithImports(filePath: string): string {
  return inlineImports(filePath, { skipFontFaceOnly: false }, []);
}

export function readCssRulesWithImports(filePath: string): string {
  return inlineImports(filePath, { skipFontFaceOnly: true }, []);
}
