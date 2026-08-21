// Generated from src/registry/sources/control-ui/recipes/inline-citation.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const inlineCitationKnobs = [
  "--cui-inline-citation-trigger-radius",
  "--cui-inline-citation-trigger-background",
  "--cui-inline-citation-trigger-foreground",
  "--cui-inline-citation-trigger-border-color",
  "--cui-inline-citation-trigger-hover-background",
  "--cui-inline-citation-trigger-hover-foreground",
  "--cui-inline-citation-navigation-background",
  "--cui-inline-citation-quote-background",
  "--cui-inline-citation-quote-radius",
] as const;
export type InlineCitationKnobStyle = Partial<Record<(typeof inlineCitationKnobs)[number], string>>;
