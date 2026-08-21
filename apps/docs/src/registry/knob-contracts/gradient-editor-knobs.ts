// Generated from src/registry/sources/control-ui/recipes/gradient-editor.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const gradientEditorKnobs = [
  "--cui-gradient-editor-preview-radius",
  "--cui-gradient-editor-preview-ring-color",
  "--cui-gradient-editor-track-radius",
  "--cui-gradient-editor-stop-radius",
  "--cui-gradient-editor-stop-border-color",
  "--cui-gradient-editor-stop-shadow",
  "--cui-gradient-editor-add-radius",
  "--cui-gradient-editor-add-border-color",
] as const;
export type GradientEditorKnobStyle = Partial<Record<(typeof gradientEditorKnobs)[number], string>>;
