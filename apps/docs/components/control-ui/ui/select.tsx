"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { ComponentProps } from "react";
import type {
  SelectContentProps,
  SelectItemProps,
  SelectProps,
  SelectTriggerProps,
  SelectTriggerVariant,
  SelectValueProps,
} from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinFamily, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";

// Trigger shares --radius-control and controlSize scale with Button/DropdownMenu trigger — same shape and height.

type RefinedSelectTriggerProps = SelectTriggerProps & Pick<ComponentProps<typeof SelectPrimitive.Trigger>, "nativeButton" | "render">;

export function Select({ children, onValueChange, ...props }: SelectProps) {
  return (
    <SelectPrimitive.Root {...props} onValueChange={onValueChange ? (value: string | null) => onValueChange(value ?? "") : undefined}>
      {children}
    </SelectPrimitive.Root>
  );
}

export function SelectTrigger({ size = "sm", variant = "surface", className, children, disabled, ...props }: RefinedSelectTriggerProps) {
  const variantClasses: Record<SelectTriggerVariant, string> = {
    surface: controlSurfaceClasses,
    ghost: "text-foreground hover:bg-foreground/6 data-[popup-open]:bg-foreground/7",
  };

  return (
    <SelectPrimitive.Trigger
      data-control-ui="select"
      data-slot="trigger"
      data-control="true"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-between overflow-visible rounded-[var(--radius-control)] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        controlSize({ size }),
        skinSlot("select", "trigger", { size, variant }),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span
        data-control-ui="button"
        data-slot="content"
        className={cn("relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]", skinSlot("button", "content", {}))}
      >
        {children}
      </span>
      <SelectPrimitive.Icon
        data-control-ui="select"
        data-slot="icon"
        className={cn(
          "relative z-[1] text-muted-foreground transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)] group-data-[popup-open]:rotate-180",
          skinSlot("select", "icon", {}),
        )}
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
      {/* Portals land outside container-scoped skin root; positioner re-asserts token scope itself. */}
      <SelectPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-[80] outline-none"
      >
        <SelectPrimitive.Popup
          data-control-ui="select"
          data-slot="content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn(
            "max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto",
            floatingListContentClasses,
            skinFamily("popup", "list-surface"),
            skinSlot("select", "content", {}),
            className,
          )}
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
      data-slot="item"
      data-popup-part="item"
      disabled={disabled}
      className={cn(
        floatingListItemClasses,
        skinFamily("popup", "item"),
        skinSlot("select", "item", { disabled: Boolean(disabled) }),
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">{children}</SelectPrimitive.ItemText>
      <span className="flex size-3.5 shrink-0 items-center justify-center text-foreground">
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
