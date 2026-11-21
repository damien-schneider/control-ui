"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Checkbox } from "@/components/control-ui/ui/checkbox";
import { useMarkdownEditor } from "../../context";
import type { TaskCheckboxes } from "./widgets";

export function LiveTaskCheckboxes({ registry }: { registry: TaskCheckboxes }) {
  const entries = useSyncExternalStore(registry.subscribe, registry.getSnapshot, registry.getSnapshot);
  const { disabled, readOnly, labels } = useMarkdownEditor();
  return entries.map(({ host, key, checkbox }) =>
    createPortal(
      <Checkbox
        checked={checkbox.checked}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={checkbox.label || labels.taskItem}
        onCheckedChange={(checked) => checkbox.toggle(checked)}
      />,
      host,
      key,
    ),
  );
}
