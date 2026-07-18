import { type IntegrationPreviewProps, preview, sourceFile } from "./shared";

export const componentEntries = [
  {
    id: "chat-message",
    kind: "Agent",
    name: "ChatMessage",
    summary: "Composable chat message with typed role, density, and tone state.",
    registryKind: "chat-message",
    paths: {
      example: sourceFile("Example", "src/registry/examples/chat-message.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/chat-message.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/chat-message.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-chat-message.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-message.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/chat-message").then((mod) => ({ default: mod.ChatMessageExample })),
    ),
    previewClassName: "flex min-h-[280px] items-start justify-center",
  },
  {
    id: "chat-input",
    kind: "Agent",
    name: "ChatInput",
    summary: "Prompt composer with controlled text, submit state, and trigger-menu support.",
    registryKind: "chat-input",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/chat-input.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/chat-input.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/chat-input.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-chat-input.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-input.tsx", "component"),
      supportFiles: [
        sourceFile("Rich editor (ProseMirror)", "src/registry/sources/control-ui/chat-input-editor.tsx", "component"),
        sourceFile("Editor schema", "src/registry/sources/control-ui/chat-input-editor/schema.ts", "support"),
        sourceFile("Extension contract", "src/registry/sources/control-ui/chat-input-editor/types.ts", "support"),
        sourceFile("Mention extension", "src/registry/sources/control-ui/chat-input-editor/extensions/mention.tsx", "support"),
        sourceFile("Exit-animation ghost", "src/registry/sources/control-ui/chat-input-editor/ghost.ts", "support"),
        sourceFile("Editor motion (blur choreography)", "src/registry/sources/control-ui/chat-input-editor.css", "editor-css"),
      ],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/chat-input").then((mod) => ({ default: mod.ChatInputExample })),
    ),
    usesPrimitives: ["button", "scroll-area", "trigger-menu"],
  },
  {
    id: "chat-input-attachment",
    kind: "Agent",
    name: "ChatInputAttachment",
    summary: "Composer attachment rail with file previews, upload progress, and removal.",
    registryKind: "chat-input-attachment",
    paths: {
      example: sourceFile("Example", "src/registry/examples/chat-input-attachment.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/chat-input-attachment.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/chat-input-attachment.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-input-attachment.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/chat-input-attachment").then((mod) => ({ default: mod.ChatInputAttachmentExample })),
    ),
    usesPrimitives: ["button", "scroll-area"],
  },
  {
    id: "user-ask",
    kind: "Agent",
    name: "UserAsk",
    summary: "Keyboard-first agent question panel that temporarily replaces the chat composer inside its container.",
    registryKind: "user-ask",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/user-ask.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/user-ask.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/user-ask.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-user-ask.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/user-ask.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/user-ask").then((mod) => ({ default: mod.UserAskExample })),
    ),
    usesPrimitives: ["button", "kbd"],
  },
  {
    id: "task-list",
    kind: "Agent",
    name: "TaskList",
    summary: "Floating agent task progress pill above the composer that expands into the full task list.",
    registryKind: "task-list",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/task-list.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/task-list.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/task-list.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/task-list.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/task-list").then((mod) => ({ default: mod.TaskListExample })),
    ),
    usesPrimitives: ["collapsible"],
  },
  {
    id: "audio-recorder",
    kind: "Agent",
    name: "AudioRecorder",
    summary: "Voice recorder with realtime waveform, duration, cancel, and submit controls.",
    registryKind: "audio-recorder",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/audio-recorder.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/audio-recorder.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/audio-recorder.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-audio-recorder.ts", "hook"),
      supportFiles: [
        sourceFile("Duration formatter", "src/registry/lib/format-audio-recorder-duration.ts", "support"),
        // Waveform rendering is delegated to the AudioVisualizer usage family (bars ships by default;
        // swap to the line version by repointing one import in your owned audio-recorder.tsx).
        sourceFile("Waveform (AudioVisualizer, bars version)", "src/registry/sources/control-ui/audio-visualizer.tsx", "audio-visualizer"),
      ],
      source: sourceFile("Component", "src/registry/sources/control-ui/audio-recorder.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/audio-recorder").then((mod) => ({ default: mod.AudioRecorderExample })),
    ),
    additionalPreviews: [
      {
        id: "line-waveform",
        title: "Line waveform version",
        description:
          "The recorder hosts any AudioVisualizer usage version. App-wide, repoint the one import in your owned audio-recorder.tsx (bars → line); per instance, compose explicit children and stand a part bound to the line version on useAudioRecorderContext, as here.",
        source: sourceFile("Line waveform recorder", "src/registry/examples/control-ui/audio-recorder-line.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/audio-recorder-line").then((mod) => ({ default: mod.AudioRecorderLineExample })),
        ),
        previewClassName: "flex min-h-[180px] items-center justify-center",
      },
    ],
    usesPrimitives: ["button", "popover", "command"],
  },
  {
    id: "audio-visualizer",
    kind: "Agent",
    name: "AudioVisualizer",
    summary:
      "Levels-driven realtime audio visualizer offered in two usage versions - bars and line - sharing one export and one props contract.",
    registryKind: "audio-visualizer",
    status: "beta",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/audio-visualizer.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/audio-visualizer.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/audio-visualizer.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/audio-visualizer.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/audio-visualizer").then((mod) => ({ default: mod.AudioVisualizerExample })),
    ),
    // Usage versions: sibling registry items sharing the AudioVisualizer export + AudioVisualizerProps contract.
    // NOT component versions (one registry name never has two contents) — the page shows a picker, the consumer installs one.
    versions: [
      {
        id: "bars",
        label: "Bars",
        registryKind: "audio-visualizer",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/audio-visualizer.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/audio-visualizer.tsx", "component"),
        },
        preview: preview<IntegrationPreviewProps>(() =>
          import("@/src/registry/examples/control-ui/audio-visualizer").then((mod) => ({ default: mod.AudioVisualizerExample })),
        ),
      },
      {
        id: "line",
        label: "Line",
        registryKind: "audio-visualizer-line",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/audio-visualizer-line.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/audio-visualizer-line.tsx", "component"),
        },
        preview: preview<IntegrationPreviewProps>(() =>
          import("@/src/registry/examples/control-ui/audio-visualizer-line").then((mod) => ({ default: mod.AudioVisualizerLineExample })),
        ),
      },
    ],
  },
  {
    id: "dynamic-notification",
    kind: "Agent",
    name: "DynamicNotification",
    summary:
      "Dynamic Island-style AI notification pill with a thinking state that morphs into a reply bubble — token-driven surface, WebGL-enhanced backdrop blur, or real refractive liquid glass.",
    registryKind: "dynamic-notification",
    status: "experimental",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/dynamic-notification.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/dynamic-notification.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/dynamic-notification.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-dynamic-notification.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/dynamic-notification.tsx", "component"),
      supportFiles: [
        sourceFile("Backdrop-blur WebGL engine", "src/registry/sources/control-ui/dynamic-notification-glass.ts", "glass-engine"),
        sourceFile("Refractive liquid WebGL engine", "src/registry/sources/control-ui/dynamic-notification-liquid.ts", "liquid-engine"),
        sourceFile("Island motion (morph choreography)", "src/registry/sources/control-ui/dynamic-notification.css", "notification-css"),
      ],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/dynamic-notification").then((mod) => ({ default: mod.DynamicNotificationExample })),
    ),
    // Usage versions of ONE registry item (all three keep the parent registryKind): the picker swaps
    // the documented island material; switching later is a `variant` prop change, not a reinstall.
    versions: [
      {
        id: "liquid",
        label: "Liquid",
        registryKind: "dynamic-notification",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/dynamic-notification.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/dynamic-notification.tsx", "component"),
        },
        preview: preview<IntegrationPreviewProps>(() =>
          import("@/src/registry/examples/control-ui/dynamic-notification").then((mod) => ({ default: mod.DynamicNotificationExample })),
        ),
      },
      {
        id: "glass",
        label: "Backdrop blur",
        registryKind: "dynamic-notification",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/dynamic-notification-glass.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/dynamic-notification.tsx", "component"),
        },
        preview: preview<IntegrationPreviewProps>(() =>
          import("@/src/registry/examples/control-ui/dynamic-notification-glass").then((mod) => ({
            default: mod.DynamicNotificationGlassExample,
          })),
        ),
      },
      {
        id: "surface",
        label: "Surface",
        registryKind: "dynamic-notification",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/dynamic-notification-surface.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/dynamic-notification.tsx", "component"),
        },
        preview: preview<IntegrationPreviewProps>(() =>
          import("@/src/registry/examples/control-ui/dynamic-notification-surface").then((mod) => ({
            default: mod.DynamicNotificationSurfaceExample,
          })),
        ),
      },
    ],
    usesPrimitives: ["button"],
  },
  {
    id: "environment-variables",
    kind: "Agent",
    name: "EnvironmentVariables",
    summary: "Composable environment variable editor with .env upload, bulk paste, reveal controls, and submit helpers.",
    status: "experimental",
    registryKind: "environment-variables",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/environment-variables.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/environment-variables.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/environment-variables.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-environment-variables.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/environment-variables.tsx", "component"),
      supportFiles: [sourceFile(".env parser", "src/registry/lib/env-file.ts", "env-file")],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/environment-variables").then((mod) => ({ default: mod.EnvironmentVariablesExample })),
    ),
    usesPrimitives: ["button", "input", "input-group"],
  },
  {
    id: "activity",
    kind: "Agent",
    name: "Activity",
    summary: "Shared static and collapsible activity anatomy with bounded, scrollable detail content.",
    registryKind: "activity",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/activity.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/activity.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/activity.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/activity.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/activity").then((mod) => ({ default: mod.ActivityExample })),
    ),
    usesPrimitives: ["collapsible", "scroll-area"],
  },
  {
    id: "source-badge",
    kind: "Agent",
    name: "SourceBadge",
    summary: "Linked source badge with an automatic same-origin favicon, derived hostname, and resilient fallback.",
    status: "beta",
    registryKind: "source-badge",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/source-badge.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/source-badge.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/source-badge.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/source-badge.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/source-badge").then((mod) => ({ default: mod.SourceBadgeExample })),
    ),
    usesPrimitives: ["avatar", "badge"],
  },
  {
    id: "action-bar",
    kind: "Agent",
    name: "ActionBar",
    summary: "Reusable hover actions for message and response controls.",
    registryKind: "action-bar",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/action-bar.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/action-bar.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/action-bar.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/action-bar.tsx", "component"),
      supportFiles: [sourceFile("Copy hook", "src/registry/hooks/use-copy-to-clipboard.ts", "hook")],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/action-bar").then((mod) => ({ default: mod.ActionBarExample })),
    ),
    usesPrimitives: ["button"],
  },
  {
    id: "inline-attachment",
    kind: "Agent",
    name: "InlineAttachment",
    summary: "Inline file and media previews for chat turns.",
    registryKind: "inline-attachment",
    paths: {
      example: sourceFile("Example", "src/registry/examples/inline-attachment.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/inline-attachment.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/inline-attachment.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/inline-attachment.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/inline-attachment").then((mod) => ({ default: mod.InlineAttachmentExample })),
    ),
  },
  {
    id: "markdown-block",
    kind: "Agent",
    name: "MarkdownBlock",
    summary: "Assistant markdown output rendered to prose, with a header and copy-source action.",
    registryKind: "markdown-block",
    paths: {
      example: sourceFile("Example", "src/registry/examples/markdown-block.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/markdown-block.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/markdown-block.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/markdown-block.tsx", "component"),
      supportFiles: [sourceFile("Copy hook", "src/registry/hooks/use-copy-to-clipboard.ts", "hook")],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/markdown-block").then((mod) => ({ default: mod.MarkdownBlockExample })),
    ),
    usesPrimitives: ["button", "markdown"],
  },
  {
    id: "code-block-editor",
    kind: "Agent",
    name: "CodeBlockEditor",
    summary: "Editable code surface with Shiki highlighting and token-based light/dark themes.",
    registryKind: "code-block-editor",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/code-block-editor.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/code-block-editor.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/code-block-editor.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/code-block-editor.tsx", "component"),
      supportFiles: [
        sourceFile("Shiki helper", "src/registry/lib/code-block-shiki.ts", "shiki-helper"),
        sourceFile("Copy hook", "src/registry/hooks/use-copy-to-clipboard.ts", "hook"),
        sourceFile("Tooltip slot", "src/registry/sources/control-ui/ui/tooltip.tsx", "skin-control"),
      ],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/code-block-editor").then((mod) => ({ default: mod.CodeBlockEditorExample })),
    ),
    usesPrimitives: ["button", "scroll-area", "tooltip"],
  },
  {
    id: "chat-scene",
    kind: "Agent",
    name: "ChatScene",
    summary: "Layout primitives for full chat threads, turns, and thoughts.",
    registryKind: "chat-scene",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/chat-scene.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/chat-scene.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/chat-scene.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-scene.tsx", "component"),
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/chat-scene").then((mod) => ({ default: mod.ChatSceneExample })),
    ),
  },
  {
    id: "thread-rail",
    kind: "Agent",
    name: "ThreadRail",
    summary: "Conversation minimap for scanning and jumping between chat turns.",
    registryKind: "thread-rail",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/thread-rail.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/thread-rail.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/thread-rail.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/thread-rail.tsx", "component"),
      supportFiles: [
        sourceFile("Interaction layer", "src/registry/sources/control-ui/thread-rail.css", "thread-rail-css"),
        sourceFile("Surface variants", "src/registry/sources/control-ui/surface-variants.ts", "surface-variants"),
      ],
    },
    preview: preview<IntegrationPreviewProps>(() =>
      import("@/src/registry/examples/control-ui/thread-rail").then((mod) => ({ default: mod.ThreadRailExample })),
    ),
  },
] as const;
