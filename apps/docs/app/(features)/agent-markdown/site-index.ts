import { agentSearch } from "@/app/(features)/agent-discovery/agent-search";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import type { SearchItem } from "@/app/(features)/model/types";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";
import { publicPayloads } from "@/scripts/public-payloads";

const INDEX_SECTIONS: { kind: SearchItem["kind"]; heading: string }[] = [
  { kind: "Guide", heading: "Documentation" },
  { kind: "Component", heading: "Components" },
  { kind: "Kit", heading: "Kits" },
  { kind: "Block", heading: "Templates" },
  { kind: "Extension", heading: "Extensions" },
  { kind: "Skin", heading: "Skins" },
  { kind: "Hook", heading: "Hooks" },
  { kind: "Util", heading: "Utilities" },
  { kind: "Skill", heading: "Practice guides" },
];

function pageLine(page: SearchItem) {
  const status = page.status ? ` Status: ${page.status}.` : "";
  return `- [${page.name}](${absoluteSiteUrl(page.href)}): ${page.summary}${status}`;
}

/** The site index agents read as `/llms.txt` and as the markdown form of the home page. */
export function siteIndexMarkdown() {
  const sections = INDEX_SECTIONS.map(({ kind, heading }) => {
    const pages = docsPageManifest.filter((page) => page.kind === kind);
    if (pages.length === 0) return undefined;
    return `## ${heading}\n\n${pages.map(pageLine).join("\n")}`;
  }).filter(Boolean);

  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${siteConfig.name} installs editable React source through the shadcn CLI. The catalog below is generated from the same page manifest used by the website, sitemap, search, and registry API.`,
    "",
    sections.join("\n\n"),
    "",
    "## Machine-readable indexes",
    "",
    `- [MCP server](${absoluteSiteUrl("/api/mcp")}): Streamable HTTP Model Context Protocol endpoint — \`search_registry\`, \`get_registry_item\`, \`list_registry\`. No authentication. Card at ${absoluteSiteUrl("/.well-known/mcp/server-card.json")}.`,
    `- [OpenAPI description](${absoluteSiteUrl("/openapi.json")}): The registry HTTP API, linked from ${absoluteSiteUrl("/.well-known/api-catalog")}.`,
    "- Markdown pages: request any canonical page with `Accept: text/markdown` to read it as markdown instead of HTML.",
    `- Search: \`GET ${agentSearch.endpoint}\` returns matching pages as markdown with canonical links.`,
    `- [auth.md](${absoluteSiteUrl("/auth.md")}): Registration and credential policy. Nothing to register, nothing to send.`,
    `- [Registry API](${absoluteSiteUrl("/api/registry")}): JSON index of every public catalog item.`,
    `- [Agent index](${absoluteSiteUrl("/r/agent-index.json")}): Static agent-friendly registry metadata.`,
    `- [shadcn registry](${absoluteSiteUrl("/r/registry.json")}): Registry schema consumed by shadcn tooling.`,
    `- [Skin anatomy contract](${absoluteSiteUrl("/r/contract/index.json")}): Index of every paint family. Each family slices its own scopes, parts, states, knobs (the \`--cui-*\` CSS custom properties every component paints through), and adornments, with a \`.contrast.json\` sibling carrying the rendered ancestor chain that paints behind each one.`,
    `- [Theme token contract](${absoluteSiteUrl("/r/theme-contract.json")}): Generated skin token reference.`,
    `- [Setup prompt](${absoluteSiteUrl(`/r/${publicPayloads.setupPrompt}`)}): Paste-ready instructions for a coding agent: read a repository, install ${siteConfig.name} into it, wire the CSS, then design and contrast-check its skin.`,
    "",
    "## Optional",
    "",
    `- [Extended agent reference](${absoluteSiteUrl("/llms-full.txt")}): Detailed catalog, install commands, and ${siteConfig.name} practice rules.`,
  ];
  return `${lines.join("\n")}\n`;
}
