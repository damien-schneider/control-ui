import { readFileSync } from "node:fs";
import path from "node:path";

export function readCssWithImports(filePath: string, importStack: string[] = []): string {
  const absolutePath = path.resolve(filePath);
  if (importStack.includes(absolutePath)) throw new Error(`Circular CSS import: ${[...importStack, absolutePath].join(" -> ")}`);
  return readFileSync(absolutePath, "utf8").replace(/@import\s+"(\.[^"]+)"\s*;/g, (_match: string, relativePath: string) =>
    readCssWithImports(path.resolve(path.dirname(absolutePath), relativePath), [...importStack, absolutePath]),
  );
}
