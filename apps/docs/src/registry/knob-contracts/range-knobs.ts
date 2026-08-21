// Generated from src/registry/sources/control-ui/recipes/range.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const rangeKnobs = [
  "--cui-range-track-radius",
  "--cui-range-track-background",
  "--cui-range-indicator-radius",
  "--cui-range-indicator-background",
  "--cui-range-thumb-radius",
  "--cui-range-thumb-background",
  "--cui-range-thumb-border-color",
  "--cui-range-thumb-shadow",
] as const;
export type RangeKnobStyle = Partial<Record<(typeof rangeKnobs)[number], string>>;
