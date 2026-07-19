"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type {
  TriggerMenuEmptyProps,
  TriggerMenuGroupLabelProps,
  TriggerMenuGroupProps,
  TriggerMenuIconProps,
  TriggerMenuItemProps,
  TriggerMenuListProps,
  TriggerMenuProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";

// VIEW half of trigger-menu primitive: Base UI Popover controlled by headless engine (open + virtual anchor at caret rect), not a trigger button.
// Rides shared popover token set (--radius-popover, shadow-pop); rows match menu/select rows (--control-h-xs, --radius-popup-item).
// initialFocus/finalFocus={false} keep focus in editor so arrow/Enter keep flowing to caret while menu is up.

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
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(next, eventDetails) => onOpenChange?.(next, eventDetails)} modal={false}>
      <PopoverPrimitive.Portal>
        {/* Portals land outside token-scoped subtree (and ChatLayout's overflow clip); positioner re-asserts skin scope itself. Anchor = virtual element at caret rect engine reported. */}
        <PopoverPrimitive.Positioner
          data-skin={skinId()}
          data-effects={skinEffects()}
          anchor={anchorRect === null ? undefined : () => ({ getBoundingClientRect: () => anchorRect })}
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-[80] outline-none"
        >
          <PopoverPrimitive.Popup
            data-control-ui="trigger-menu"
            data-slot="root"
            data-surface="floating"
            initialFocus={false}
            finalFocus={false}
            className={cn(
              "max-h-[min(18rem,var(--available-height))] w-64 max-w-[var(--available-width)] overflow-y-auto",
              floatingListContentClasses,
              skinSlot("trigger-menu", "root", {}),
              className,
            )}
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
      data-slot="list"
      role="listbox"
      className={cn("flex flex-col gap-0.5", skinSlot("trigger-menu", "list", {}), className)}
      {...props}
    />
  );
}

export function TriggerMenuItem({ className, active = false, disabled = false, onMouseDown, ...props }: TriggerMenuItemProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-slot="item"
      role="option"
      // Listbox options driven by editor's keyboard, not tab focus; -1 keeps them out of tab order while satisfying focusable-interactive contract.
      tabIndex={-1}
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-highlighted={active ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      // Keep focus in the editor/textarea when a row is clicked so the insertion still targets the caret.
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      className={cn(floatingListItemClasses, skinSlot("trigger-menu", "item", { highlighted: active, disabled }), className)}
      {...props}
    />
  );
}

export function TriggerMenuIcon({ className, ...props }: TriggerMenuIconProps) {
  return (
    <span
      data-control-ui="trigger-menu"
      data-slot="icon"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4",
        skinSlot("trigger-menu", "icon", {}),
        className,
      )}
      {...props}
    />
  );
}

export function TriggerMenuEmpty({ className, ...props }: TriggerMenuEmptyProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-slot="empty"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-2 text-body text-muted-foreground",
        skinSlot("trigger-menu", "empty", {}),
        className,
      )}
      {...props}
    />
  );
}

export function TriggerMenuGroup({ className, ...props }: TriggerMenuGroupProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-slot="group"
      className={cn("flex flex-col gap-0.5", skinSlot("trigger-menu", "group", {}), className)}
      {...props}
    />
  );
}

export function TriggerMenuGroupLabel({ className, ...props }: TriggerMenuGroupLabelProps) {
  return (
    <div
      data-control-ui="trigger-menu"
      data-slot="group-label"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] pb-0.5 pt-1 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground",
        skinSlot("trigger-menu", "group-label", {}),
        className,
      )}
      {...props}
    />
  );
}
