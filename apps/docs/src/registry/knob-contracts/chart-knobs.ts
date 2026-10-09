// Generated from src/registry/sources/control-ui/recipes/chart.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const chartKnobs = [
  "--cui-chart-foreground",
  "--cui-chart-background",
  "--cui-chart-line-size",
  "--cui-chart-area-opacity",
  "--cui-chart-hatch-opacity",
  "--cui-chart-hatch-tint-opacity",
  "--cui-chart-tooltip-background",
  "--cui-chart-tooltip-foreground",
  "--cui-chart-tooltip-border-color",
  "--cui-chart-tooltip-border-width",
  "--cui-chart-tooltip-radius",
  "--cui-chart-tooltip-shadow",
  "--cui-chart-tooltip-padding",
  "--cui-chart-legend-gap",
  "--cui-chart-swatch-size",
  "--cui-chart-swatch-radius",
  "--cui-chart-animation-duration",
  "--cui-chart-transition-duration",
  "--cui-chart-easing",
] as const;
export type ChartKnobStyle = Partial<Record<(typeof chartKnobs)[number], string>>;
