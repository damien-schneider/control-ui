// Generated from src/registry/sources/control-ui/recipes/alert.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const alertKnobs = [
  "--cui-alert-radius",
  "--cui-alert-background",
  "--cui-alert-border-color",
  "--cui-alert-shadow",
  "--cui-alert-foreground",
  "--cui-alert-description-foreground",
  "--cui-alert-border-width",
  "--cui-alert-padding",
  "--cui-alert-padding-inline",
  "--cui-alert-gap",
  "--cui-alert-icon-gap",
  "--cui-alert-icon-size",
  "--cui-alert-font-size",
  "--cui-alert-description-gap",
  "--cui-alert-title-font-weight",
] as const;
export type AlertKnobStyle = Partial<Record<(typeof alertKnobs)[number], string>>;
