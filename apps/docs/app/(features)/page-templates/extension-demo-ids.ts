import type { ComponentId, ExtensionId } from "@/app/(features)/model/types";

export const controlEffectsDemoComponentId: ComponentId = "button";

const extensionDemoComponentIds: Partial<Record<ExtensionId, ComponentId>> = { "control-effects": controlEffectsDemoComponentId };

export function extensionDemoComponentId(extensionId: ExtensionId): ComponentId | undefined {
  return extensionDemoComponentIds[extensionId];
}

export function hasExtensionDemo(extensionId: ExtensionId): boolean {
  return extensionDemoComponentId(extensionId) !== undefined;
}
