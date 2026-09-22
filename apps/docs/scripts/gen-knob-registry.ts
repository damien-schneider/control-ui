import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { collectKnobFamilies, recipesDir } from "./knob-contracts/collect";

const checkOnly = process.argv.includes("--check");
const target = path.join("mastra", "knob-registry.ts");

const registry = collectKnobFamilies().map((family) => ({
  id: family.id,
  knobs: family.knobs
    .map(({ name, syntax, defaultValue, selector }) => ({ name, syntax, defaultValue, selector }))
    .sort((left, right) => left.name.localeCompare(right.name)),
}));

const source = [
  `// Generated from ${recipesDir} by scripts/gen-knob-registry.ts — run \`bun run sync:knob-registry\`.`,
  "export type RegisteredKnob = { name: string; syntax: string; defaultValue: string; selector: string };",
  "export type RegisteredKnobFamily = { id: string; knobs: readonly RegisteredKnob[] };",
  "",
  `export const KNOB_REGISTRY: readonly RegisteredKnobFamily[] = ${JSON.stringify(registry)};`,
  "",
].join("\n");

const content = formatGeneratedTypeScript(target, source);
const drifted = !existsSync(target) || readFileSync(target, "utf8") !== content;

if (checkOnly) {
  if (drifted) {
    console.error(`${target} is out of date. Run \`bun run sync:knob-registry\`.`);
    process.exit(1);
  }
  console.log("Knob registry is in sync.");
} else {
  if (drifted) writeFileSync(target, content);
  console.log(`Wrote ${registry.length} knob families to ${target}`);
}
