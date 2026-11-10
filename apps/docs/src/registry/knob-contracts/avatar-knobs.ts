// Generated from src/registry/sources/control-ui/recipes/avatar.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const avatarKnobs = [
  "--cui-avatar-size",
  "--cui-avatar-radius",
  "--cui-avatar-group-gap",
  "--cui-avatar-group-ring-size",
  "--cui-avatar-group-ring-color",
  "--cui-avatar-fallback-background",
  "--cui-avatar-fallback-foreground",
  "--cui-avatar-image-outline-color",
  "--cui-avatar-badge-size",
  "--cui-avatar-badge-radius",
  "--cui-avatar-badge-ring-size",
  "--cui-avatar-badge-ring-color",
  "--cui-avatar-badge-background",
  "--cui-avatar-badge-foreground",
  "--cui-avatar-badge-online-background",
  "--cui-avatar-badge-away-background",
  "--cui-avatar-badge-busy-background",
  "--cui-avatar-badge-offline-background",
] as const;
export type AvatarKnobStyle = Partial<Record<(typeof avatarKnobs)[number], string>>;
