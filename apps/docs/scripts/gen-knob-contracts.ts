import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { collectKnobFamilies, knobContractsDir, recipesDir } from "./knob-contracts/collect";

const checkOnly = process.argv.includes("--check");

function camelCase(family: string): string {
  return family.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}
function pascalCase(family: string): string {
  const camel = camelCase(family);
  return camel[0].toUpperCase() + camel.slice(1);
}

const families = collectKnobFamilies();
const generated = new Map(
  families.map(({ id, knobs }) => {
    const outputPath = path.join(knobContractsDir, `${id}-knobs.ts`);
    const source = [
      `// Generated from ${recipesDir}/${id}.css by scripts/gen-knob-contracts.ts — run \`bun run sync:knobs\`.`,
      `export const ${camelCase(id)}Knobs = [${knobs.map((knob) => `"${knob.name}"`).join(", ")}] as const;`,
      `export type ${pascalCase(id)}KnobStyle = Partial<Record<(typeof ${camelCase(id)}Knobs)[number], string>>;`,
      "",
    ].join("\n");
    return [outputPath, formatGeneratedTypeScript(outputPath, source)];
  }),
);

mkdirSync(knobContractsDir, { recursive: true });
const existing = existsSync(knobContractsDir) ? readdirSync(knobContractsDir).map((entry) => path.join(knobContractsDir, entry)) : [];
const stale = existing.filter((filePath) => !generated.has(filePath));
const drifted = [...generated].filter(([filePath, content]) => !existsSync(filePath) || readFileSync(filePath, "utf8") !== content);

if (checkOnly) {
  if (drifted.length === 0 && stale.length === 0) {
    console.log("Knob contracts are in sync.");
  } else {
    for (const [filePath] of drifted) console.error(`- ${filePath} is out of date; run \`bun run sync:knobs\``);
    for (const filePath of stale) console.error(`- ${filePath} is no longer a knob family; run \`bun run sync:knobs\``);
    process.exit(1);
  }
} else {
  for (const filePath of stale) rmSync(filePath);
  for (const [filePath, content] of drifted) writeFileSync(filePath, content);
  console.log(
    `Synced ${knobContractsDir} (${families.length} families, ${families.reduce((total, family) => total + family.knobs.length, 0)} knobs)`,
  );
}
