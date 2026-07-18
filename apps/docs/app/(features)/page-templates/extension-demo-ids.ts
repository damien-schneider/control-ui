import type { ExtensionId } from "@/app/(features)/model/types";

export const extensionDemoIds = ["control-effects"] as const satisfies readonly ExtensionId[];

export function hasExtensionDemo(extensionId: ExtensionId): boolean {
  return extensionDemoIds.some((id) => id === extensionId);
}
