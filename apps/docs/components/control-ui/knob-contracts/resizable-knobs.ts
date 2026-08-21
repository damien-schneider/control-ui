// Generated from src/registry/sources/control-ui/recipes/resizable.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const resizableKnobs = [
  "--cui-resizable-group-background",
  "--cui-resizable-group-radius",
  "--cui-resizable-group-border-color",
  "--cui-resizable-handle-color",
  "--cui-resizable-handle-hover-background",
  "--cui-resizable-handle-active-background",
  "--cui-resizable-grip-radius",
  "--cui-resizable-grip-background",
  "--cui-resizable-grip-foreground",
] as const;
export type ResizableKnobStyle = Partial<Record<(typeof resizableKnobs)[number], string>>;
