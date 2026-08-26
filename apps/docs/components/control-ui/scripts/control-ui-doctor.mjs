#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Read-only audit of the wiring the registry cannot see from inside one install:
// the CSS entry, the app's own token blocks fighting the skin, and the data-skin stamp.
const controlUiDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
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

const stripComments = (css) => css.replaceAll(/\/\*[\s\S]*?\*\//g, " ");

// One nesting-aware pass: top-level blocks of a stylesheet (or of a block body).
function parseBlocks(css) {
  const blocks = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = 0;
  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    if (character === "{") {
      if (depth === 0) bodyStart = index + 1;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push({ prelude: css.slice(preludeStart, bodyStart - 1).trim(), body: css.slice(bodyStart, index) });
        preludeStart = index + 1;
      }
    } else if (character === ";" && depth === 0) {
      preludeStart = index + 1;
    }
  }
  return blocks;
}

// @layer/@media/@supports wrap real blocks one level down; selector and @theme blocks hold declarations.
function flattenBlocks(css) {
  return parseBlocks(css).flatMap((block) => (/^@(layer|media|supports)\b/.test(block.prelude) ? flattenBlocks(block.body) : [block]));
}

function declarations(body) {
  const properties = new Map();
  let depth = 0;
  for (const statement of body.split(";")) {
    const open = (statement.match(/{/g) ?? []).length;
    const close = (statement.match(/}/g) ?? []).length;
    if (depth === 0) {
      const match = /^\s*(--[\w-]+)\s*:\s*([\s\S]*)$/.exec(statement);
      if (match) properties.set(match[1], match[2].trim());
    }
    depth += open - close;
  }
  return properties;
}

function tokenNames(filePath, preludeTest) {
  if (!existsSync(filePath)) return new Set();
  const names = new Set();
  for (const block of flattenBlocks(stripComments(readFileSync(filePath, "utf8")))) {
    if (preludeTest(block.prelude)) for (const name of declarations(block.body).keys()) names.add(name);
  }
  return names;
}

const isThemeBlock = (prelude) => /^@theme\b/.test(prelude);
const isSkinScope = (prelude) => prelude.includes("[data-skin");
const ownedThemeKeys = tokenNames(path.join(controlUiDir, "styles/theme.css"), isThemeBlock);
const skinTokens = new Set([
  ...tokenNames(path.join(controlUiDir, "styles/skin-theme.css"), isSkinScope),
  ...tokenNames(path.join(controlUiDir, "styles/theme.css"), isSkinScope),
]);

const skinIds = new Set(
  [...stripComments(readFileSync(path.join(controlUiDir, "styles/skin-theme.css"), "utf8")).matchAll(/\[data-skin="([\w-]+)"\]/g)].map(
    (match) => match[1],
  ),
);

const errors = [];
const warnings = [];

// App-owned stylesheets: the entry plus every relative import that lands outside the control-ui directory.
const appStylesheets = [];
const visited = new Set();
const pending = [entryPath];
while (pending.length > 0) {
  const filePath = pending.pop();
  if (visited.has(filePath) || !existsSync(filePath)) continue;
  visited.add(filePath);
  const css = stripComments(readFileSync(filePath, "utf8"));
  appStylesheets.push({ filePath, css });
  for (const [, specifier] of css.matchAll(/@import\s+"(\.[^"]+)"/g)) {
    const resolved = path.resolve(path.dirname(filePath), specifier);
    if (!existsSync(resolved)) {
      errors.push(`${path.relative(appDir, filePath)} imports "${specifier}" which resolves to no file — run scripts/fix-css-imports.mjs`);
    } else if (!resolved.startsWith(controlUiDir + path.sep) && !specifier.endsWith(themeSuffix)) {
      pending.push(resolved);
    }
  }
}

const entryImports = [...stripComments(readFileSync(entryPath, "utf8")).matchAll(/@import\s+"([^"]+)"/g)].map((match) => match[1]);
const lastNonTheme = entryImports.reduce((last, specifier, index) => (specifier.endsWith(themeSuffix) ? last : index), -1);
const firstTheme = entryImports.findIndex((specifier) => specifier.endsWith(themeSuffix));
if (firstTheme !== -1 && firstTheme < lastNonTheme) {
  errors.push(`${entryRelative}: the ${themeSuffix} import must stay last — run scripts/fix-css-imports.mjs`);
}

for (const { filePath, css } of appStylesheets) {
  const relative = path.relative(appDir, filePath);
  for (const block of flattenBlocks(css)) {
    const declared = declarations(block.body);
    if (isThemeBlock(block.prelude)) {
      const conflicting = [...declared].filter(
        ([name, value]) => (ownedThemeKeys.has(name) || skinTokens.has(name)) && value !== `var(${name})`,
      );
      if (conflicting.length > 0) {
        errors.push(
          `${relative}: ${block.prelude} redeclares Control UI keys — Tailwind merges @theme blocks and the later value wins, ` +
            `silently rewiring these utilities away from the skin: ${conflicting.map(([name]) => name).join(", ")}`,
        );
      }
    } else if (/(^|,)\s*(:root|html|body|\.dark)\s*($|,)/.test(block.prelude)) {
      const dead = [...declared.keys()].filter((name) => skinTokens.has(name));
      const live = [...declared.keys()].filter((name) => !skinTokens.has(name));
      if (dead.length > 0) {
        warnings.push(
          live.length > 0
            ? `${relative}: "${block.prelude}" is hybrid — ${dead.length} declaration(s) are dead (out-specified by the skin scope: ` +
                `${dead.join(", ")}) while ${live.join(", ")} still paint a second palette next to the skin`
            : `${relative}: "${block.prelude}" only redeclares skin tokens (${dead.join(", ")}) — dead under the skin scope, delete it`,
        );
      }
    }
  }
}

const skipDirectories = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".turbo", "coverage"]);
const stampExtensions = new Set([".html", ".tsx", ".jsx", ".ts", ".js", ".mjs", ".astro", ".vue", ".svelte", ".mdx"]);

function findStamps(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = path.join(directory, entry);
    if (statSync(filePath).isDirectory()) {
      return skipDirectories.has(entry) || filePath === controlUiDir ? [] : findStamps(filePath);
    }
    if (!stampExtensions.has(path.extname(entry))) return [];
    const source = readFileSync(filePath, "utf8");
    return [...source.matchAll(/data-skin=\{?["']([\w-]+)["']/g)]
      .map((match) => ({ filePath, id: match[1] }))
      .concat(/dataset\.skin|setAttribute\(\s*["']data-skin["']/.test(source) ? [{ filePath, id: null }] : []);
  });
}

const stamps = findStamps(appDir);
if (stamps.length === 0) {
  errors.push(
    `No data-skin stamp found in ${appDir} — without data-skin="${[...skinIds][0] ?? "<skin id>"}" on the root element, ` +
      "every token is undeclared and portalled surfaces render unstyled",
  );
} else if (!stamps.some((stamp) => stamp.id === null || skinIds.has(stamp.id))) {
  const found = [...new Set(stamps.map((stamp) => stamp.id))].join(", ");
  errors.push(`data-skin stamp(s) found (${found}) but the installed skin declares ${[...skinIds].join(", ")} — the ids must match`);
}

for (const warning of warnings) console.warn(`warn  ${warning}`);
for (const error of errors) console.error(`error ${error}`);
if (errors.length === 0 && warnings.length === 0) console.log("control-ui doctor: clean.");
process.exit(errors.length > 0 ? 1 : 0);
