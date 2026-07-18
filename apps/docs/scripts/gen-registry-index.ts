// Emits the agent-facing index beside the official shadcn registry catalog.
// Mirrors the generated registry scripts' --check discipline so `validate` catches drift.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { listRegistry } from "@/app/(features)/registry-api/registry-index";
import { env } from "@/env";
import { siteConfig } from "@/lib/site-config";

const checkOnly = process.argv.includes("--check");
const target = path.join(process.cwd(), "public/r/agent-index.json");
const content = `${JSON.stringify(listRegistry(), null, 2).replaceAll(env.NEXT_PUBLIC_REGISTRY_URL, siteConfig.url.origin)}\n`;
const current = existsSync(target) ? readFileSync(target, "utf8") : undefined;

if (current === content) {
  console.log("Registry index is in sync.");
  process.exit(0);
}

if (checkOnly) {
  console.error(`- ${path.relative(process.cwd(), target)} is out of date; run \`bun run sync\``);
  process.exit(1);
}

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, content);
console.log("Registry index synced.");
