import { cacheLife } from "next/cache";
import { absoluteSiteUrl, isProductionDeployment, siteConfig } from "@/lib/site-config";

const aiCrawlerUserAgents = ["GPTBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

const contentSignal = "Content-Signal: search=yes, ai-input=yes, ai-train=yes";

// Next's metadata robots cannot emit Content-Signal or Agentmap directives.
export async function GET() {
  return new Response(await robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function robotsTxt() {
  "use cache";
  cacheLife("max");

  const indexable = isProductionDeployment();
  const access = indexable ? ["Allow: /", "Disallow: /api/gaps"] : ["Disallow: /"];
  const groups = [["User-Agent: *", contentSignal, ...access]];

  if (indexable) {
    groups.push([...aiCrawlerUserAgents.map((userAgent) => `User-Agent: ${userAgent}`), contentSignal, ...access]);
  }

  const references = [
    `Host: ${siteConfig.url.origin}`,
    `Sitemap: ${absoluteSiteUrl("/sitemap.xml")}`,
    `Agentmap: ${absoluteSiteUrl("/.well-known/ai-catalog.json")}`,
  ];

  return [...groups, references].map((lines) => `${lines.join("\n")}\n`).join("\n");
}
