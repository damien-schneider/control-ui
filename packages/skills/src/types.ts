export const skillConcerns = [
  {
    id: "css-first",
    title: "CSS-first",
    summary:
      "Reach for modern CSS — relational selectors, container and style queries, and native platform elements — before React state, effects, and event handlers, so interaction, sizing, and motion stay declarative, server-rendered, and JavaScript-free.",
  },
  {
    id: "react-code-quality",
    title: "React code quality",
    summary: "Review rules for component structure, state ownership, data fetching, and render behavior.",
  },
  {
    id: "architecture",
    title: "Architecture",
    summary: "Ownership and derivation rules for canonical facts, generated projections, and system boundaries.",
  },
  {
    id: "ui-tailwind",
    title: "UI / Tailwind",
    summary: "Styling rules for Tailwind v4, token discipline, component reuse, and className boundaries.",
  },
  {
    id: "ux",
    title: "UX",
    summary: "Interaction and information-design checks for agent-facing product surfaces.",
  },
  {
    id: "control-ui",
    title: "Control UI registry",
    summary: "Registry-first guidance for installable Control UI components, skins, hooks, and blocks.",
  },
] as const;

export type SkillConcern = (typeof skillConcerns)[number];
export type SkillConcernId = SkillConcern["id"];

export type PracticeSkillDefinition = {
  id: string;
  title: string;
  concern: SkillConcernId;
  summary: string;
  goal: string;
  source?: {
    label: string;
    path: string;
  };
  checks: readonly string[];
  avoid: readonly string[];
};
