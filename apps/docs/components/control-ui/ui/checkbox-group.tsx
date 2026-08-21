"use client";

import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import type { ComponentProps } from "react";
import type { ControlledMultiChoice } from "@/components/control-ui/control-props";
import { cn } from "@/components/control-ui/lib/cn";

export type CheckboxGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledMultiChoice & {
    allValues?: string[];
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
  };

// `orientation` is visual only — each Checkbox owns its own focus. Pair `allValues` with select-all Checkbox for indeterminate state.
export function CheckboxGroup({ className, orientation = "vertical", ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      data-control-ui="checkbox-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn("flex flex-col gap-2.5 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4", className)}
      {...props}
    />
  );
}
