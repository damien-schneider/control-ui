import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { THEME_AUDIT_PAIRS } from "../app/(features)/theme-accessibility/audit-contract";
import type { ContrastAnatomyArtifact } from "./contrast-anatomy/model";
import { formatGeneratedTypeScript } from "./format-generated-typescript";
import { contractDir, publicPayloadPath, publicPayloads } from "./public-payloads";
import { collectSkinContract, collectThemeContract } from "./skin-contract/collect";
import { contractSlices } from "./skin-contract/slices";

const checkOnly = process.argv.includes("--check");
const skinContract = collectSkinContract();
const targets = [
  { path: publicPayloadPath(publicPayloads.skinContract), content: `${JSON.stringify(skinContract, null, 2)}\n` },
  { path: publicPayloadPath(publicPayloads.themeContract), content: `${JSON.stringify(collectThemeContract(), null, 2)}\n` },
];
const contract = targets[0].content.trim();
// Annotated with SkinContract instead of frozen with `as const`: emitted data is checked against model
// collector builds it from, and consumers read contract's declared shape rather than 100 literal scopes.
targets.push({
  path: "app/(features)/model/generated-skin-contract.ts",
  content: formatGeneratedTypeScript(
    "app/(features)/model/generated-skin-contract.ts",
    `import "server-only";\n\nimport type { SkinContract } from "@/scripts/skin-contract/model";\n\nexport const generatedSkinContract: SkinContract = ${contract};\n`,
  ),
});

const anatomyPath = path.join(process.cwd(), publicPayloadPath(publicPayloads.contrastAnatomy));
const anatomy: ContrastAnatomyArtifact | undefined = existsSync(anatomyPath) ? JSON.parse(readFileSync(anatomyPath, "utf8")) : undefined;
const slices = contractSlices(skinContract, anatomy);
targets.push(...slices);

const requiredPairs = THEME_AUDIT_PAIRS.filter(
  (pair) =>
    pair.severity === "error" &&
    !(pair.foregroundAnatomy || pair.backgroundAnatomy || pair.surfaceAnatomy || pair.backgroundPaint || pair.surfacePaint),
).map(({ id, category, label, foreground, background, surface, underlays, threshold }) => ({
  id,
  category,
  label,
  foreground,
  background,
  surface,
  ...(underlays ? { underlays } : {}),
  threshold,
}));

const requiredPairsPath = "src/registry/sources/control-ui/scripts/required-pairs.mjs";
targets.push({
  path: requiredPairsPath,
  content: formatGeneratedTypeScript(requiredPairsPath, `export const REQUIRED_PAIRS = ${JSON.stringify(requiredPairs, null, 2)};\n`),
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

const sliceRoot = path.join(process.cwd(), publicPayloadPath(contractDir));
if (existsSync(sliceRoot)) {
  const expected = new Set(slices.map((slice) => path.basename(slice.path)));
  for (const entry of readdirSync(sliceRoot)) {
    if (expected.has(entry)) continue;
    drift = true;
    if (checkOnly) console.error(`- public/r/${contractDir}/${entry} is stale; run \`bun run sync:contracts\``);
    else {
      rmSync(path.join(sliceRoot, entry), { recursive: true, force: true });
      console.log(`Removed public/r/${contractDir}/${entry}`);
    }
  }
}

if (checkOnly && drift) process.exit(1);
if (checkOnly) console.log("Skin and theme contracts are in sync.");
