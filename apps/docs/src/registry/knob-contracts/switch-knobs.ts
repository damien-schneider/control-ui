// Generated from src/registry/sources/control-ui/recipes/switch.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const switchKnobs = [
  "--cui-switch-background",
  "--cui-switch-hover-background",
  "--cui-switch-checked-background",
  "--cui-switch-checked-hover-background",
  "--cui-switch-thumb-radius",
  "--cui-switch-thumb-background",
] as const;
export type SwitchKnobStyle = Partial<Record<(typeof switchKnobs)[number], string>>;
