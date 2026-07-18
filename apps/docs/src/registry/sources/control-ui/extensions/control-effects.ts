import type { ControlEffect } from "@/components/control-ui/contracts";

export type { ControlEffect } from "@/components/control-ui/contracts";

export type ControlEffectValue = ControlEffect | ControlEffect[];

export function controlEffectsAttribute(effects?: ControlEffectValue) {
  if (!effects) return undefined;
  const values = Array.isArray(effects) ? effects : [effects];
  const value = values.filter(Boolean).join(" ");
  return value.length > 0 ? value : undefined;
}
