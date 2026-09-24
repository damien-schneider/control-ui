import { preview, sourceFile } from "./shared";

export const useCaseKinds = [
  {
    id: "template",
    slug: "templates",
    label: "Templates",
    singularLabel: "Template",
    summary: "Complete screens and workspace shells that establish the primary application layout.",
  },
  {
    id: "pattern",
    slug: "patterns",
    label: "Patterns",
    singularLabel: "Pattern",
    summary: "Focused, installable compositions for one interaction or feature.",
  },
] as const;

export type UseCaseKindId = (typeof useCaseKinds)[number]["id"];

export function getUseCaseKind(id: UseCaseKindId): (typeof useCaseKinds)[number] {
  const kind = useCaseKinds.find((candidate) => candidate.id === id);
  if (!kind) throw new Error(`Unknown use-case kind: ${id}`);
  return kind;
}

export const blockEntries = [
  {
    id: "chat",
    kind: "Block",
    useCaseKind: "template",
    name: "Chat",
    summary: "Controlled chat shell that composes rendered turns and a provider-owned composer.",
    registryKind: "chat-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/chat.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/blocks/chat.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/blocks/chat.ai-sdk.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/chat.tsx", "block")],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/chat").then((mod) => ({ default: mod.ChatExample }))),
  },
  {
    id: "theme-toggle",
    kind: "Block",
    useCaseKind: "pattern",
    name: "Theme toggle",
    summary: "Controlled theme controls with a three-value switch, binary switch, cycle button, and dropdown.",
    registryKind: "theme-toggle-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/theme-toggle.tsx", "example"),
      usage: {
        mastra: sourceFile("Adapter usage", "src/registry/usage/blocks/theme-toggle.tsx", "usage"),
        "ai-sdk": sourceFile("Adapter usage", "src/registry/usage/blocks/theme-toggle.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/control-ui/theme-toggle.tsx", "block")],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/theme-toggle").then((mod) => ({ default: mod.ThemeToggleExample }))),
  },
  {
    id: "coding-agent",
    kind: "Block",
    useCaseKind: "template",
    name: "Coding agent",
    summary: "Desktop coding workspace with project tasks, a focused conversation, and a persistent controlled composer.",
    status: "beta",
    registryKind: "coding-agent-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/coding-agent.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/blocks/coding-agent.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/blocks/coding-agent.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/control-ui/coding-agent.tsx", "block")],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/coding-agent").then((mod) => ({ default: mod.CodingAgentExample }))),
  },
  {
    id: "settings",
    kind: "Block",
    useCaseKind: "template",
    name: "Settings",
    summary: "Searchable multi-page settings shell with responsive navigation and accessible control groups.",
    registryKind: "settings-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/settings.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/blocks/settings.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/blocks/settings.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/control-ui/settings.tsx", "block")],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/settings").then((mod) => ({ default: mod.SettingsExample }))),
  },
  {
    id: "file-explorer",
    kind: "Block",
    useCaseKind: "template",
    name: "File explorer",
    summary: "Finder-inspired file browser with locations, search, resizable columns, breadcrumbs, and an item preview.",
    status: "beta",
    registryKind: "file-explorer-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/file-explorer.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/blocks/file-explorer.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/blocks/file-explorer.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/control-ui/file-explorer.tsx", "block")],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/file-explorer").then((mod) => ({ default: mod.FileExplorerExample })),
    ),
  },
  {
    id: "design-canvas",
    kind: "Block",
    useCaseKind: "template",
    name: "Design canvas",
    summary: "Figma-style editor with layers, an infinite canvas, a floating tool bar, and scrubbable property inputs.",
    status: "beta",
    registryKind: "design-canvas-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/design-canvas.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/blocks/design-canvas.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/blocks/design-canvas.tsx", "usage"),
      },
      files: [sourceFile("Block recipe", "src/registry/blocks/control-ui/design-canvas.tsx", "block")],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/design-canvas").then((mod) => ({ default: mod.DesignCanvasExample })),
    ),
  },
] as const;
