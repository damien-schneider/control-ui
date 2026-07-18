"use client";

import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import type { CheckboxGroupProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Layout-only wrapper: flex column flips to row on orientation="horizontal" (visual only, each
// Checkbox owns its own focus). Pass `allValues` + a select-all Checkbox for the indeterminate state.
// Import `Checkbox` from ui/checkbox for children; this module does not re-export it.
export function CheckboxGroup({ className, orientation = "vertical", ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      data-control-ui="checkbox-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn(
        "flex flex-col gap-2.5 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4",
        skinSlot("checkbox-group", "root", {}),
        className,
      )}
      {...props}
    />
  );
}
