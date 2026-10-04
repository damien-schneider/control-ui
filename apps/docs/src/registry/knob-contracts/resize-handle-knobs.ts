// Generated from src/registry/sources/control-ui/recipes/resize-handle.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const resizeHandleKnobs = [
  "--cui-resize-handle-size",
  "--cui-resize-handle-hit-size",
  "--cui-resize-handle-background",
  "--cui-resize-handle-hover-background",
  "--cui-resize-handle-border-color",
  "--cui-resize-handle-border-width",
  "--cui-resize-handle-radius",
] as const;
export type ResizeHandleKnobStyle = Partial<Record<(typeof resizeHandleKnobs)[number], string>>;
