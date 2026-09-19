import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

type CatalogSurface = {
  namespace: string;
  name: string;
  displayName: string;
  type: string;
  path: string;
  representativeQueries: string[];
};

const catalogSurfaces: CatalogSurface[] = [
  {
    namespace: "server",
    name: "control-ui-mcp",
    displayName: "Control UI MCP server",
    type: "application/mcp-server-card+json",
    path: "/.well-known/mcp/server-card.json",
    representativeQueries: [
      "connect an MCP client to the Control UI registry",
      "which tools does the Control UI MCP server expose",
      "search Control UI components over MCP",
    ],
  },
  {
    namespace: "api",
    name: "registry-openapi",
    displayName: "Control UI registry API (OpenAPI)",
    type: "application/json",
    path: "/openapi.json",
    representativeQueries: [
      "how do I call the Control UI registry HTTP API",
      "what does GET /api/registry/{id} return",
      "search the Control UI registry over HTTP",
    ],
  },
  {
    namespace: "skill",
    name: "agent-skills-index",
    displayName: "Control UI agent skill index",
    type: "application/json",
    path: "/.well-known/agent-skills/index.json",
    representativeQueries: [
      "install the Control UI agent skill",
      "which skills does Control UI publish for coding agents",
      "teach my coding agent to theme Control UI",
    ],
  },
  {
    namespace: "doc",
    name: "llms-full",
    displayName: "Control UI extended agent reference",
    type: "text/plain",
    path: "/llms-full.txt",
    representativeQueries: [
      "read the full Control UI documentation as plain text",
      "how do I author a Control UI skin",
      "what are the Control UI component authoring rules",
    ],
  },
  {
    namespace: "registry",
    name: "shadcn-registry",
    displayName: "Control UI shadcn registry",
    type: "application/json",
    path: "/r/registry.json",
    representativeQueries: [
      "add a Control UI component with the shadcn CLI",
      "list every installable Control UI registry item",
      "where is the shadcn manifest for a Control UI block",
    ],
  },
];

export const aiCatalogManifest = {
  specVersion: "1.0",
  host: { displayName: siteConfig.name, identifier: `did:web:${siteConfig.url.hostname}` },
  entries: catalogSurfaces.map((surface) => ({
    identifier: `urn:air:${siteConfig.url.hostname}:${surface.namespace}:${surface.name}`,
    displayName: surface.displayName,
    type: surface.type,
    url: absoluteSiteUrl(surface.path),
    representativeQueries: surface.representativeQueries,
  })),
};
