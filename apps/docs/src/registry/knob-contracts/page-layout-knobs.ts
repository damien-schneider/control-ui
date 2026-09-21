// Generated from src/registry/sources/control-ui/recipes/page-layout.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const pageLayoutKnobs = [
  "--cui-page-layout-article-size",
  "--cui-page-layout-aside-size",
  "--cui-page-layout-padding-inline",
  "--cui-page-layout-padding-block",
  "--cui-page-layout-column-gap",
  "--cui-page-layout-header-gap",
  "--cui-page-layout-header-column-gap",
  "--cui-page-layout-header-row-gap",
  "--cui-page-layout-size",
  "--cui-page-layout-sticky-gap",
] as const;
export type PageLayoutKnobStyle = Partial<Record<(typeof pageLayoutKnobs)[number], string>>;
