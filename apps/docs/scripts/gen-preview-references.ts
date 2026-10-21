import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { allPreviewTargets } from "../app/(features)/components/preview-targets";
import { formatGeneratedTypeScript } from "./format-generated-typescript";

const checkOnly = process.argv.includes("--check");
const target = "app/(features)/components/generated-preview-references.ts";
const loaderPattern = /import\(["'`](.+?)["'`]\)\.then\(\(mod\) => \(\{\s*default: mod\.(\w+),?\s*\}\)\)/;

const references = allPreviewTargets().map(({ key, preview }) => {
  const match = loaderPattern.exec(preview.load.toString());
  if (!match) throw new Error(`${key} preview must load as import("…").then((mod) => ({ default: mod.ExportName }))`);
  const [, specifier, exportName] = match;
  return { key, specifier, exportName };
});

const specifierByExport = new Map<string, string>();
const exportsBySpecifier = new Map<string, Set<string>>();
for (const { specifier, exportName } of references) {
  const existing = specifierByExport.get(exportName);
  if (existing && existing !== specifier) throw new Error(`${exportName} is exported by both ${existing} and ${specifier}`);
  specifierByExport.set(exportName, specifier);
  exportsBySpecifier.set(specifier, (exportsBySpecifier.get(specifier) ?? new Set()).add(exportName));
}

const imports = [...exportsBySpecifier]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([specifier, exportNames]) => `import { ${[...exportNames].sort().join(", ")} } from "${specifier}";`);

const source = [
  "// Generated from the docs catalog by scripts/gen-preview-references.ts — run `bun run sync:previews`.",
  'import "server-only";',
  "",
  ...imports,
  'import type { LoadedPreviews } from "./preview-targets";',
  "",
  "export const previewReferences: LoadedPreviews = {",
  ...references.map(({ key, exportName }) => `  ${JSON.stringify(key)}: ${exportName},`),
  "};",
  "",
].join("\n");

const content = formatGeneratedTypeScript(target, source);
const drifted = !existsSync(target) || readFileSync(target, "utf8") !== content;

if (checkOnly) {
  if (drifted) {
    console.error(`${target} is out of date. Run \`bun run sync:previews\`.`);
    process.exit(1);
  }
  console.log("Preview references are in sync.");
} else {
  if (drifted) writeFileSync(target, content);
  console.log(`Wrote ${references.length} preview references to ${target}`);
}
