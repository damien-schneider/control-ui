import { docsPageForPath, docsPageManifest } from "@/app/(features)/catalog/pages";
import { getDocsData } from "@/app/(features)/model/data";
import type { DocsSkill, SearchItem } from "@/app/(features)/model/types";
import { getRegistryItem, isRegistryError, type RegistryItemData } from "@/app/(features)/registry-api/api";
import { registryItemIdFor } from "@/app/(features)/registry-api/registry-index";
import { absoluteSiteUrl } from "@/lib/site-config";
import { guideMarkdown } from "./guide-markdown";

function skillBody(skill: DocsSkill) {
  return [
    `## Goal\n\n${skill.goal}`,
    skill.checks.length > 0 ? `## Do\n\n${skill.checks.map((check) => `- ${check}`).join("\n")}` : "",
    skill.avoid.length > 0 ? `## Avoid\n\n${skill.avoid.map((item) => `- ${item}`).join("\n")}` : "",
    skill.source ? `## Reference implementation\n\n- ${skill.source.label} — \`${skill.source.path}\`` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function registryItemBody(item: RegistryItemData) {
  const deps = item.deps?.dependencies ?? [];
  const registryDeps = item.deps?.registryDependencies ?? [];
  return [
    `## Install\n\n${item.install.map((command) => `\`\`\`bash\n${command.value}\n\`\`\``).join("\n\n")}`,
    deps.length > 0 ? `## npm dependencies\n\n${deps.map((dep) => `- \`${dep}\``).join("\n")}` : "",
    registryDeps.length > 0 ? `## Registry dependencies\n\n${registryDeps.map((dep) => `- \`${dep}\``).join("\n")}` : "",
    item.files.length > 0 ? `## Installed source\n\n${item.files.map((file) => `- ${file.label} — \`${file.path}\``).join("\n")}` : "",
    item.anatomy
      ? `## Skin anatomy\n\n- Contract slice: ${item.anatomy.contractUrl}\n- Selector pattern: \`${item.anatomy.selectorPattern}\``
      : "",
    `## Machine-readable\n\n- Full item with source: ${absoluteSiteUrl(`/api/registry/${item.id}`)}${item.manifestUrl ? `\n- shadcn manifest: ${item.manifestUrl}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function childPagesBody(page: SearchItem) {
  const children = docsPageManifest.filter((entry) => entry.href.startsWith(`${page.href}/`));
  if (children.length === 0) return "";
  return `## Pages\n\n${children.map((child) => `- [${child.name}](${absoluteSiteUrl(child.href)}): ${child.summary}`).join("\n")}`;
}

function pageBody(page: SearchItem) {
  if (page.kind === "Guide") {
    const guide = getDocsData().guides.find((entry) => entry.id === page.id);
    if (guide) return guideMarkdown(guide);
  }
  if (page.kind === "Skill") {
    const skill = getDocsData().skills.find((entry) => entry.id === page.id);
    if (skill) return skillBody(skill);
  }
  const registryId = registryItemIdFor(page);
  if (registryId) {
    const result = getRegistryItem(registryId);
    if (!isRegistryError(result)) return registryItemBody(result.data);
  }
  return childPagesBody(page);
}

export function markdownForPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = docsPageForPath(normalized);
  if (!page) return undefined;

  const status = page.status ? `\n\nStatus: ${page.status}.` : "";
  const heading = `# ${page.name}\n\n> ${page.summary}${status}\n\nCanonical page: ${absoluteSiteUrl(page.href)}`;
  const body = pageBody(page);
  return body ? `${heading}\n\n${body}\n` : `${heading}\n`;
}
