"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ComponentProps } from "react";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuSeparatorProps,
  DropdownMenuTriggerProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

type RefinedDropdownMenuTriggerProps = DropdownMenuTriggerProps &
  Pick<ComponentProps<typeof MenuPrimitive.Trigger>, "nativeButton" | "render">;

export function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  return <MenuPrimitive.Root {...props}>{children}</MenuPrimitive.Root>;
}

export function DropdownMenuTrigger({
  size = "sm",
  iconOnly = false,
  variant = "surface",
  className,
  children,
  disabled,
  ...props
}: RefinedDropdownMenuTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-control-ui="dropdown-menu"
      data-control-family="button"
      data-slot="trigger"
      data-control="true"
      data-size={size}
      data-icon-only={iconOnly ? "true" : undefined}
      data-variant={variant}
      data-tone="neutral"
      data-shape="default"
      className={cn(
        "relative isolate inline-flex shrink-0 items-center justify-center overflow-visible",
        controlSize({ size }),
        iconOnly && "aspect-square px-0",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span
        data-control-ui="button"
        data-control-family="button"
        data-slot="content"
        className="relative z-[1] inline-flex items-center justify-center gap-[inherit]"
      >
        {children}
      </span>
    </MenuPrimitive.Trigger>
  );
}

export function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      {/* portal escapes every token-scoped ancestor, so scope is re-asserted here */}
      <MenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-[80]"
      >
        <MenuPrimitive.Popup
          data-control-ui="dropdown-menu"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn("min-w-[max(11rem,var(--anchor-width))]", className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-control-ui="dropdown-menu"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(popupItemStructureClasses, "px-[calc(var(--padding-x)*0.5)] py-1", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    // bleeds rule through popup padding so it spans edge to edge while rows keep their inset
    <MenuPrimitive.Separator
      data-control-ui="dropdown-menu"
      data-slot="separator"
      data-control-family="popup"
      data-popup-part="separator"
      className={cn("-mx-[var(--popover-padding)] my-1 h-px", className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      data-control-ui="dropdown-menu"
      data-slot="label"
      data-control-family="popup"
      data-popup-part="label"
      className={cn("px-2 py-1", className)}
      {...props}
    />
  );
}
