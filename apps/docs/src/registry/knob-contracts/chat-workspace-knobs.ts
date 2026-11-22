// Generated from src/registry/sources/control-ui/recipes/chat-workspace.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const chatWorkspaceKnobs = [
  "--cui-chat-workspace-gap",
  "--cui-chat-workspace-island-max-inline-size",
  "--cui-chat-workspace-transcript-block-size",
  "--cui-chat-workspace-background",
  "--cui-chat-workspace-foreground",
  "--cui-chat-workspace-border-color",
  "--cui-chat-workspace-border-width",
  "--cui-chat-workspace-radius",
  "--cui-chat-workspace-shadow",
  "--cui-chat-workspace-handle-background",
] as const;
export type ChatWorkspaceKnobStyle = Partial<Record<(typeof chatWorkspaceKnobs)[number], string>>;
