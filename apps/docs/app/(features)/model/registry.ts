import { skinMetas } from "@/app/(features)/catalog/skins";
import type {
  DocsComponent,
  DocsComponentVersion,
  GuideSection,
  RegistryKindId,
  SkinMetaId,
  SourceFile,
} from "@/app/(features)/model/types";
import { env } from "@/env";

export type RegistryKind = RegistryKindId;

export type InstallCommand = {
  label: string;
  value: string;
};

export function supportFilesFor(component: DocsComponent, version?: DocsComponentVersion): SourceFile[] {
  if (version) return version.supportFiles;
  return [...(component.hook ? [component.hook] : []), ...(component.supportFiles ?? [])];
}

export function filesFor(component: DocsComponent, version?: DocsComponentVersion) {
  return [version ? version.source : component.source, ...supportFilesFor(component, version)];
}

export function installedDependencyFiles(files: SourceFile[]): SourceFile[] {
  return files.filter((file) => file.slot !== "recipe-css");
}

export function publicRegistryHref(kind: string) {
  return `/r/${kind}.json`;
}

function packManifestPathFor(id: SkinMetaId): string | undefined {
  const meta = skinMetas.find((entry) => entry.id === id);
  return meta && "packManifestPath" in meta ? meta.packManifestPath : undefined;
}

export function packInstallCommand(id: SkinMetaId): string | undefined {
  if (!packManifestPathFor(id)) return undefined;
  return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/skin-${id}.json --overwrite`;
}

export function packManifestHref(id: SkinMetaId): string | undefined {
  return packManifestPathFor(id) ? publicRegistryHref(`skin-${id}`) : undefined;
}

export function fullInstallCommand(id: SkinMetaId): string | undefined {
  if (id === "none") return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/all.json`;
  if (!packManifestPathFor(id)) return undefined;
  return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/all-${id}.json`;
}

export function fullInstallManifestHref(id: SkinMetaId): string | undefined {
  if (id === "none") return publicRegistryHref("all");
  return packManifestPathFor(id) ? publicRegistryHref(`all-${id}`) : undefined;
}

function registryManifestUrl(path: string) {
  return `${env.NEXT_PUBLIC_REGISTRY_URL}${path}`;
}

export function updateInstallCode() {
  const manifest = registryManifestUrl(publicRegistryHref("update"));
  return `# Preview upstream changes against your installed sources
npx shadcn@latest add ${manifest} --diff

# Refresh every installed source; skin files stay untouched
npx shadcn@latest add ${manifest} --overwrite`;
}

export function registryInstallCommand(kind: RegistryKind) {
  return `npx shadcn@latest add ${registryManifestUrl(publicRegistryHref(kind))}`;
}

export function registryInstallCommands(kind: RegistryKind): InstallCommand[] {
  return [{ label: "Registry command", value: registryInstallCommand(kind) }];
}

export function languageForGuideCode(kind: NonNullable<GuideSection["code"]>) {
  if (kind.endsWith("-install") || kind.startsWith("agent-")) return "bash";
  return "tsx";
}

export function guideCodeForKind(code: GuideSection["code"], integration: "mastra" | "ai-sdk") {
  if (code === "skin-install") return packInstallCommand("refined");
  if (code === "skin-scaffold-install") return fullInstallCommand("none");
  if (code === "component-install") return registryInstallCommand("chat-message");
  if (code === "block-install") return registryInstallCommand("chat-block");
  if (code === "update-install") return updateInstallCode();
  if (code === "all-install") return fullInstallCommand("none");
  if (code === "skill-install") return `npx skills add ${env.NEXT_PUBLIC_REGISTRY_URL}`;

  if (code === "component-usage") {
    return integration === "mastra"
      ? `import type { MastraDBMessage } from "@mastra/core/agent/message-list";
import { MessageFactory, type MessageRoleRendererProps, type MessageRoleRenderers } from "@mastra/react";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";

function MessageFrame({ from, children }: MessageRoleRendererProps & { from: "user" | "assistant" | "system" }) {
  return (
    <ChatMessage from={from}>
      <ChatMessageRow>
        <ChatMessageBody>
          <ChatMessageContent>{children}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
  );
}

const roles = {
  User: (props: MessageRoleRendererProps) => <MessageFrame {...props} from="user" />,
  Assistant: (props: MessageRoleRendererProps) => <MessageFrame {...props} from="assistant" />,
  System: (props: MessageRoleRendererProps) => <MessageFrame {...props} from="system" />,
  Signal: () => null,
} satisfies MessageRoleRenderers;

export function Message({ message }: { message: MastraDBMessage }) {
  return (
    <MessageFactory
      message={message}
      roles={roles}
      Text={({ text }) => <span>{text}</span>}
      fallback={(part) => <span>Unsupported message part: {part.type}</span>}
    />
  );
}`
      : `import type { UIMessage } from "ai";

export function Message({ message }: { message: UIMessage }) {
  return (
    <ChatMessage from={message.role}>
      <ChatMessageRow>
        <ChatMessageBody>
          <ChatMessageContent>{message.parts.map((part) => part.type === "text" ? part.text : null)}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
  );
}`;
  }

  if (code === "runtime-agnostic-message") {
    return `import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageRow,
} from "@/components/control-ui/chat-message";

export function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <ChatMessage from="assistant">
      <ChatMessageRow>
        <ChatMessageAvatar>AI</ChatMessageAvatar>
        <ChatMessageBody>
          <ChatMessageHeader>Assistant</ChatMessageHeader>
          <ChatMessageContent>{children}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
  );
}`;
  }

  const base = env.NEXT_PUBLIC_REGISTRY_URL;

  if (code === "agent-endpoints") {
    return `# List every registry item (id, kind, summary, install command)
curl ${base}/api/registry

# Read one item — install commands, parsed deps, readable source files
curl ${base}/api/registry/chat

# Search the registry
curl "${base}/api/registry/search?q=chat"

# API responses use the same envelope:
#   { "type": "item", "data": { … } }
# A miss is a 404 carrying a stable code:
#   { "error": "…", "code": "ERR_UNKNOWN_ITEM", "suggestions": [ … ] }`;
  }

  if (code === "agent-mcp") {
    return `# Streamable HTTP MCP endpoint — tools: search_registry, get_registry_item, list_registry
${base}/api/mcp

# Server card describing the endpoint, its tools, and that no authentication is required
curl ${base}/.well-known/mcp/server-card.json

# Claude Code
claude mcp add --transport http control-ui ${base}/api/mcp`;
  }

  if (code === "agent-markdown") {
    return `# Any documentation page answers in markdown when you ask for it
curl -H "Accept: text/markdown" ${base}/primitives/button

# The HTML page stays the default for browsers
curl -H "Accept: text/html" ${base}/primitives/button`;
  }

  if (code === "agent-llms") {
    return `# Official shadcn registry catalog
${base}/r/registry.json

# One installable item manifest
${base}/r/chat-message.json

# Concise linked documentation index
${base}/llms.txt

# Extended catalog, install commands, and practice rules
${base}/llms-full.txt

# Static agent-friendly registry metadata
${base}/r/agent-index.json

# OpenAPI description of the HTTP API, the registration policy, and the discovery manifests that point at everything above
${base}/openapi.json
${base}/auth.md
${base}/.well-known/api-catalog
${base}/.well-known/ai-catalog.json`;
  }

  return undefined;
}
