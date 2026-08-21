// Generated from src/registry/sources/control-ui/recipes/table.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const tableKnobs = [
  "--cui-table-background",
  "--cui-table-foreground",
  "--cui-table-border-color",
  "--cui-table-row-hover-background",
  "--cui-table-row-selected-background",
  "--cui-table-header-foreground",
  "--cui-table-footer-background",
] as const;
export type TableKnobStyle = Partial<Record<(typeof tableKnobs)[number], string>>;
