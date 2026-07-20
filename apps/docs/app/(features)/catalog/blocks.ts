import { type IntegrationPreviewProps, preview, sourceFile } from "./shared";

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
      files: [
        sourceFile("Block recipe", "src/registry/blocks/chat.tsx", "block"),
        sourceFile("Action bar", "src/registry/sources/control-ui/action-bar.tsx", "action-bar"),
        sourceFile("Inline attachment", "src/registry/sources/control-ui/inline-attachment.tsx", "inline-attachment"),
        sourceFile("Markdown block", "src/registry/sources/control-ui/markdown-block.tsx", "markdown-block"),
        sourceFile("Chat layout", "src/registry/sources/control-ui/chat-layout.tsx", "chat-layout"),
        sourceFile("Base UI Collapsible slot", "src/registry/sources/control-ui/ui/collapsible.tsx", "ui-collapsible"),
        sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "ui-button"),
        sourceFile("Chat composer", "src/registry/sources/control-ui/chat-composer.tsx", "chat-composer"),
        sourceFile("Chat message", "src/registry/sources/control-ui/chat-message.tsx", "chat-message"),
      ],
    },
    composition: [
      {
        title: "Controlled shell",
        description: "The block owns layout only. Usage examples render native provider messages at the application boundary.",
        code: `ChatBlock
├── ChatLayout
│   └── ChatThread
│       └── children (rendered turns)
└── composer`,
      },
    ],
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/chat").then((mod) => ({ default: mod.ChatExample })),
    ),
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
      files: [
        sourceFile("Block recipe", "src/registry/blocks/control-ui/theme-toggle.tsx", "block"),
        sourceFile("Switch slot", "src/registry/sources/control-ui/ui/switch.tsx", "ui-switch"),
        sourceFile("Dropdown menu slot", "src/registry/sources/control-ui/ui/dropdown-menu.tsx", "ui-dropdown-menu"),
        sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "ui-button"),
      ],
    },
    composition: [
      {
        title: "Controlled controls",
        description: "Every exported control receives value and onValueChange from the host app.",
        code: `Theme controls
├── ThemeSegmentedSwitch
│   ├── input type="radio"
│   └── icon / label
├── ThemeSwitch
│   └── Switch
├── ThemeToggle
│   └── Button
└── ThemeDropdown
    ├── MenuTrigger
    └── MenuContent
        └── MenuItem`,
      },
    ],
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/theme-toggle").then((mod) => ({ default: mod.ThemeToggleExample })),
    ),
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
      files: [
        sourceFile("Block recipe", "src/registry/blocks/control-ui/coding-agent.tsx", "block"),
        sourceFile("Chat layout", "src/registry/sources/control-ui/chat-layout.tsx", "chat-layout"),
        sourceFile("Sidebar slot", "src/registry/sources/control-ui/ui/sidebar.tsx", "ui-sidebar"),
        sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "ui-button"),
      ],
    },
    composition: [
      {
        title: "Coding workspace shell",
        description:
          "The block owns responsive task navigation and layout while the host controls task identity, messages, and composer behavior.",
        code: `CodingAgentBlock
├── SidebarProvider
│   ├── Sidebar
│   │   ├── navigation
│   │   └── projects
│   │       └── tasks
│   └── SidebarInset
│       ├── task header
│       └── children
└── CodingAgentConversation
    └── ChatLayout
        ├── ChatThread
        │   └── rendered turns or CodingAgentEmptyState
        └── composer`,
      },
    ],
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/coding-agent").then((mod) => ({ default: mod.CodingAgentExample })),
    ),
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
      files: [
        sourceFile("Block recipe", "src/registry/blocks/control-ui/settings.tsx", "block"),
        sourceFile("Definitions and search", "src/registry/blocks/control-ui/settings-data.ts", "settings-data"),
        sourceFile("Field slot", "src/registry/sources/control-ui/ui/field.tsx", "ui-field"),
        sourceFile("Sidebar slot", "src/registry/sources/control-ui/ui/sidebar.tsx", "ui-sidebar"),
        sourceFile("Input group slot", "src/registry/sources/control-ui/ui/input-group.tsx", "ui-input-group"),
      ],
    },
    composition: [
      {
        title: "Searchable settings shell",
        description: "One definition tree drives navigation, search metadata, sections, labels, and controlled app settings.",
        code: `SettingsBlock
├── SidebarProvider
│   ├── Sidebar
│   │   ├── SettingsSearch
│   │   └── SettingsNavigation
│   └── SidebarInset
│       └── SettingsPage
│           └── FieldSet
│               ├── FieldLegend
│               └── FieldGroup
│                   └── Field orientation="responsive"
│                       ├── FieldContent
│                       │   ├── FieldLabel
│                       │   └── FieldDescription
│                       └── consumer control`,
      },
    ],
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/settings").then((mod) => ({ default: mod.SettingsExample })),
    ),
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
      files: [
        sourceFile("Block recipe", "src/registry/blocks/control-ui/file-explorer.tsx", "block"),
        sourceFile("Definitions and traversal", "src/registry/blocks/control-ui/file-explorer-data.ts", "file-explorer-data"),
        sourceFile("Resizable slot", "src/registry/sources/control-ui/ui/resizable.tsx", "ui-resizable"),
        sourceFile("Sidebar slot", "src/registry/sources/control-ui/ui/sidebar.tsx", "ui-sidebar"),
        sourceFile("Scroll area slot", "src/registry/sources/control-ui/ui/scroll-area.tsx", "ui-scroll-area"),
        sourceFile("Input group slot", "src/registry/sources/control-ui/ui/input-group.tsx", "ui-input-group"),
        sourceFile("Button slot", "src/registry/sources/control-ui/ui/button.tsx", "ui-button"),
      ],
    },
    composition: [
      {
        title: "Column file browser",
        description: "Recursive entry data resolves into one resizable column per selected folder, followed by the selected item preview.",
        code: `FileExplorerBlock
├── SidebarProvider
│   ├── Sidebar
│   │   └── grouped locations
│   └── SidebarInset
│       ├── toolbar + search
│       ├── address breadcrumb
│       ├── ResizablePanelGroup
│       │   ├── folder columns
│       │   └── item preview
│       └── path status bar
└── search results (when querying)`,
      },
    ],
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/file-explorer").then((mod) => ({ default: mod.FileExplorerExample })),
    ),
  },
] as const;
