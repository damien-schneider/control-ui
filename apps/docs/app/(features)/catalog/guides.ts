type GuideSectionCatalogEntry = {
  id: string;
  title: string;
  code?:
    | "skin-install"
    | "component-install"
    | "block-install"
    | "component-usage"
    | "runtime-agnostic-message"
    | "agent-endpoints"
    | "agent-llms";
};

export const guideEntries = [
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
] as const satisfies readonly {
  id: string;
  kind: "Guide";
  name: string;
  summary: string;
  layout?: "default" | "wide";
  sections: readonly GuideSectionCatalogEntry[];
}[];
