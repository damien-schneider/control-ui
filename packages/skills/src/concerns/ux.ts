import type { PracticeSkillDefinition } from "../types";

const mastraPlaygroundUiSource = {
  label: "Mastra Playground UI compact controls",
  path: "../mastra/packages/playground-ui/src/ds/components/Button/Button.tsx",
};

export const uxSkills = [
  {
    id: "ux-state-continuity",
    title: "State continuity",
    concern: "ux",
    summary: "Show loading, empty, partial, success, and failure states in the same product language.",
    goal: "Make each state feel like the same workflow instead of a bolt-on fallback.",
    checks: [
      "Name the user action available in each state, especially empty and error states.",
      "Keep layout dimensions stable between loading, loaded, and empty states.",
      "Use progressive disclosure for diagnostics so the primary next step stays clear.",
    ],
    avoid: [
      "Generic empty states that describe the app instead of moving the workflow forward.",
      "Spinners or skeletons that resize the page when real content arrives.",
    ],
  },
  {
    id: "ux-provenance-without-noise",
    title: "Provenance without noise",
    concern: "ux",
    summary: "Surface source, runtime, and ownership cues only where they help the user trust or act.",
    goal: "Make agent UI explain where output came from without turning every row into a diagnostics panel.",
    checks: [
      "Use compact badges, muted labels, or hover details for source and runtime metadata.",
      "Put high-confidence primary content first; keep provenance adjacent but secondary.",
      "Escalate provenance visually only when it changes what the user should do next.",
    ],
    avoid: [
      "Large always-visible panels for metadata that is only occasionally useful.",
      "Hiding critical source or ownership details behind a generic info icon.",
    ],
  },
  {
    id: "ux-dense-but-scannable",
    title: "Dense but scannable",
    concern: "ux",
    summary: "Favor compact surfaces that support repeated work without flattening hierarchy.",
    goal: "Fit operational agent workflows on screen while preserving scan paths, grouping, and clear affordances.",
    checks: [
      "Use concise labels, small status chips, and predictable alignment for repeated rows.",
      "Reserve large type and decorative space for actual page-level orientation.",
      "Group controls by workflow stage instead of visual novelty.",
    ],
    avoid: [
      "Card-heavy layouts where every small piece of information becomes a separate panel.",
      "Oversized headings or explanatory text inside compact tools and sidebars.",
    ],
  },
  {
    id: "ux-say-it-once",
    title: "Say it once",
    concern: "ux",
    summary: "Cut redundant AI-slop copy so labels, controls, and state carry the obvious meaning.",
    goal: "Make every visible sentence earn its space by adding a decision, constraint, consequence, or recovery path.",
    source: mastraPlaygroundUiSource,
    checks: [
      "Trust clear labels, icons, toggles, and placement to explain standard interactions.",
      "Before adding helper text, name the new information it adds beyond the label and control.",
      "Reserve descriptions for unusual behavior, irreversible actions, hidden constraints, permissions, delays, or failure recovery.",
      "Use progressive disclosure for secondary context so frequent users do not scan past repeated explanations.",
    ],
    avoid: [
      'Label-description pairs that restate the same action, such as "Change theme" plus "This changes the theme."',
      "Always-visible paragraphs under every input, toggle, tab, or card because generated UI looks more complete with copy.",
      "Explaining standard control mechanics instead of naming the user outcome.",
      "Empty states that describe the product when they should give the next useful action or reason.",
    ],
  },
] as const satisfies readonly PracticeSkillDefinition[];
