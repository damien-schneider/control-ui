// Generated from src/registry/sources/control-ui/recipes/skeleton.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const skeletonKnobs = [
  "--cui-skeleton-radius",
  "--cui-skeleton-background",
  "--cui-skeleton-background-image",
  "--cui-skeleton-highlight-background",
  "--cui-skeleton-animation-duration",
  "--cui-skeleton-easing",
  "--cui-skeleton-pulse-opacity",
] as const;
export type SkeletonKnobStyle = Partial<Record<(typeof skeletonKnobs)[number], string>>;
