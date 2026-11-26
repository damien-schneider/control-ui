import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

/** Search for Agents: one GET endpoint that answers in markdown, advertised in HTML meta tags and markdown front matter. */
export const agentSearch = {
  instructions: `Search every ${siteConfig.name} documentation page by keyword instead of crawling. Results are Markdown with canonical links; request a link with Accept: text/markdown to read that page as markdown.`,
  endpoint: `${absoluteSiteUrl("/.well-known/search")}?q={query}`,
  method: "GET",
  documentation: absoluteSiteUrl("/agent-surface#markdown"),
} as const;

const agentSearchEntries = Object.entries(agentSearch);

export const agentSearchMetaTags = agentSearchEntries.map(([key, content]) => ({ name: `agent:${key}`, content }));

export const agentSearchFrontMatter = [
  "---",
  "agent:",
  ...agentSearchEntries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`),
  "---",
  "",
].join("\n");
