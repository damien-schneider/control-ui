// Generated from src/registry/sources/control-ui/recipes/infinite-canvas.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const infiniteCanvasKnobs = [
  "--cui-infinite-canvas-radius",
  "--cui-infinite-canvas-background",
  "--cui-infinite-canvas-grid-dot-color",
  "--cui-infinite-canvas-border-color",
  "--cui-infinite-canvas-padding",
] as const;
export type InfiniteCanvasKnobStyle = Partial<Record<(typeof infiniteCanvasKnobs)[number], string>>;
