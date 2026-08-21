// Generated from src/registry/sources/control-ui/recipes/morphing-panel.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const morphingPanelKnobs = [
  "--cui-morphing-panel-radius",
  "--cui-morphing-panel-background",
  "--cui-morphing-panel-foreground",
  "--cui-morphing-panel-border-color",
  "--cui-morphing-panel-shadow",
  "--cui-morphing-panel-trigger-hover-background",
] as const;
export type MorphingPanelKnobStyle = Partial<Record<(typeof morphingPanelKnobs)[number], string>>;
