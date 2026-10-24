// Generated from src/registry/sources/control-ui/recipes/collapsible.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const collapsibleKnobs = [
  "--cui-collapsible-trigger-radius",
  "--cui-collapsible-trigger-hover-background",
  "--cui-collapsible-trigger-padding-inline",
  "--cui-collapsible-trigger-padding-block",
  "--cui-collapsible-trigger-foreground",
  "--cui-collapsible-trigger-hover-foreground",
] as const;
export type CollapsibleKnobStyle = Partial<Record<(typeof collapsibleKnobs)[number], string>>;
