import { mcpEndpointPath } from "@/app/(features)/agent-discovery/mcp-server";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

export function buildAuthMarkdown() {
  return `# auth.md

You are an agent. ${siteConfig.name} needs no registration and no credentials: every agent surface is public and
anonymous. There is nothing to negotiate before you call it.

## Audience

Coding agents that read the catalog, install components into a repository, or answer questions about ${siteConfig.name}.
${siteConfig.name} ships source you own, installed from a shadcn-compatible registry. Nothing is stored on your behalf
and no account exists to act on behalf of a user.

## Registration

None. There is no registration or provisioning endpoint. \`POST /agent/identity\` and \`POST /agent/auth\` do not exist
and answer 404.

## Supported methods

\`anonymous\` — send the request. No claim ceremony, no identity assertion, no client registration.

OAuth is not published for this origin: no resource here is protected, so there is no authorization server, no
Protected Resource Metadata, and no issuer to trust. Treat the absence as intentional rather than as a missing document.

## Credential use

${siteConfig.name} issues no credentials and reads none. An \`Authorization\` header is ignored, never required, and
never returns 401. Do not attempt a token exchange; there is no token endpoint.

## What to call instead

- MCP, streamable HTTP, unauthenticated: ${absoluteSiteUrl(mcpEndpointPath)} — tools \`search_registry\`,
  \`get_registry_item\`, \`list_registry\`. Server card: ${absoluteSiteUrl("/.well-known/mcp/server-card.json")}
- HTTP API: ${absoluteSiteUrl("/api/registry")}, described by ${absoluteSiteUrl("/openapi.json")}
- Documentation as markdown: request any page with \`Accept: text/markdown\`
- Everything machine-readable this origin serves: ${absoluteSiteUrl("/.well-known/ai-catalog.json")}

## Etiquette

Send a \`User-Agent\` that identifies your agent so operators can tell traffic apart. No quota is issued and no API key
exists, so platform-level abuse protection is the only limit you can hit.
`;
}
