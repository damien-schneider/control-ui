import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildControlUiSkill } from "@/app/(features)/create/control-ui-skill";
import { siteConfig } from "@/lib/site-config";
import { publicPayloadPath, publicPayloads } from "./public-payloads";

const checkOnly = process.argv.includes("--check");
// public/r serves the setup prompt's install step; skills/control-ui is what skill CLIs read from the repository itself.
const targets = [publicPayloadPath(publicPayloads.controlUiSkill), "../../skills/control-ui/SKILL.md"];
const content = buildControlUiSkill({ origin: siteConfig.url.origin });

let failed = false;
for (const target of targets) {
  const absolutePath = path.resolve(process.cwd(), target);
  if (existsSync(absolutePath) && readFileSync(absolutePath, "utf8") === content) {
    console.log(`${target} is in sync.`);
  } else if (checkOnly) {
    console.error(`- ${target} is out of date; run \`bun run sync:skill\``);
    failed = true;
  } else {
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
    console.log(`Synced ${target}`);
  }
}
if (failed) process.exit(1);
