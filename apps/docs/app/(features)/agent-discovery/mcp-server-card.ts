import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";
import { mcpEndpointPath, mcpServerInfo, mcpToolCards } from "./mcp-server";

const serverCardSchema = "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json";

export function buildMcpServerCard() {
  const title = `${siteConfig.name} registry`;
  const description = `Model Context Protocol server for the ${siteConfig.name} registry. Search, list and read the components, blocks, primitives, hooks, utils, skins and guides that ${siteConfig.name} installs as source you own.`;
  return {
    $schema: serverCardSchema,
    name: mcpServerInfo.name,
    version: mcpServerInfo.version,
    title,
    description,
    websiteUrl: absoluteSiteUrl("/"),
    serverInfo: { ...mcpServerInfo, title, description },
    transport: { type: "streamable-http", endpoint: absoluteSiteUrl(mcpEndpointPath) },
    capabilities: ["tools"],
    tools: mcpToolCards,
    authentication: { required: false },
    documentation: absoluteSiteUrl("/llms.txt"),
  };
}
