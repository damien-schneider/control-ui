// Generated from src/registry/sources/control-ui/recipes/choice.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const choiceKnobs = [
  "--cui-choice-radius",
  "--cui-choice-border-color",
  "--cui-choice-checked-background",
  "--cui-choice-checked-border-color",
  "--cui-choice-shadow",
] as const;
export type ChoiceKnobStyle = Partial<Record<(typeof choiceKnobs)[number], string>>;
