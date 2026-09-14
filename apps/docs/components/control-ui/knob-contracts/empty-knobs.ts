// Generated from src/registry/sources/control-ui/recipes/empty.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const emptyKnobs = [
  "--cui-empty-radius",
  "--cui-empty-background",
  "--cui-empty-border-color",
  "--cui-empty-border-width",
  "--cui-empty-border-style",
  "--cui-empty-media-radius",
  "--cui-empty-media-background",
  "--cui-empty-shadow",
  "--cui-empty-foreground",
  "--cui-empty-description-foreground",
  "--cui-empty-media-foreground",
  "--cui-empty-padding",
  "--cui-empty-gap",
  "--cui-empty-header-gap",
  "--cui-empty-content-gap",
  "--cui-empty-content-size",
  "--cui-empty-media-size",
  "--cui-empty-media-icon-size",
  "--cui-empty-font-size",
  "--cui-empty-title-font-weight",
] as const;
export type EmptyKnobStyle = Partial<Record<(typeof emptyKnobs)[number], string>>;
