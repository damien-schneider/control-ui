// Generated from src/registry/sources/control-ui/recipes/avatar.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const avatarKnobs = [
  "--cui-avatar-radius",
  "--cui-avatar-group-ring-color",
  "--cui-avatar-fallback-background",
  "--cui-avatar-fallback-foreground",
] as const;
export type AvatarKnobStyle = Partial<Record<(typeof avatarKnobs)[number], string>>;
