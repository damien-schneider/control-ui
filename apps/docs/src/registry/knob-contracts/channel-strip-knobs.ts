// Generated from src/registry/sources/control-ui/recipes/channel-strip.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const channelStripKnobs = [
  "--cui-channel-strip-size",
  "--cui-channel-strip-body-height",
  "--cui-channel-strip-separator-color",
  "--cui-channel-strip-value-foreground",
] as const;
export type ChannelStripKnobStyle = Partial<Record<(typeof channelStripKnobs)[number], string>>;
