// Generated from src/registry/sources/control-ui/recipes/dockable-panel.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const dockablePanelKnobs = [
  "--cui-dockable-panel-radius",
  "--cui-dockable-panel-background",
  "--cui-dockable-panel-foreground",
  "--cui-dockable-panel-border-color",
  "--cui-dockable-panel-shadow",
  "--cui-dockable-panel-drop-zone-active-background",
  "--cui-dockable-panel-drop-zone-active-border-color",
] as const;
export type DockablePanelKnobStyle = Partial<Record<(typeof dockablePanelKnobs)[number], string>>;
