// Generated from src/registry/sources/control-ui/recipes/chat-layout.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const chatLayoutKnobs = [
  "--cui-chat-layout-radius",
  "--cui-chat-layout-background",
  "--cui-chat-layout-border-color",
  "--cui-chat-layout-shadow",
  "--cui-chat-layout-thought-foreground",
  "--cui-chat-layout-thought-hover-background",
] as const;
export type ChatLayoutKnobStyle = Partial<Record<(typeof chatLayoutKnobs)[number], string>>;
