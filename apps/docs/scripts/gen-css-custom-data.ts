// The recipe CSS is the source of truth for the knob contract (Spectrum's metadata pattern):
// every @property in recipes/*.css becomes a VS Code custom-data entry, so knobs autocomplete
// with their registered syntax in any stylesheet of the workspace.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const recipesDir = path.join(root, "src/registry/sources/control-ui/recipes");
const outPath = path.join(root, "..", "..", ".vscode", "control-ui.css-data.json");

type CustomDataProperty = { name: string; description: string; syntax?: string };

const properties: CustomDataProperty[] = [];
for (const entry of readdirSync(recipesDir)
  .filter((name) => name.endsWith(".css"))
  .sort()) {
  const component = path.basename(entry, ".css");
  const rootNode = postcss.parse(readFileSync(path.join(recipesDir, entry), "utf8"), { from: entry });
  rootNode.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    let syntax: string | undefined;
    let initial: string | undefined;
    atRule.walkDecls((declaration) => {
      if (declaration.prop === "syntax") syntax = declaration.value.replace(/^["']|["']$/g, "");
      if (declaration.prop === "initial-value") initial = declaration.value;
    });
    properties.push({
      name,
      description: `Control UI ${component} knob — registered syntax ${syntax ?? "*"}${initial ? `, fallback ${initial}` : ""}. Re-value it under [data-skin] or per instance via style.`,
      ...(syntax && syntax !== "*" ? { syntax } : {}),
    });
  });
}

properties.sort((left, right) => left.name.localeCompare(right.name));
const output = `${JSON.stringify({ version: 1.1, properties }, null, 2)}\n`;

if (checkOnly) {
  const current = readFileSync(outPath, "utf8");
  if (current !== output) {
    console.error("CSS custom data is out of date — run `bun run sync:cssdata`.");
    process.exit(1);
  }
  console.log("CSS custom data is in sync.");
  process.exit(0);
}

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, output);
console.log(`CSS custom data generated (${properties.length} knobs) in .vscode/control-ui.css-data.json`);
