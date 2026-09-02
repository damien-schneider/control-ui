import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildControlUiSkill } from "@/app/(features)/create/control-ui-skill";
import { siteConfig } from "@/lib/site-config";
import { publicPayloadPath, publicPayloads } from "./public-payloads";

const checkOnly = process.argv.includes("--check");
const skill = buildControlUiSkill({ origin: siteConfig.url.origin });

function discoveryIndex(source: string) {
  const description = source.match(/^description: (.+)$/m)?.[1];
  if (!description) throw new Error("The Control UI skill is missing its frontmatter description.");
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "control-ui",
        description,
        type: "skill-md",
        url: `${siteConfig.url.origin}/r/${publicPayloads.controlUiSkill}`,
        digest: `sha256:${createHash("sha256").update(source).digest("hex")}`,
      },
    ],
  };
  return `${JSON.stringify(index, null, 2)}\n`;
}

// public/r serves the setup prompt's install step and the file `npx skills add` downloads; public/.well-known is the
// index that CLI discovers from the bare origin; skills/control-ui is what skill CLIs read from the repository itself;
// src/registry/skills is the source the control-ui-skill registry item installs to .claude/skills in consumer apps.
const targets: [target: string, content: string][] = [
  [publicPayloadPath(publicPayloads.controlUiSkill), skill],
  ["public/.well-known/agent-skills/index.json", discoveryIndex(skill)],
  ["../../skills/control-ui/SKILL.md", skill],
  ["src/registry/skills/control-ui-skill.md", skill],
];

let failed = false;
for (const [target, content] of targets) {
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
