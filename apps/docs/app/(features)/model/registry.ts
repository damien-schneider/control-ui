import { componentEntries } from "@/app/(features)/catalog/components";
import { skinMetas } from "@/app/(features)/catalog/skins";
import type {
  CompositionExample,
  DocsComponent,
  DocsPrimitive,
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

export function filesFor(component: DocsComponent) {
  return [...(component.hook ? [component.hook] : []), component.source, ...(component.supportFiles ?? [])];
}

export function resolvePrimitives(component: DocsComponent, primitives: DocsPrimitive[]) {
  return (component.usesPrimitives ?? [])
    .map((id) => primitives.find((primitive) => primitive.id === id))
    .filter((primitive): primitive is DocsPrimitive => Boolean(primitive));
}

function exportedComponentNames(source: string) {
  return [...source.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9]*)/g), ...source.matchAll(/export\s+const\s+([A-Z][A-Za-z0-9]*)\s*=/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

function compositionTree(root: string, parts: string[]) {
  if (parts.length === 0) return root;

  return [
    root,
    ...parts.map((part, index) => {
      const prefix = index === parts.length - 1 ? "└──" : "├──";
      return `${prefix} ${part}`;
    }),
  ].join("\n");
}

function compositionForSource(source?: SourceFile, composition?: CompositionExample[]): CompositionExample[] {
  if (composition && composition.length > 0) return composition;
  if (!source) return [];

  const [root, ...parts] = exportedComponentNames(source.code);
  if (!root) return [];

  const compoundParts = parts.filter((part) => part.startsWith(root));
  const visibleParts = compoundParts.length > 0 ? compoundParts : parts;

  return [
    {
      title: visibleParts.length > 0 ? "Parts" : "Root",
      description:
        visibleParts.length > 0 ? "Exported compound parts from the installed source." : "Single-slot surface with no nested parts.",
      code: compositionTree(root, visibleParts),
    },
  ];
}

export function primitiveComposition(primitive: DocsPrimitive): CompositionExample[] {
  return compositionForSource(primitive.registry.source, primitive.registry.composition);
}

export function componentComposition(component: DocsComponent): CompositionExample[] {
  return compositionForSource(component.source);
}

export function componentHrefForFile(file: SourceFile) {
  const componentId = componentEntries.find((entry) => file.path.endsWith(`/${entry.id}.tsx`))?.id;
  return componentId ? `/ai/${componentId}` : undefined;
}

export function publicRegistryHref(kind: string) {
  return `/r/${kind}.json`;
}

// docsOnly skins carry no packManifestPath (no installable pack); `in` guard narrows skinMetas union so only real packs resolve a manifest path.
function packManifestPathFor(id: SkinMetaId): string | undefined {
  const meta = skinMetas.find((entry) => entry.id === id);
  return meta && "packManifestPath" in meta ? meta.packManifestPath : undefined;
}

// Public `npx shadcn add` command for a skin pack (ships skin.json); lives here (not theme drawer) so both read one source.
export function packInstallCommand(id: SkinMetaId): string | undefined {
  if (!packManifestPathFor(id)) return undefined;
  return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/skin-${id}.json`;
}

// Flat `/r/skin-<id>.json` docs URL for a pack's published manifest (undefined for docsOnly).
export function packManifestHref(id: SkinMetaId): string | undefined {
  return packManifestPathFor(id) ? publicRegistryHref(`skin-${id}`) : undefined;
}

export function fullInstallCommand(id: SkinMetaId): string | undefined {
  if (!packManifestPathFor(id)) return undefined;
  return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/all-${id}.json`;
}

export function fullInstallManifestHref(id: SkinMetaId): string | undefined {
  return packManifestPathFor(id) ? publicRegistryHref(`all-${id}`) : undefined;
}

function registryManifestUrl(path: string) {
  return `${env.NEXT_PUBLIC_REGISTRY_URL}${path}`;
}

export function registryInstallCommand(kind: RegistryKind) {
  return `npx shadcn@latest add ${registryManifestUrl(publicRegistryHref(kind))}`;
}

export function registryInstallCommands(kind: RegistryKind): InstallCommand[] {
  return [{ label: "Registry command", value: registryInstallCommand(kind) }];
}

export function guideCodeForKind(code: GuideSection["code"], integration: "mastra" | "ai-sdk") {
  if (code === "skin-install") return packInstallCommand("refined");
  if (code === "component-install") return registryInstallCommand("chat-message");
  if (code === "block-install") return registryInstallCommand("chat-block");

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
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";

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
${base}/r/agent-index.json`;
  }

  return undefined;
}

export function guideCode(section: GuideSection, integration: "mastra" | "ai-sdk") {
  return guideCodeForKind(section.code, integration);
}
