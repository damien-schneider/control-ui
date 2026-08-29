import { skinMetas } from "@/app/(features)/catalog/skins";
import { compositionTreeFromExample } from "@/app/(features)/model/composition-from-example";
import type {
  CompositionExample,
  DocsComponent,
  DocsComponentVersion,
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

function exportedComponentNames(source: string) {
  return [...source.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9]*)/g), ...source.matchAll(/export\s+const\s+([A-Z][A-Za-z0-9]*)\s*=/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

function partsList(parts: string[], ownParts: string[], title: string): CompositionExample[] {
  if (parts.length === 0) return [];
  return [{ title, code: parts.join("\n"), ownParts }];
}

function compositionForSource(source?: SourceFile, example?: SourceFile, composition?: CompositionExample[]): CompositionExample[] {
  const ownParts = source ? exportedComponentNames(source.code) : [];
  if (composition && composition.length > 0) return composition.map((entry) => ({ ...entry, ownParts }));
  if (!source) return [];

  const [root, ...parts] = ownParts;
  if (!root) return [];

  const compoundParts = parts.filter((part) => part.startsWith(root));
  const visibleParts = compoundParts.length > 0 ? compoundParts : parts;
  const tree = example && compositionTreeFromExample(example.code, ownParts);

  if (tree) {
    return [{ title: "Anatomy", code: tree.code, ownParts }, ...partsList(tree.unusedParts, ownParts, "Other exported parts")];
  }

  if (visibleParts.length === 0) return [{ title: "Root", code: root, ownParts }];
  return partsList([root, ...visibleParts], ownParts, "Exported parts");
}

export function primitiveComposition(primitive: DocsPrimitive): CompositionExample[] {
  return compositionForSource(primitive.registry.source, primitive.registry.example, primitive.registry.composition);
}

export function componentComposition(component: DocsComponent): CompositionExample[] {
  return compositionForSource(component.source, component.example);
}

export function publicRegistryHref(kind: string) {
  return `/r/${kind}.json`;
}

// docsOnly skins carry no packManifestPath (no installable pack); `in` guard narrows skinMetas union so only real packs resolve manifest path.
function packManifestPathFor(id: SkinMetaId): string | undefined {
  const meta = skinMetas.find((entry) => entry.id === id);
  return meta && "packManifestPath" in meta ? meta.packManifestPath : undefined;
}

// A pack asserts its three files: without --overwrite the CLI prompts per file, and a non-TTY run silently keeps the old skin.
export function packInstallCommand(id: SkinMetaId): string | undefined {
  if (!packManifestPathFor(id)) return undefined;
  return `npx shadcn@latest add ${env.NEXT_PUBLIC_REGISTRY_URL}/r/skin-${id}.json --overwrite`;
}

// Flat `/r/skin-<id>.json` docs URL for pack's published manifest (undefined for docsOnly).
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

export function guideCodeForKind(code: GuideSection["code"], integration: "mastra" | "ai-sdk") {
  if (code === "skin-install") return packInstallCommand("refined");
  if (code === "skin-scaffold-install") return packInstallCommand("flat");
  if (code === "component-install") return registryInstallCommand("chat-message");
  if (code === "block-install") return registryInstallCommand("chat-block");
  if (code === "update-install") return updateInstallCode();

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
