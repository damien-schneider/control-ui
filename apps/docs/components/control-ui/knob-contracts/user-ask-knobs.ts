// Generated from src/registry/sources/control-ui/recipes/user-ask.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const userAskKnobs = [
  "--cui-user-ask-radius",
  "--cui-user-ask-background",
  "--cui-user-ask-foreground",
  "--cui-user-ask-border-color",
  "--cui-user-ask-shadow",
  "--cui-user-ask-option-radius",
  "--cui-user-ask-option-hover-background",
  "--cui-user-ask-option-selected-background",
  "--cui-user-ask-indicator-background",
  "--cui-user-ask-indicator-foreground",
  "--cui-user-ask-input-background",
  "--cui-user-ask-input-foreground",
] as const;
export type UserAskKnobStyle = Partial<Record<(typeof userAskKnobs)[number], string>>;
