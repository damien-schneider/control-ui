// Generated from src/registry/sources/control-ui/recipes/button.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const buttonKnobs = [
  "--cui-button-radius",
  "--cui-button-gap",
  "--cui-button-icon",
  "--cui-button-bg",
  "--cui-button-bg-image",
  "--cui-button-foreground",
  "--cui-button-hover-bg",
  "--cui-button-hover-foreground",
  "--cui-button-press-bg",
  "--cui-button-press-scale",
  "--cui-button-active-bg",
  "--cui-button-active-foreground",
  "--cui-button-active-hover-bg",
  "--cui-button-shadow",
  "--cui-button-hover-shadow",
  "--cui-button-press-shadow",
  "--cui-button-active-shadow",
] as const;
export type ButtonKnobStyle = Partial<Record<(typeof buttonKnobs)[number], string>>;
