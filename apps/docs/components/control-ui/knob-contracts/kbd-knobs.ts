// Generated from src/registry/sources/control-ui/recipes/kbd.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const kbdKnobs = [
  "--cui-kbd-radius",
  "--cui-kbd-background",
  "--cui-kbd-foreground",
  "--cui-kbd-border-color",
  "--cui-kbd-shadow",
  "--cui-kbd-padding-inline",
  "--cui-kbd-font-size",
  "--cui-kbd-font-weight",
] as const;
export type KbdKnobStyle = Partial<Record<(typeof kbdKnobs)[number], string>>;
