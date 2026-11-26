import type { SearchItem } from "@/app/(features)/model/types";
import { searchRegistry } from "@/app/(features)/registry-api/registry-index";
import { absoluteSiteUrl } from "@/lib/site-config";

function resultLine(item: SearchItem) {
  const status = item.status ? ` Status: ${item.status}.` : "";
  return `- [${item.name}](${absoluteSiteUrl(item.href)}) — ${item.kind}: ${item.summary}${status}`;
}

function searchMarkdown(query: string) {
  const results = searchRegistry(query);
  const heading = `# Search results for: ${JSON.stringify(query)}`;
  if (results.length === 0) return `${heading}\n\nNo matching pages. The full page index is at ${absoluteSiteUrl("/llms.txt")}.\n`;
  const count = results.length === 1 ? "1 result" : `${results.length} results`;
  return `${heading}\n\n${count}. Request a result URL with \`Accept: text/markdown\` to read that page as markdown.\n\n${results.map(resultLine).join("\n")}\n`;
}

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  return new Response(searchMarkdown(query), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
