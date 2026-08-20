"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { ComponentProps, CSSProperties } from "react";
import type {
  SelectContentProps,
  SelectItemProps,
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

type RefinedSelectTriggerProps = SelectTriggerProps &
  Pick<ComponentProps<typeof SelectPrimitive.Trigger>, "nativeButton" | "render"> & { style?: CSSProperties & PopupKnobStyle };

// Base UI's own root is generic (`SelectRoot<Value>`) and reports null once selection is cleared;
// naming TValue here is what keeps caller's literal union alive, and null never reaches declared value.
export function Select<TValue extends string = string>({ children, onValueChange, ...props }: SelectProps<TValue>) {
  return (
    <SelectPrimitive.Root<TValue>
      {...props}
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value);
      }}
    >
      {children}
    </SelectPrimitive.Root>
  );
}

export function SelectTrigger({ size = "sm", variant = "surface", className, children, disabled, ...props }: RefinedSelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-control-ui="select"
      data-control-family="button"
      data-slot="trigger"
      data-control="true"
      data-size={size}
      data-variant={variant}
      data-tone="neutral"
      data-shape="default"
      className={cn(
        "group relative isolate inline-flex shrink-0 items-center justify-between overflow-visible",
        controlSize({ size }),
        className,
      )}
      disabled={disabled}
      {...props}
      data-select-part="trigger"
    >
      <span
        data-control-ui="button"
        data-control-family="button"
        data-slot="content"
        className="relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]"
      >
        {children}
      </span>
      <SelectPrimitive.Icon
        data-control-ui="select"
        data-control-family="popup"
        data-popup-kind="select"
        data-slot="icon"
        data-select-part="icon"
        className="relative z-[1]"
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({ children, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value className="min-w-0 truncate" {...props}>
      {children}
    </SelectPrimitive.Value>
  );
}

export function SelectContent({ className, children, ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      {/* portal lands outside container-scoped skin root, so scope is re-asserted here */}
      <SelectPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-[80]"
      >
        <SelectPrimitive.Popup
          data-control-ui="select"
          data-popup-kind="select"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn("max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto", className)}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, disabled, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-control-ui="select"
      data-popup-kind="select"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      disabled={disabled}
      className={cn(popupItemStructureClasses, "px-[calc(var(--padding-x)*0.5)] py-1", className)}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">{children}</SelectPrimitive.ItemText>
      <span
        data-control-ui="select"
        data-control-family="popup"
        data-popup-kind="select"
        data-slot="item-indicator"
        className="flex size-3.5 shrink-0 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
