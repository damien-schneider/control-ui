// Generated from src/registry/sources/control-ui/recipes/field.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const fieldKnobs = [
  "--cui-field-radius",
  "--cui-field-background",
  "--cui-field-hover-background",
  "--cui-field-affordance-background",
  "--cui-field-affordance-shadow",
  "--cui-field-affordance-foreground",
  "--cui-field-affordance-hover-background",
  "--cui-field-foreground",
  "--cui-field-border-color",
  "--cui-field-border-width",
  "--cui-field-shadow",
  "--cui-field-backdrop-filter",
  "--cui-field-height",
  "--cui-field-padding-inline",
  "--cui-field-font-size",
] as const;
export type FieldKnobStyle = Partial<Record<(typeof fieldKnobs)[number], string>>;
