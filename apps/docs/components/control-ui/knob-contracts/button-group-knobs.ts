// Generated from src/registry/sources/control-ui/recipes/button-group.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const buttonGroupKnobs = [
  "--cui-button-group-text-radius",
  "--cui-button-group-text-background",
  "--cui-button-group-text-foreground",
  "--cui-button-group-separator-background",
] as const;
export type ButtonGroupKnobStyle = Partial<Record<(typeof buttonGroupKnobs)[number], string>>;
