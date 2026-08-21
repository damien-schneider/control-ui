// Generated from src/registry/sources/control-ui/recipes/track-highlight.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const trackHighlightKnobs = [
  "--cui-track-highlight-radius",
  "--cui-track-highlight-background",
  "--cui-track-highlight-hover-background",
  "--cui-track-highlight-ring-color",
  "--cui-track-highlight-shadow",
  "--cui-track-highlight-transition-duration",
] as const;
export type TrackHighlightKnobStyle = Partial<Record<(typeof trackHighlightKnobs)[number], string>>;
