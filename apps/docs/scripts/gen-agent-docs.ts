import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { practiceSkills, skillConcerns } from "@control-ui/skills";
import { siteIndexMarkdown } from "@/app/(features)/agent-markdown/site-index";
import { type CatalogCategoryId, catalogCategories } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import type { SearchItem } from "@/app/(features)/model/types";
import { listRegistry } from "@/app/(features)/registry-api/registry-index";
import { contrastAgentRules } from "@/app/(features)/theme-accessibility/agent-rules";
import { env } from "@/env";
import { siteConfig } from "@/lib/site-config";
import { publicPayloads } from "./public-payloads";

const KIND_SECTIONS: { kind: SearchItem["kind"]; heading: string }[] = [
  { kind: "Component", heading: "Components" },
  { kind: "Kit", heading: "Kits (pre-assembled sets of components)" },
  { kind: "Block", heading: "Templates (pre-composed recipes)" },
  { kind: "Extension", heading: "Extensions" },
  { kind: "Skin", heading: "Skins" },
  { kind: "Hook", heading: "Hooks" },
  { kind: "Util", heading: "Utils" },
  { kind: "Guide", heading: "Guides" },
];

function itemLine(item: { id: string; name: string; summary: string; install?: string; status?: SearchItem["status"] }) {
  const install = item.install ? ` — \`${item.install}\`` : "";
  const status = item.status ? ` **[${item.status}]**` : "";
  return `- \`${item.id}\` (${item.name})${status} — ${item.summary}${install}`;
}

const categoryById = new Map<string, CatalogCategoryId>([
  ...kitEntries.map((entry) => [entry.id, entry.category] as const),
  ...componentEntries.map((entry) => [entry.id, entry.category] as const),
]);

function categorizedBlock(group: { id: string; name: string; summary: string; install?: string; status?: SearchItem["status"] }[]) {
  return catalogCategories
    .flatMap((category) => {
      const items = group.filter((item) => categoryById.get(item.id) === category.id);
      return items.length === 0 ? [] : [`**${category.label}** — ${category.summary}\n${items.map(itemLine).join("\n")}`];
    })
    .join("\n\n");
}

function skillsBlock() {
  return skillConcerns
    .map((concern) => {
      const skills = practiceSkills.filter((skill) => skill.concern === concern.id);
      if (skills.length === 0) return undefined;
      const lines = skills.map((skill) => {
        const doList = skill.checks.length > 0 ? `\n  - do: ${skill.checks.join(" ")}` : "";
        const avoidList = skill.avoid.length > 0 ? `\n  - avoid: ${skill.avoid.join(" ")}` : "";
        return `- **${skill.title}** — ${skill.goal}${doList}${avoidList}`;
      });
      return `### ${concern.title}\n${lines.join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

const contrastBlock = (base: string) =>
  contrastAgentRules(base)
    .map((rule) => `- ${rule}`)
    .join("\n");

function buildLlmsFull() {
  const { items } = listRegistry().data;
  const base = env.NEXT_PUBLIC_REGISTRY_URL;

  const sections = KIND_SECTIONS.map(({ kind, heading }) => {
    const group = items.filter((item) => item.kind === kind);
    if (group.length === 0) return undefined;
    const body = kind === "Kit" || kind === "Component" ? categorizedBlock(group) : group.map(itemLine).join("\n");
    return `### ${heading}\n${body}`;
  }).filter(Boolean);

  return [
    `# ${siteConfig.name} — extended agent reference`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## How to use this registry",
    "",
    `- MCP: \`${base}/api/mcp\` speaks streamable HTTP Model Context Protocol with \`search_registry\`, \`get_registry_item\` and \`list_registry\`, no authentication; the card is at \`${base}/.well-known/mcp/server-card.json\`.`,
    "- Markdown: request any canonical documentation page with `Accept: text/markdown` to read it as markdown; browsers still get HTML.",
    `- Discover: \`GET ${base}/api/registry\` (or the static \`${base}/r/agent-index.json\`) → the agent-friendly index.`,
    `- shadcn catalog: \`${base}/r/registry.json\` → the official registry schema used by shadcn tooling.`,
    `- Read one item: \`GET ${base}/api/registry/<id>\` → source files, install command, and deps.`,
    `- Search: \`GET ${base}/api/registry/search?q=<query>\`.`,
    `- Skin anatomy: \`${base}/r/contract/index.json\` lists every paint family; read \`${base}/r/contract/<family>.json\` for the family you restyle, its \`.contrast.json\` sibling for what paints behind it, and \`GET ${base}/api/registry/<id>\` for one item's slice. Do not guess selectors.`,
    "- Component knobs: every component paints through registered `--cui-<family>-*` CSS custom properties (e.g. `--cui-button-radius`). A family slice carries its knobs with syntax and recipe defaults; restyle per instance via the typed `style` prop or from a skin, never by overriding Tailwind classes.",
    "- Install: run the item's `install` command (`npx shadcn@latest add <url>`). Installed files are yours to own and edit.",
    "- Skinning: core has neutral defaults. Consumer CSS owns the theme; optional SkinProvider configs and registry presets add scoped behavior and adornments.",
    `- Setting up a repository from scratch: \`${base}/r/${publicPayloads.setupPrompt}\` is the full procedure, including the wiring steps that fail silently when skipped.`,
    `- Working where Control UI is already installed: \`${base}/r/${publicPayloads.controlUiSkill}\` is the installable skill carrying the token contract and the working rules (mirrored at \`skills/control-ui/SKILL.md\`).`,
    "",
    "## Contrast (check this before shipping a skin)",
    "",
    contrastBlock(base),
    "",
    "## Catalog",
    "",
    sections.join("\n\n"),
    "",
    "## Practice rules (how to build well)",
    "",
    skillsBlock(),
    "",
  ]
    .join("\n")
    .replaceAll(env.NEXT_PUBLIC_REGISTRY_URL, siteConfig.url.origin);
}

const checkOnly = process.argv.includes("--check");
const llmsIndex = siteIndexMarkdown();
const llmsFull = buildLlmsFull();
const repoRoot = path.resolve(process.cwd(), "../..");

const targets = [
  { path: path.join(process.cwd(), "public/llms.txt"), expected: llmsIndex },
  { path: path.join(process.cwd(), "public/llms-full.txt"), expected: `${llmsFull.trimEnd()}\n` },
];

const drift: string[] = [];
for (const target of targets) {
  const current = existsSync(target.path) ? readFileSync(target.path, "utf8") : undefined;
  if (current === target.expected) continue;

  if (checkOnly) {
    drift.push(`- ${path.relative(repoRoot, target.path)} is out of date; run \`bun run docs:agents\``);
    continue;
  }
  writeFileSync(target.path, target.expected);
}

if (drift.length > 0) {
  console.error(drift.join("\n"));
  process.exit(1);
}

console.log(checkOnly ? "Agent docs are in sync." : `Agent docs synced (${targets.length} file(s)).`);
