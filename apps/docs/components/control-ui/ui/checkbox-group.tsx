"use client";

import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import type { ComponentProps } from "react";
import type { ControlledMultiChoice, HoverIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { cn } from "@/components/control-ui/lib/cn";
import { skinIndicator } from "@/components/control-ui/skin";

export type CheckboxGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledMultiChoice & {
    allValues?: string[];
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
    indicator?: HoverIndicator;
  };

export function CheckboxGroup({ className, orientation = "vertical", indicator, children, ...props }: CheckboxGroupProps) {
  const resolvedIndicator = indicator ?? skinIndicator("checkbox-group") ?? "none";
  return (
    <CheckboxGroupPrimitive
      data-control-ui="checkbox-group"
      data-control-family="checkbox-group"
      data-slot="root"
      data-orientation={orientation}
      data-track={resolvedIndicator}
      className={cn(
        "flex flex-col gap-2.5 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4 data-[track=hover]:relative data-[track=hover]:isolate data-[track=hover]:gap-0",
        className,
      )}
      {...props}
    >
      {children}
      {resolvedIndicator === "hover" ? <TrackHighlight /> : null}
    </CheckboxGroupPrimitive>
  );
}

export function CheckboxGroupItem({ className, htmlFor, children, ...props }: ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      data-control-ui="checkbox-group"
      data-slot="item"
      data-track-item=""
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-(--radius-control) p-2 text-body has-[[data-disabled]]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
