#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// This file ships inside the installed control-ui directory, so its own location is the one path
// the registry cannot know: the real prefix every re-appended canonical import must fold onto.
const controlUiDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const marker = "components/control-ui/";
const importPattern = /^@import\s+"(\.[^"]+)";?$/;
const themeSuffix = ".control-ui-theme.css";

function findAppDir(start) {
  let directory = start;
  while (!existsSync(path.join(directory, "components.json"))) {
    const parent = path.dirname(directory);
    if (parent === directory) throw new Error(`No components.json found above ${start}`);
    directory = parent;
  }
  return directory;
}

const appDir = findAppDir(controlUiDir);
const componentsConfig = JSON.parse(readFileSync(path.join(appDir, "components.json"), "utf8"));
const entryRelative = componentsConfig.tailwind?.css;
if (typeof entryRelative !== "string") throw new Error(`components.json in ${appDir} names no tailwind.css entry`);
const entryPath = path.join(appDir, entryRelative);
const entryDir = path.dirname(entryPath);

const toPosix = (value) => value.split(path.sep).join("/");

function realSpecifier(tail) {
  const specifier = toPosix(path.relative(entryDir, path.join(controlUiDir, tail)));
  return specifier.startsWith(".") ? specifier : `./${specifier}`;
}

const original = readFileSync(entryPath, "utf8");
const seen = new Set();
const unresolved = [];
let folded = 0;

// A file saved without a trailing newline glues the next appended import onto the same line.
function splitGluedImports(line) {
  const statements = [...line.matchAll(/@import\s+"[^"]+";?/g)].map((match) => match[0]);
  const rest = line.replaceAll(/@import\s+"[^"]+";?/g, "").trim();
  if (statements.length < 2 || rest !== "") return [line];
  return statements;
}

const repairedLines = original
  .split("\n")
  .flatMap(splitGluedImports)
  .flatMap((line) => {
    const match = importPattern.exec(line.trim());
    if (!match) return [line];
    let specifier = match[1];
    if (!existsSync(path.resolve(entryDir, specifier))) {
      const markerIndex = specifier.lastIndexOf(marker);
      const candidate = markerIndex === -1 ? null : realSpecifier(specifier.slice(markerIndex + marker.length));
      if (candidate !== null && existsSync(path.resolve(entryDir, candidate))) {
        specifier = candidate;
        folded += 1;
      } else {
        unresolved.push(specifier);
      }
    }
    if (seen.has(specifier)) {
      folded += 1;
      return [];
    }
    seen.add(specifier);
    return [`@import "${specifier}";`];
  });

const isImportLine = (line) => importPattern.test(line.trim());
const isThemeImport = (line) => isImportLine(line) && line.includes(themeSuffix);
const themeImports = repairedLines.filter(isThemeImport);
const orderedLines = repairedLines.filter((line) => !isThemeImport(line));
if (themeImports.length > 0) {
  const lastImportIndex = orderedLines.reduce((last, line, index) => (isImportLine(line) ? index : last), -1);
  orderedLines.splice(lastImportIndex + 1, 0, ...themeImports);
}

const repaired = orderedLines.join("\n");
if (repaired !== original) {
  writeFileSync(entryPath, repaired);
  console.log(`Folded ${folded} re-appended import(s) in ${toPosix(path.relative(appDir, entryPath))}.`);
} else {
  console.log(`${toPosix(path.relative(appDir, entryPath))} is already in sync.`);
}
if (unresolved.length > 0) {
  console.error(`Imports resolving to no file:\n${unresolved.map((specifier) => `- ${specifier}`).join("\n")}`);
  process.exit(1);
}
