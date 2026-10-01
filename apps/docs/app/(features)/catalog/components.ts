import { emailEntry } from "./email";
import { preview, sourceFile } from "./shared";

const chatMessageRecipeFiles = [
  sourceFile("Chat message recipe — paint + @property knobs", "src/registry/sources/control-ui/recipes/chat-message.css", "recipe-css"),
  sourceFile(
    "Chat message recipe — footer, reactions, replies, typing",
    "src/registry/sources/control-ui/recipes/chat-message-social.css",
    "recipe-css",
  ),
] as const;
const threadRailRecipeFile = sourceFile(
  "Thread rail recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/thread-rail.css",
  "recipe-css",
);
const actionBarRecipeFile = sourceFile(
  "Action bar recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/action-bar.css",
  "recipe-css",
);
const transcriptDividerRecipeFile = sourceFile(
  "Transcript divider recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/transcript-divider.css",
  "recipe-css",
);
const sourceBadgeRecipeFile = sourceFile(
  "Source badge recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/source-badge.css",
  "recipe-css",
);
const activityRecipeFile = sourceFile(
  "Activity recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/activity.css",
  "recipe-css",
);
const markdownBlockRecipeFile = sourceFile(
  "Markdown block recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/markdown-block.css",
  "recipe-css",
);
const chatLayoutRecipeFile = sourceFile(
  "Chat layout recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/chat-layout.css",
  "recipe-css",
);
const audioRecorderRecipeFile = sourceFile(
  "Audio recorder recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/audio-recorder.css",
  "recipe-css",
);
const audioVisualizerRecipeFile = sourceFile(
  "Audio visualizer recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/audio-visualizer.css",
  "recipe-css",
);
const environmentVariablesRecipeFile = sourceFile(
  "Environment variables recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/environment-variables.css",
  "recipe-css",
);
const inlineCitationRecipeFile = sourceFile(
  "Inline citation recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/inline-citation.css",
  "recipe-css",
);
const contextRecipeFile = sourceFile(
  "Context recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/context.css",
  "recipe-css",
);
const chatComposerRecipeFile = sourceFile(
  "Chat composer recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/chat-composer.css",
  "recipe-css",
);
const chatComposerAttachmentRecipeFile = sourceFile(
  "Chat composer attachment recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/chat-composer-attachment.css",
  "recipe-css",
);
const userAskRecipeFiles = [
  sourceFile("User ask recipe — panel + @property knobs", "src/registry/sources/control-ui/recipes/user-ask.css", "recipe-css"),
  sourceFile("User ask recipe — nested details", "src/registry/sources/control-ui/recipes/user-ask-details.css", "recipe-css"),
] as const;
const taskListRecipeFile = sourceFile(
  "Task list recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/task-list.css",
  "recipe-css",
);
const inlineAttachmentRecipeFile = sourceFile(
  "Inline attachment recipe — paint + @property knobs",
  "src/registry/sources/control-ui/recipes/inline-attachment.css",
  "recipe-css",
);

export const componentEntries = [
  emailEntry,
  {
    id: "chat-message",
    category: "chat",
    kind: "Component",
    name: "ChatMessage",
    summary:
      "Composable chat message for assistant turns or people talking: bubble or flat layout, grouped bursts, reactions, and replies.",
    registryKind: "chat-message",
    paths: {
      example: sourceFile("Example", "src/registry/examples/chat-message.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/chat-message.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/chat-message.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-chat-message.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-message.tsx", "component"),
      supportFiles: [
        sourceFile("Reactions, replies, and typing", "src/registry/sources/control-ui/chat-message/social.tsx", "support"),
        ...chatMessageRecipeFiles,
      ],
    },
    preview: preview(() => import("@/src/registry/examples/chat-message").then((mod) => ({ default: mod.ChatMessageExample }))),
    previewClassName: "min-h-[280px] items-start",
    additionalPreviews: [
      {
        id: "team",
        title: "Team conversation",
        description:
          'People talking to people: layout="flat" keeps everyone on the start edge, continuation folds a burst under one author, and reactions and reply summaries hang off the body.',
        source: sourceFile("Team conversation example", "src/registry/examples/control-ui/chat-message-team.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/chat-message-team").then((mod) => ({ default: mod.ChatMessageTeamExample })),
        ),
        previewClassName: "min-h-[280px] items-start",
      },
    ],
  },
  {
    id: "chat-composer",
    category: "chat",
    kind: "Component",
    name: "ChatComposer",
    summary: "Message composer with controlled text, Enter or ⌘ Enter submit, caret text insertion, and trigger-menu support.",
    registryKind: "chat-composer",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/chat-composer.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/chat-composer.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/chat-composer.ai-sdk.tsx", "usage"),
      },
      hook: sourceFile("Behavior hook", "src/registry/hooks/use-chat-composer.ts", "hook"),
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-composer.tsx", "component"),
      supportFiles: [
        sourceFile("Rich editor (ProseMirror)", "src/registry/sources/control-ui/chat-composer-editor.tsx", "component"),
        sourceFile("Editor schema", "src/registry/sources/control-ui/chat-composer-editor/schema.ts", "support"),
        sourceFile("Extension contract", "src/registry/sources/control-ui/chat-composer-editor/types.ts", "support"),
        sourceFile("Mention extension", "src/registry/sources/control-ui/chat-composer-editor/extensions/mention.tsx", "support"),
        sourceFile("Exit-animation ghost", "src/registry/sources/control-ui/chat-composer-editor/ghost.ts", "support"),
        sourceFile("Editor motion (blur choreography)", "src/registry/sources/control-ui/chat-composer-editor.css", "editor-css"),
        chatComposerRecipeFile,
      ],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/chat-composer").then((mod) => ({ default: mod.ChatComposerExample })),
    ),
  },
  {
    id: "chat-composer-attachment",
    category: "chat",
    kind: "Component",
    name: "ChatComposerAttachment",
    summary: "Composer attachment rail with file previews, upload progress, and removal.",
    registryKind: "chat-composer-attachment",
    paths: {
      example: sourceFile("Example", "src/registry/examples/chat-composer-attachment.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/chat-composer-attachment.mastra.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/chat-composer-attachment.ai-sdk.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-composer-attachment.tsx", "component"),
      supportFiles: [chatComposerAttachmentRecipeFile],
    },
    preview: preview(() =>
      import("@/src/registry/examples/chat-composer-attachment").then((mod) => ({ default: mod.ChatComposerAttachmentExample })),
    ),
  },
  {
    id: "user-ask",
    category: "chat",
    kind: "Component",
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
      supportFiles: [...userAskRecipeFiles],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/user-ask").then((mod) => ({ default: mod.UserAskExample }))),
  },
  {
    id: "task-list",
    category: "chat",
    kind: "Component",
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
      supportFiles: [taskListRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/task-list").then((mod) => ({ default: mod.TaskListExample }))),
  },
  {
    id: "audio-recorder",
    category: "chat",
    kind: "Component",
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
        audioRecorderRecipeFile,
      ],
      source: sourceFile("Component", "src/registry/sources/control-ui/audio-recorder.tsx", "component"),
    },
    preview: preview(() =>
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
        previewClassName: "min-h-[180px]",
      },
    ],
  },
  {
    id: "audio-visualizer",
    category: "chat",
    kind: "Component",
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
      supportFiles: [audioVisualizerRecipeFile],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/audio-visualizer").then((mod) => ({ default: mod.AudioVisualizerExample })),
    ),
    versions: [
      {
        id: "bars",
        label: "Bars",
        registryKind: "audio-visualizer",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/audio-visualizer.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/audio-visualizer.tsx", "component"),
          supportFiles: [audioVisualizerRecipeFile],
        },
        preview: preview(() =>
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
          supportFiles: [audioVisualizerRecipeFile],
        },
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/audio-visualizer-line").then((mod) => ({ default: mod.AudioVisualizerLineExample })),
        ),
      },
    ],
  },
  {
    id: "dynamic-notification",
    category: "feedback",
    kind: "Component",
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
        sourceFile(
          "Dynamic notification recipe — paint + @property knobs",
          "src/registry/sources/control-ui/recipes/dynamic-notification.css",
          "recipe-css",
        ),
        sourceFile(
          "Dynamic notification input recipe",
          "src/registry/sources/control-ui/recipes/dynamic-notification-input.css",
          "recipe-css",
        ),
        sourceFile(
          "Dynamic notification motion recipe",
          "src/registry/sources/control-ui/recipes/dynamic-notification-motion.css",
          "recipe-css",
        ),
      ],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/dynamic-notification").then((mod) => ({ default: mod.DynamicNotificationExample })),
    ),
    versions: [
      {
        id: "liquid",
        label: "Liquid",
        registryKind: "dynamic-notification",
        paths: {
          example: sourceFile("Example", "src/registry/examples/control-ui/dynamic-notification.tsx", "example"),
          source: sourceFile("Component", "src/registry/sources/control-ui/dynamic-notification.tsx", "component"),
        },
        preview: preview(() =>
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
        preview: preview(() =>
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
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/dynamic-notification-surface").then((mod) => ({
            default: mod.DynamicNotificationSurfaceExample,
          })),
        ),
      },
    ],
  },
  {
    id: "filter-bar",
    category: "forms",
    kind: "Component",
    name: "FilterBar",
    summary: "Build editable field, operator, and value filters with a button or inline search.",
    registryKind: "filter-bar",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/filter-bar.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/filter-bar.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/filter-bar.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/filter-bar.tsx", "component"),
      supportFiles: [sourceFile("Filter bar recipe", "src/registry/sources/control-ui/recipes/filter-bar.css", "recipe-css")],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/filter-bar").then((mod) => ({ default: mod.FilterBarExample }))),
    previewClassName: "min-h-[360px] items-start",
    additionalPreviews: [
      {
        id: "input",
        previewClassName: "min-h-[340px] items-start",
        title: "Inline search",
        description: "Type to build filters directly in the bar. Both entry points use the same editor.",
        source: sourceFile("Inline search example", "src/registry/examples/control-ui/filter-bar.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/filter-bar").then((mod) => ({ default: mod.FilterBarInputExample })),
        ),
      },
      {
        id: "remote",
        previewClassName: "min-h-[160px] items-start",
        title: "Remote value search",
        description: "The host supplies matching values, loading and error states, and keeps selected labels available.",
        source: sourceFile("Remote search example", "src/registry/examples/control-ui/filter-bar-remote.tsx", "example"),
        preview: preview(() =>
          import("@/src/registry/examples/control-ui/filter-bar-remote").then((mod) => ({ default: mod.FilterBarRemoteExample })),
        ),
      },
    ],
  },
  {
    id: "environment-variables",
    category: "forms",
    kind: "Component",
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
      supportFiles: [sourceFile(".env parser", "src/registry/lib/env-file.ts", "env-file"), environmentVariablesRecipeFile],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/environment-variables").then((mod) => ({ default: mod.EnvironmentVariablesExample })),
    ),
  },
  {
    id: "activity",
    category: "chat",
    kind: "Component",
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
      supportFiles: [activityRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/activity").then((mod) => ({ default: mod.ActivityExample }))),
  },
  {
    id: "transcript-divider",
    category: "chat",
    kind: "Component",
    name: "TranscriptDivider",
    summary: "Toned run-boundary separator for transcripts: steering, interruptions, and condensed context.",
    registryKind: "transcript-divider",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/transcript-divider.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/transcript-divider.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/transcript-divider.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/transcript-divider.tsx", "component"),
      supportFiles: [transcriptDividerRecipeFile],
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/transcript-divider").then((mod) => ({ default: mod.TranscriptDividerExample })),
    ),
  },
  {
    id: "context",
    category: "chat",
    kind: "Component",
    name: "Context",
    summary: "Compact context-window usage with an automatically derived token graph and anchored detail inspector.",
    status: "beta",
    registryKind: "context",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/context.tsx", "example"),
      usage: {
        mastra: sourceFile("Mastra usage", "src/registry/usage/components/context.tsx", "usage"),
        "ai-sdk": sourceFile("AI SDK usage", "src/registry/usage/components/context.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/context.tsx", "component"),
      supportFiles: [sourceFile("Derivation model", "src/registry/sources/control-ui/context-model.ts", "support"), contextRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/context").then((mod) => ({ default: mod.ContextExample }))),
  },
  {
    id: "inline-citation",
    category: "chat",
    kind: "Component",
    name: "InlineCitation",
    summary: "Inline multi-source citation with a keyboard-accessible preview and source navigation.",
    registryKind: "inline-citation",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/inline-citation.tsx", "example"),
      source: sourceFile("Component", "src/registry/sources/control-ui/inline-citation.tsx", "component"),
      supportFiles: [inlineCitationRecipeFile],
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/inline-citation.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/inline-citation.tsx", "usage"),
      },
    },
    preview: preview(() =>
      import("@/src/registry/examples/control-ui/inline-citation").then((mod) => ({ default: mod.InlineCitationExample })),
    ),
  },
  {
    id: "source-badge",
    category: "chat",
    kind: "Component",
    name: "SourceBadge",
    summary: "Linked source badge with an automatic same-origin favicon, derived hostname, and resilient fallback.",
    registryKind: "source-badge",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/source-badge.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/source-badge.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/source-badge.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/source-badge.tsx", "component"),
      supportFiles: [sourceBadgeRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/source-badge").then((mod) => ({ default: mod.SourceBadgeExample }))),
  },
  {
    id: "action-bar",
    category: "chat",
    kind: "Component",
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
      supportFiles: [sourceFile("Copy hook", "src/registry/hooks/use-copy-to-clipboard.ts", "hook"), actionBarRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/action-bar").then((mod) => ({ default: mod.ActionBarExample }))),
  },
  {
    id: "inline-attachment",
    category: "chat",
    kind: "Component",
    name: "InlineAttachment",
    summary: "Inline file and media previews for chat turns.",
    status: "beta",
    registryKind: "inline-attachment",
    paths: {
      example: sourceFile("Example", "src/registry/examples/inline-attachment.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/inline-attachment.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/inline-attachment.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/inline-attachment.tsx", "component"),
      supportFiles: [inlineAttachmentRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/inline-attachment").then((mod) => ({ default: mod.InlineAttachmentExample }))),
  },
  {
    id: "markdown-block",
    category: "chat",
    kind: "Component",
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
      supportFiles: [sourceFile("Copy hook", "src/registry/hooks/use-copy-to-clipboard.ts", "hook"), markdownBlockRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/markdown-block").then((mod) => ({ default: mod.MarkdownBlockExample }))),
  },
  {
    id: "chat-layout",
    category: "chat",
    kind: "Component",
    name: "ChatLayout",
    summary: "A scrolling conversation with a pinned header, message turns, and a floating composer dock.",
    registryKind: "chat-layout",
    paths: {
      example: sourceFile("Example", "src/registry/examples/control-ui/chat-layout.tsx", "example"),
      usage: {
        mastra: sourceFile("Usage", "src/registry/usage/components/chat-layout.tsx", "usage"),
        "ai-sdk": sourceFile("Usage", "src/registry/usage/components/chat-layout.tsx", "usage"),
      },
      source: sourceFile("Component", "src/registry/sources/control-ui/chat-layout.tsx", "component"),
      supportFiles: [chatLayoutRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/chat-layout").then((mod) => ({ default: mod.ChatLayoutExample }))),
  },
  {
    id: "thread-rail",
    category: "chat",
    kind: "Component",
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
      supportFiles: [threadRailRecipeFile],
    },
    preview: preview(() => import("@/src/registry/examples/control-ui/thread-rail").then((mod) => ({ default: mod.ThreadRailExample }))),
  },
] as const;
