// Generated from src/registry/sources/control-ui/recipes/item.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const itemKnobs = [
  "--cui-item-radius",
  "--cui-item-hover-background",
  "--cui-item-hover-border-color",
  "--cui-item-border-width",
  "--cui-item-active-scale",
] as const;
export type ItemKnobStyle = Partial<Record<(typeof itemKnobs)[number], string>>;
