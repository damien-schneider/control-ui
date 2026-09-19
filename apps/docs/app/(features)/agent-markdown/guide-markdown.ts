import { readFileSync } from "node:fs";
import path from "node:path";
import { type GuideCodeId, guideCodeIds } from "@/app/(features)/catalog/guides";
import { guideCodeForKind, languageForGuideCode } from "@/app/(features)/model/registry";
import type { GuidePage } from "@/app/(features)/model/types";

const GUIDES_DIRECTORY = path.join(process.cwd(), "content/guides");
const MARKDOWN_INTEGRATION = "ai-sdk";

function readGuideSource(id: GuidePage["id"]) {
  try {
    return readFileSync(path.join(GUIDES_DIRECTORY, `${id}.mdx`), "utf8");
  } catch {
    return undefined;
  }
}

function isGuideCodeId(value: string): value is GuideCodeId {
  return guideCodeIds.some((id) => id === value);
}

function fencedGuideCode(kind: GuideCodeId) {
  const code = guideCodeForKind(kind, MARKDOWN_INTEGRATION);
  if (!code) return "";
  return `\`\`\`${languageForGuideCode(kind)}\n${code}\n\`\`\``;
}

// MDX guide bodies are indented inside their <GuideSection> wrapper; four leading spaces would read as a code block.
function unindent(source: string) {
  return source.replace(/^ {1,2}/gm, "");
}

function mdxToMarkdown(source: string) {
  const fences: string[] = [];
  // Code blocks must survive the JSX stripping below verbatim: their own content is JSX.
  const stashFence = (block: string) => `⟦fence:${fences.push(block) - 1}⟧`;

  const stripped = source
    .replace(/```[\s\S]*?```/g, stashFence)
    .replace(/[ \t]*<GuideSection[^>]*?title="([^"]+)"[^>]*>/g, (_match, title: string) => `## ${title}\n`)
    .replace(/[ \t]*<GuidePoint>([\s\S]*?)<\/GuidePoint>/g, (_match, body: string) => `- ${body.replace(/\s+/g, " ").trim()}`)
    .replace(/<GuideCheck>([\s\S]*?)<\/GuideCheck>/g, (_match, body: string) => `**Verify**\n${unindent(body).trim()}`)
    .replace(/[ \t]*<GuideCode\s+kind="([^"]+)"[^>]*\/>/g, (match, kind: string) =>
      isGuideCodeId(kind) ? stashFence(fencedGuideCode(kind)) : match,
    )
    .replace(/[ \t]*<\/?[A-Z][A-Za-z]*(?:\s[^>]*?)?\/?>/g, "");

  return unindent(stripped)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/⟦fence:(\d+)⟧/g, (_match, index: string) => fences[Number(index)] ?? "");
}

function sectionsToMarkdown(page: GuidePage) {
  return page.sections
    .map((section) => {
      const code = section.code ? fencedGuideCode(section.code) : "";
      const points = section.points?.map((point) => `- ${point}`).join("\n") ?? "";
      return [`## ${section.title}`, section.body ?? "", points, code].filter(Boolean).join("\n\n");
    })
    .join("\n\n");
}

export function guideMarkdown(page: GuidePage) {
  const source = readGuideSource(page.id);
  const fromMdx = source ? mdxToMarkdown(source) : "";
  return fromMdx || sectionsToMarkdown(page);
}
