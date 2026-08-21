// Generated from src/registry/sources/control-ui/recipes/stepper.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const stepperKnobs = [
  "--cui-stepper-indicator-radius",
  "--cui-stepper-indicator-background",
  "--cui-stepper-indicator-foreground",
  "--cui-stepper-indicator-border-color",
  "--cui-stepper-separator-background",
  "--cui-stepper-title-foreground",
] as const;
export type StepperKnobStyle = Partial<Record<(typeof stepperKnobs)[number], string>>;
