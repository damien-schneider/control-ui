import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { collectSkinContract, collectThemeContract } from "./skin-contract/collect";

const checkOnly = process.argv.includes("--check");
const targets = [
  { path: "public/r/skin-contract.json", content: `${JSON.stringify(collectSkinContract(), null, 2)}\n` },
  { path: "public/r/theme-contract.json", content: `${JSON.stringify(collectThemeContract(), null, 2)}\n` },
];
const contract = targets[0].content.trim();
targets.push({
  path: "app/(features)/model/generated-skin-contract.ts",
  content: formatGeneratedTypeScript(
    "app/(features)/model/generated-skin-contract.ts",
    `import "server-only";\n\nexport const generatedSkinContract = ${contract} as const;\n`,
  ),
});

let drift = false;
for (const target of targets) {
  const absolutePath = path.join(process.cwd(), target.path);
  if (existsSync(absolutePath) && readFileSync(absolutePath, "utf8") === target.content) continue;
  drift = true;
  if (checkOnly) {
    console.error(`- ${target.path} is out of date; run \`bun run sync:contracts\``);
    continue;
  }
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, target.content);
  console.log(`Synced ${target.path}`);
}

if (checkOnly && drift) process.exit(1);
if (checkOnly) console.log("Skin and theme contracts are in sync.");
