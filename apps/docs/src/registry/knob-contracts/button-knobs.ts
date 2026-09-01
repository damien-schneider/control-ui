// Generated from src/registry/sources/control-ui/recipes/button.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const buttonKnobs = [
  "--cui-button-radius",
  "--cui-button-gap",
  "--cui-button-icon",
  "--cui-button-height",
  "--cui-button-padding-inline",
  "--cui-button-font-size",
  "--cui-button-background",
  "--cui-button-background-image",
  "--cui-button-foreground",
  "--cui-button-hover-background",
  "--cui-button-hover-foreground",
  "--cui-button-press-background",
  "--cui-button-press-scale",
  "--cui-button-active-background",
  "--cui-button-active-foreground",
  "--cui-button-active-hover-background",
  "--cui-button-shadow",
  "--cui-button-hover-shadow",
  "--cui-button-press-shadow",
  "--cui-button-active-shadow",
] as const;
export type ButtonKnobStyle = Partial<Record<(typeof buttonKnobs)[number], string>>;
