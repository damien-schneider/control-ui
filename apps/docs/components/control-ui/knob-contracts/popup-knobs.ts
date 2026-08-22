// Generated from src/registry/sources/control-ui/recipes/popup.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const popupKnobs = [
  "--cui-popup-radius",
  "--cui-popup-background",
  "--cui-popup-foreground",
  "--cui-popup-border-color",
  "--cui-popup-border-width",
  "--cui-popup-shadow",
  "--cui-popup-backdrop-filter",
  "--cui-popup-backdrop-background",
  "--cui-popup-item-radius",
  "--cui-popup-item-foreground",
  "--cui-popup-item-highlight-background",
  "--cui-popup-item-highlight-foreground",
  "--cui-popup-item-highlight-muted-foreground",
  "--cui-popup-item-disabled-opacity",
  "--cui-popup-separator-color",
  "--cui-popup-shortcut-foreground",
] as const;
export type PopupKnobStyle = Partial<Record<(typeof popupKnobs)[number], string>>;
