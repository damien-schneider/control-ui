// Generated from src/registry/sources/control-ui/recipes/card.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const cardKnobs = [
  "--cui-card-radius",
  "--cui-card-background",
  "--cui-card-border-color",
  "--cui-card-border-width",
  "--cui-card-shadow",
  "--cui-card-backdrop-filter",
  "--cui-card-padding-block",
  "--cui-card-padding-inline",
  "--cui-card-gap",
  "--cui-card-title-font-size",
] as const;
export type CardKnobStyle = Partial<Record<(typeof cardKnobs)[number], string>>;
