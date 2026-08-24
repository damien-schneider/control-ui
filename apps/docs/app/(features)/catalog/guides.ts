type GuideSectionCatalogEntry = {
  id: string;
  title: string;
  code?:
    | "skin-install"
    | "skin-scaffold-install"
    | "component-install"
    | "block-install"
    | "component-usage"
    | "runtime-agnostic-message"
    | "agent-endpoints"
    | "agent-llms"
    | "update-install";
};

export const guideEntries = [
  {
    id: "create",
    kind: "Guide",
    name: "Create app",
    summary: "Scaffold a Next.js app with every Control UI component installed as source you own on the Refined skin.",
    cta: true,
    sections: [
      { id: "command", title: "Create your app" },
      { id: "included", title: "What you get" },
    ],
  },
  {
    id: "overview",
    kind: "Guide",
    name: "Overview",
    summary: "An owned-source registry of primitives, agent surfaces, complete blocks, and swappable skins.",
    sections: [
      { id: "why", title: "Why it exists" },
      { id: "model", title: "How it works" },
      { id: "css-first", title: "CSS-first by default" },
    ],
  },
  {
    id: "get-started",
    kind: "Guide",
    name: "Get started",
    summary: "Choose a skin, install a component or complete block, wire its CSS, and compose your application runtime.",
    sections: [
      { id: "choose", title: "Choose what to install" },
      { id: "install-skin", title: "Install a skin", code: "skin-install" },
      { id: "install-component", title: "Install a component", code: "component-install" },
      { id: "install-block", title: "Install a block", code: "block-install" },
      { id: "wire-css", title: "Wire the CSS" },
      { id: "use", title: "Compose your runtime", code: "component-usage" },
      { id: "update", title: "Update installed components", code: "update-install" },
    ],
  },
  {
    id: "create-a-skin",
    kind: "Guide",
    name: "Create a skin",
    summary:
      "Re-value the token contract over an installed pack, or own a full pack of three files, then reach the component knobs beneath.",
    sections: [
      { id: "lanes", title: "Two lanes" },
      { id: "override", title: "Re-value tokens over a pack" },
      { id: "pack", title: "Own a full pack", code: "skin-scaffold-install" },
      { id: "knobs", title: "Go deeper with component knobs" },
    ],
  },
  {
    id: "shadcn-compatibility",
    kind: "Guide",
    name: "shadcn compatibility",
    summary: "shadcn registry, token, and ownership conventions without writing to components/ui.",
    sections: [
      { id: "contract", title: "Compatible by contract" },
      { id: "tokens", title: "Bring an existing theme" },
    ],
  },
  {
    id: "architecture",
    kind: "Guide",
    name: "Architecture",
    summary: "Runtime ownership, skin layering, customization paths, and registry derivation.",
    sections: [
      { id: "layers", title: "Runtime and source ownership", code: "runtime-agnostic-message" },
      { id: "skins", title: "Skins over one component tree" },
      { id: "cascade", title: "The knob cascade" },
      { id: "anatomy", title: "Stable anatomy without runtime metadata" },
      { id: "skin-cost", title: "Keep the active skin sparse" },
      { id: "customization-ladder", title: "Choose the smallest customization surface" },
      { id: "registry", title: "Registry source of truth" },
    ],
  },
  {
    id: "agent-surface",
    kind: "Guide",
    name: "Agent surface",
    summary: "Inspect and install registry items through HTTP, shadcn manifests, static metadata, and machine-readable docs.",
    sections: [
      { id: "envelope", title: "One registry, multiple interfaces" },
      { id: "endpoints", title: "HTTP API", code: "agent-endpoints" },
      { id: "agent-docs", title: "Machine-readable docs", code: "agent-llms" },
    ],
  },
  {
    id: "lock-in",
    kind: "Guide",
    name: "Lock-in",
    summary: "What you own at each layer, what stays proprietary, and what leaving costs — measured, not promised.",
    sections: [
      { id: "layers", title: "Five layers, measured" },
      { id: "exit", title: "What leaving costs" },
      { id: "continuity", title: "Continuity" },
    ],
  },
  {
    id: "theme-accessibility",
    kind: "Guide",
    name: "Theme accessibility",
    summary: "Audit canonical theme colors plus rendered popup, badge, and active-tab states, then run the same checks from the CLI.",
    layout: "wide",
    sections: [],
  },
  {
    id: "theme-ai-builder",
    kind: "Guide",
    name: "Theme AI builder",
    summary: "Create a Control UI theme with Claude Code, Codex, or Mastra Code, then import and test it live.",
    layout: "wide",
    sections: [],
  },
  {
    id: "control-ui-vs-shadcn-ui",
    kind: "Guide",
    name: "Control UI vs shadcn/ui",
    summary:
      "Both ship open-source React source through the shadcn CLI. The difference starts after install: skins, a typed token contract, and agent surfaces.",
    sections: [
      { id: "short-answer", title: "The short answer" },
      { id: "side-by-side", title: "Side by side" },
      { id: "alignment", title: "Where they align" },
      { id: "differences", title: "Where they differ" },
      { id: "choose", title: "Which one to choose" },
    ],
    comparedApplications: [
      { name: "shadcn/ui", url: "https://ui.shadcn.com" },
      { name: "Control UI", url: "https://control-ui.dev" },
    ],
    faqs: [
      {
        question: "Is Control UI a replacement for shadcn/ui?",
        answer:
          "No. Control UI is a separate registry that follows shadcn conventions — CLI install, owned source, compatible token names. You can run both side by side in one app, and existing shadcn theme values can seed a Control UI skin.",
      },
      {
        question: "Can I use Control UI and shadcn/ui components in the same project?",
        answer:
          "Yes. Both install as plain source under your own directories and share the core shadcn token vocabulary like --background and --primary. Neither writes into the other's files, so they coexist without coordination.",
      },
      {
        question: "Does Control UI require Tailwind CSS?",
        answer:
          "The docs app is built with Tailwind v4 and installed components are styled for it, but painting happens through CSS custom properties (--cui-* knobs and theme tokens). Any setup that serves those variables can host the components.",
      },
      {
        question: "How do licensing and ownership differ?",
        answer:
          "Both are MIT-licensed open source. Both copy source into your repository instead of shipping a versioned dependency package, so you own and edit every installed line either way.",
      },
    ],
  },
  {
    id: "best-react-component-libraries-for-ai-interfaces",
    kind: "Guide",
    name: "Best React component libraries for AI interfaces",
    summary:
      "Six production options compared by ownership model, theming system, and agent-specific surfaces — from shadcn/ui to MUI to Control UI.",
    sections: [
      { id: "criteria", title: "How we evaluated" },
      { id: "shadcn-ui", title: "shadcn/ui" },
      { id: "assistant-ui", title: "assistant-ui" },
      { id: "material-ui", title: "Material UI (MUI)" },
      { id: "ant-design", title: "Ant Design" },
      { id: "chakra-ui", title: "Chakra UI" },
      { id: "control-ui", title: "Control UI" },
      { id: "summary-table", title: "Summary table" },
      { id: "recommendation", title: "Which one for your product" },
    ],
    comparedApplications: [
      { name: "shadcn/ui", url: "https://ui.shadcn.com" },
      { name: "assistant-ui", url: "https://www.assistant-ui.com" },
      { name: "Material UI", url: "https://mui.com/material-ui/" },
      { name: "Ant Design", url: "https://ant.design" },
      { name: "Chakra UI", url: "https://chakra-ui.com" },
      { name: "Control UI", url: "https://control-ui.dev" },
    ],
    faqs: [
      {
        question: "What is the best React component library for AI chat interfaces?",
        answer:
          "For owned-source agent interfaces, Control UI ships chat, composer, activity, and context surfaces with swappable skins and no runtime coupling. For general apps adding one chat panel, assistant-ui offers ready-made primitives wired to popular AI SDK runtimes.",
      },
      {
        question: "Are these React component libraries free?",
        answer:
          "All six profiled libraries are MIT-licensed open source and free for commercial use. They differ in what ships after install: versioned npm packages (MUI, Ant Design, Chakra) versus source copied into your repository (shadcn/ui, assistant-ui, Control UI).",
      },
      {
        question: "What makes a component library suitable for AI products?",
        answer:
          "Streaming-friendly message and activity surfaces, token-level theming so generated UI matches brand constraints, and runtime independence — the UI must not hard-wire one model provider, transport, or store lifecycle.",
      },
    ],
  },
] as const satisfies readonly {
  id: string;
  kind: "Guide";
  name: string;
  summary: string;
  layout?: "default" | "wide";
  cta?: true;
  sections: readonly GuideSectionCatalogEntry[];
  comparedApplications?: readonly { name: string; url: string }[];
  faqs?: readonly { question: string; answer: string }[];
}[];
