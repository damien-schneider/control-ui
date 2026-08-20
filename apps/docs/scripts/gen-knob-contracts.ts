import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { collectKnobFamilies, recipesDir } from "./knob-contracts/collect";

const checkOnly = process.argv.includes("--check");
const outputPath = "src/registry/knob-contracts.ts";

function camelCase(family: string): string {
  return family.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}
function pascalCase(family: string): string {
  const camel = camelCase(family);
  return camel[0].toUpperCase() + camel.slice(1);
}
function objectKey(family: string): string {
  return family.includes("-") ? `"${family}"` : family;
}

const families = collectKnobFamilies();
const declarations = families.map(({ id, knobs }) => {
  const list = knobs.map((knob) => `"${knob.name}"`).join(", ");
  return [
    `export const ${camelCase(id)}Knobs = [${list}] as const;`,
    `export type ${pascalCase(id)}KnobStyle = Partial<Record<(typeof ${camelCase(id)}Knobs)[number], string>>;`,
  ].join("\n");
});
const contractMap = families.map(({ id }) => `  ${objectKey(id)}: ${camelCase(id)}Knobs,`).join("\n");
const source = [
  `// Generated from ${recipesDir}/*.css by scripts/gen-knob-contracts.ts — run \`bun run sync:knobs\`.`,
  ...declarations,
  `export const controlKnobContracts = {\n${contractMap}\n} as const;`,
  "",
].join("\n");
const content = formatGeneratedTypeScript(outputPath, source);

const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : undefined;
if (current === content) {
  if (checkOnly) console.log("Knob contracts are in sync.");
} else if (checkOnly) {
  console.error(`- ${outputPath} is out of date; run \`bun run sync:knobs\``);
  process.exit(1);
} else {
  writeFileSync(outputPath, content);
  console.log(
    `Synced ${outputPath} (${families.length} families, ${families.reduce((total, family) => total + family.knobs.length, 0)} knobs)`,
  );
}
