// Generated from src/registry/sources/control-ui/recipes/chat-composer.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const chatComposerKnobs = [
  "--cui-chat-composer-root-background",
  "--cui-chat-composer-shell-radius",
  "--cui-chat-composer-shell-background",
  "--cui-chat-composer-shell-background-image",
  "--cui-chat-composer-shell-backdrop-filter",
  "--cui-chat-composer-shell-border-color",
  "--cui-chat-composer-shell-shadow",
  "--cui-chat-composer-input-foreground",
  "--cui-chat-composer-input-placeholder-foreground",
  "--cui-chat-composer-mention-background",
  "--cui-chat-composer-mention-radius",
  "--cui-chat-composer-mention-border-color",
  "--cui-chat-composer-mention-border-width",
] as const;
export type ChatComposerKnobStyle = Partial<Record<(typeof chatComposerKnobs)[number], string>>;
