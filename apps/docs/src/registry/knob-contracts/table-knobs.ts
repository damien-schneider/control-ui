// Generated from src/registry/sources/control-ui/recipes/table.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const tableKnobs = [
  "--cui-table-background",
  "--cui-table-foreground",
  "--cui-table-border-color",
  "--cui-table-border-width",
  "--cui-table-cell-padding",
  "--cui-table-head-height",
  "--cui-table-row-hover-background",
  "--cui-table-row-selected-background",
  "--cui-table-header-foreground",
  "--cui-table-footer-background",
  "--cui-table-header-sticky-background",
  "--cui-table-header-sticky-shadow",
] as const;
export type TableKnobStyle = Partial<Record<(typeof tableKnobs)[number], string>>;
