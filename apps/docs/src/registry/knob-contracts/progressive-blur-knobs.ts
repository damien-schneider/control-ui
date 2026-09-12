// Generated from src/registry/sources/control-ui/recipes/progressive-blur.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const progressiveBlurKnobs = [
  "--cui-progressive-blur-size",
  "--cui-progressive-blur-backdrop-blur",
  "--cui-progressive-blur-transition-duration",
  "--cui-progressive-blur-transition-delay",
] as const;
export type ProgressiveBlurKnobStyle = Partial<Record<(typeof progressiveBlurKnobs)[number], string>>;
