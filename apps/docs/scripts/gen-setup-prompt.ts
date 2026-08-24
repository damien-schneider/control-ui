import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSetupPrompt } from "@/app/(features)/create/setup-prompt";
import { siteConfig } from "@/lib/site-config";
import { publicPayloadPath, publicPayloads } from "./public-payloads";

const checkOnly = process.argv.includes("--check");
const target = publicPayloadPath(publicPayloads.setupPrompt);
// Published for agents that never load the page, so it is written against the public origin rather than
// whichever registry this checkout runs, and `--check` stays stable between a local build and CI.
const content = buildSetupPrompt({ origin: siteConfig.url.origin });
const absolutePath = path.join(process.cwd(), target);

if (existsSync(absolutePath) && readFileSync(absolutePath, "utf8") === content) {
  console.log("Setup prompt is in sync.");
} else if (checkOnly) {
  console.error(`- ${target} is out of date; run \`bun run sync:setup-prompt\``);
  process.exit(1);
} else {
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
  console.log(`Synced ${target}`);
}
