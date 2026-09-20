// Generated from src/registry/sources/control-ui/recipes/context.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const contextKnobs = [
  "--cui-context-graph-radius",
  "--cui-context-legend-indicator-radius",
  "--cui-context-segment-system-fill",
  "--cui-context-segment-cache-fill",
  "--cui-context-track-fill",
  "--cui-context-segment-tool-fill",
  "--cui-context-segment-message-fill",
  "--cui-context-segment-source-fill",
  "--cui-context-segment-reasoning-fill",
  "--cui-context-overage-fill",
  "--cui-context-limit-marker-color",
] as const;
export type ContextKnobStyle = Partial<Record<(typeof contextKnobs)[number], string>>;
