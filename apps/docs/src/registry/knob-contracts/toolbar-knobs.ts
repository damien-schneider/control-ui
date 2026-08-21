// Generated from src/registry/sources/control-ui/recipes/toolbar.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const toolbarKnobs = [
  "--cui-toolbar-radius",
  "--cui-toolbar-padding",
  "--cui-toolbar-background",
  "--cui-toolbar-foreground",
  "--cui-toolbar-border-color",
  "--cui-toolbar-shadow",
  "--cui-toolbar-item-radius",
  "--cui-toolbar-item-background",
  "--cui-toolbar-item-shadow",
  "--cui-toolbar-item-foreground",
  "--cui-toolbar-item-hover-background",
  "--cui-toolbar-item-hover-foreground",
  "--cui-toolbar-item-active-background",
  "--cui-toolbar-item-active-foreground",
  "--cui-toolbar-separator-background",
] as const;
export type ToolbarKnobStyle = Partial<Record<(typeof toolbarKnobs)[number], string>>;
