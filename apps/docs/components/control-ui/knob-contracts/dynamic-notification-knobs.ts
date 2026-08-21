// Generated from src/registry/sources/control-ui/recipes/dynamic-notification.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const dynamicNotificationKnobs = [
  "--cui-dynamic-notification-content-easing",
  "--cui-dynamic-notification-expanded-radius",
  "--cui-dynamic-notification-morph-easing",
  "--cui-dynamic-notification-glass-foreground",
  "--cui-dynamic-notification-glass-ring-color",
  "--cui-dynamic-notification-liquid-foreground",
  "--cui-dynamic-notification-surface-background",
  "--cui-dynamic-notification-surface-foreground",
  "--cui-dynamic-notification-surface-ring-color",
  "--cui-dynamic-notification-surface-shadow",
  "--cui-dynamic-notification-indicator-end",
  "--cui-dynamic-notification-indicator-middle",
  "--cui-dynamic-notification-indicator-start",
] as const;
export type DynamicNotificationKnobStyle = Partial<Record<(typeof dynamicNotificationKnobs)[number], string>>;
