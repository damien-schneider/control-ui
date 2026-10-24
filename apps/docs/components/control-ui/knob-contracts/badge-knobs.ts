// Generated from src/registry/sources/control-ui/recipes/badge.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const badgeKnobs = [
  "--cui-badge-radius",
  "--cui-badge-background",
  "--cui-badge-foreground",
  "--cui-badge-border-color",
  "--cui-badge-border-width",
  "--cui-badge-font-family",
  "--cui-badge-font-size",
  "--cui-badge-font-weight",
] as const;
export type BadgeKnobStyle = Partial<Record<(typeof badgeKnobs)[number], string>>;
