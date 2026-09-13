"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

export type TriggerMenuProps = {
  open: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  anchorRect: DOMRect | null;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  children?: ReactNode;
} & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuListProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuItemProps = Omit<
  Omit<ComponentProps<"div">, "onSelect"> & {
    active?: boolean;
    disabled?: boolean;
  },
  "style"
> & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuEmptyProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuGroupProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuGroupLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type TriggerMenuIconProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export function TriggerMenu({
  open,
  onOpenChange,
  anchorRect,
  side = "top",
  align = "start",
  sideOffset = 8,
  className,
  children,
}: TriggerMenuProps) {
  const skin = useSkin();
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(next, eventDetails) => onOpenChange?.(next, eventDetails)} modal={false}>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          data-control-ui="trigger-menu"
          data-popup-kind="trigger-menu"
          data-control-family="popup"
          data-slot="positioner"
          data-skin={skin.id}
          data-effects={controlEffectsAttribute(skin.effects)}
          anchor={anchorRect === null ? undefined : () => ({ getBoundingClientRect: () => anchorRect })}
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-[80]"
        >
          <PopoverPrimitive.Popup
            data-control-ui="trigger-menu"
            data-popup-kind="trigger-menu"
            data-control-family="popup"
            data-slot="root"
            data-surface="floating"
            data-popup-part="list-surface"
            initialFocus={false}
            finalFocus={false}
            className={cn("max-h-[min(18rem,var(--available-height))] w-64 max-w-[var(--available-width)] overflow-y-auto", className)}
          >
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function TriggerMenuList({ className, ...props }: TriggerMenuListProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-popup-kind="trigger-menu"
      data-slot="list"
      data-control-family="popup"
      data-popup-part="list-content"
      role="listbox"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export function TriggerMenuItem({ className, active = false, disabled = false, onMouseDown, ...props }: TriggerMenuItemProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-popup-kind="trigger-menu"
      data-control-family="popup"
      data-slot="item"
      data-popup-part="item"
      role="option"
      tabIndex={-1}
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-highlighted={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      onMouseDown={(event) => {
        event.preventDefault();
        if (disabled) return;
        onMouseDown?.(event);
      }}
      className={cn(popupItemStructureClasses, className)}
      {...props}
    />
  );
}

export function TriggerMenuIcon({ className, ...props }: TriggerMenuIconProps) {
  return (
    <span
      data-control-ui="trigger-menu"
      data-control-family="popup"
      data-popup-kind="trigger-menu"
      data-slot="icon"
      className={cn("flex shrink-0 items-center justify-center [&_svg]:size-4", className)}
      {...props}
    />
  );
}

export function TriggerMenuEmpty({ className, ...props }: TriggerMenuEmptyProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-control-family="popup"
      data-popup-kind="trigger-menu"
      data-slot="empty"
      className={cn("px-[calc(var(--padding-x)*0.5)]", className)}
      {...props}
    />
  );
}

export function TriggerMenuGroup({ className, ...props }: TriggerMenuGroupProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-control-family="popup"
      data-popup-kind="trigger-menu"
      data-slot="group"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export function TriggerMenuGroupLabel({ className, ...props }: TriggerMenuGroupLabelProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-popup-kind="trigger-menu"
      data-slot="group-label"
      data-control-family="popup"
      data-popup-part="label"
      className={cn("px-[calc(var(--padding-x)*0.5)]", className)}
      {...props}
    />
  );
}
