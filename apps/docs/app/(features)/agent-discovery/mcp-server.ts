import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { SearchItem } from "@/app/(features)/model/types";
import { getRegistryItem, isRegistryError } from "@/app/(features)/registry-api/api";
import { listRegistry, searchRegistry } from "@/app/(features)/registry-api/registry-index";
import { absoluteSiteUrl } from "@/lib/site-config";

export const mcpEndpointPath = "/api/mcp";

export const mcpServerInfo = { name: "control-ui-registry", version: "1.0.0" };

export const mcpServerInstructions =
  "Control UI ships as source you own, installed from a shadcn-compatible registry. Use list_registry to see everything available, search_registry to find an entry by keyword, and get_registry_item to read one entry's install command, dependencies and source files before writing code against it.";

type McpToolCard = { name: string; title: string; description: string };

const searchRegistryTool: McpToolCard = {
  name: "search_registry",
  title: "Search the Control UI registry",
  description:
    "Search Control UI components, blocks, primitives, hooks, utils, skins and guides by keyword. Returns matching entries as id, name, kind, summary and href.",
};

const getRegistryItemTool: McpToolCard = {
  name: "get_registry_item",
  title: "Read one Control UI registry entry",
  description:
    "Read a single Control UI registry entry by id: its install commands, registry manifest URL, dependencies, source files and skin anatomy. Unknown ids come back as an error listing the closest ids.",
};

const listRegistryTool: McpToolCard = {
  name: "list_registry",
  title: "List the Control UI registry",
  description:
    "List every Control UI registry entry — components, blocks, primitives, hooks, utils, skins and guides — plus the skin and theme contract URLs and the full-install bundles.",
};

export const mcpToolCards: McpToolCard[] = [searchRegistryTool, getRegistryItemTool, listRegistryTool];

const searchRegistryInput = z.object({
  query: z.string().describe("Keywords matched against registry entry ids, names and summaries. An empty query returns the whole corpus."),
});

const getRegistryItemInput = z.object({
  id: z.string().describe('Registry entry id, for example "button", "chat-input" or "use-copy-to-clipboard".'),
});

function describedBy({ title, description }: McpToolCard) {
  return { title, description };
}

function itemSummary(item: SearchItem) {
  return { id: item.id, name: item.name, kind: item.kind, summary: item.summary, href: absoluteSiteUrl(item.href) };
}

type TextToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

function jsonContent(payload: unknown): TextToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function errorContent(text: string): TextToolResult {
  return { content: [{ type: "text", text }], isError: true };
}

export function registerRegistryTools(server: McpServer) {
  server.registerTool(searchRegistryTool.name, { ...describedBy(searchRegistryTool), inputSchema: searchRegistryInput }, ({ query }) => {
    const matches = searchRegistry(query);
    return jsonContent({ type: "search", data: { query, count: matches.length, items: matches.map(itemSummary) } });
  });

  server.registerTool(getRegistryItemTool.name, { ...describedBy(getRegistryItemTool), inputSchema: getRegistryItemInput }, ({ id }) => {
    const result = getRegistryItem(id);
    if (isRegistryError(result)) {
      const suggestions = result.suggestions.map((suggestion) => `${suggestion.id} (${suggestion.reason})`).join(", ");
      return errorContent(suggestions ? `${result.error}. Closest matches: ${suggestions}.` : `${result.error}.`);
    }
    return jsonContent(result);
  });

  server.registerTool(listRegistryTool.name, describedBy(listRegistryTool), () => {
    const { data } = listRegistry();
    const items = data.items.map((item) => ({ ...itemSummary(item), install: item.install }));
    return jsonContent({
      type: "index",
      data: { count: data.count, contracts: data.contracts, fullInstalls: data.fullInstalls, items },
    });
  });
}
