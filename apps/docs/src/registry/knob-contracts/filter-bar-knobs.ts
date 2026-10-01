// Generated from src/registry/sources/control-ui/recipes/filter-bar.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const filterBarKnobs = [
  "--cui-filter-bar-background",
  "--cui-filter-bar-foreground",
  "--cui-filter-bar-border-color",
  "--cui-filter-bar-border-width",
  "--cui-filter-bar-radius",
  "--cui-filter-bar-height",
  "--cui-filter-bar-gap",
  "--cui-filter-bar-padding-inline",
  "--cui-filter-bar-font-size",
  "--cui-filter-bar-hover-background",
] as const;
export type FilterBarKnobStyle = Partial<Record<(typeof filterBarKnobs)[number], string>>;
