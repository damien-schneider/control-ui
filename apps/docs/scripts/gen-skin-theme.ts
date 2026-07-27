// Only packs carrying tokens.ts are generated; hand-authored ones are left alone.
// Runs before sync:registry so theme.css is always current, and --check fails on drift.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertCompleteSkinTokens, type SkinTokens } from "@/src/registry/lib/define-skin-tokens";

const checkOnly = process.argv.includes("--check");
const skinPacksRoot = path.join(process.cwd(), "src/registry/skin-packs");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderBlock(selector: string, tokens: Record<string, string>) {
  const lines = Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function renderThemeCss(skinId: string, tokens: SkinTokens) {
  const header = "/* GENERATED from ./tokens.ts by scripts/gen-skin-theme.ts — edit tokens.ts and run `bun run sync`. */";
  const light = renderBlock(`[data-skin="${skinId}"]`, tokens.light);
  const dark = renderBlock(`.dark[data-skin="${skinId}"],\n:where(.dark) [data-skin="${skinId}"]`, tokens.dark);
  return `${header}\n\n${light}\n\n${dark}\n`;
}

const drift: string[] = [];
let generated = 0;

for (const packId of readdirSync(skinPacksRoot)) {
  const packDir = path.join(skinPacksRoot, packId);
  if (!statSync(packDir).isDirectory()) continue;

  const tokensPath = path.join(packDir, "tokens.ts");
  if (!existsSync(tokensPath)) continue; // hand-authored pack, leave alone

  const loaded: unknown = await import(tokensPath);
  if (!isRecord(loaded)) throw new Error(`${tokensPath} must export skinId and skinTokens.`);
  if (typeof loaded.skinId !== "string" || loaded.skinId.length === 0) {
    throw new Error(`${tokensPath} must export a non-empty skinId.`);
  }
  if (loaded.skinId !== packId) {
    throw new Error(`${tokensPath} exports skinId ${JSON.stringify(loaded.skinId)}, but its pack directory is ${JSON.stringify(packId)}.`);
  }

  assertCompleteSkinTokens(loaded.skinTokens, `${packId}/tokens.ts`);
  const skinId = loaded.skinId;
  const skinTokens: SkinTokens = loaded.skinTokens;
  const expected = renderThemeCss(skinId, skinTokens);

  const themePath = path.join(packDir, "theme.css");
  const current = existsSync(themePath) ? readFileSync(themePath, "utf8") : undefined;
  if (current === expected) continue;

  if (checkOnly) {
    drift.push(`- ${path.relative(process.cwd(), themePath)} is out of date; run \`bun run sync\``);
    continue;
  }
  writeFileSync(themePath, expected);
  generated += 1;
}

if (drift.length > 0) {
  console.error(drift.join("\n"));
  process.exit(1);
}

console.log(checkOnly ? "Generated skin themes are in sync." : `Generated skin themes synced (${generated} written).`);
