"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { useEffect, useRef } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

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
  style,
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
          {...skinScopeAttributes(skin)}
          anchor={anchorRect === null ? undefined : () => ({ getBoundingClientRect: () => anchorRect })}
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-(--z-popup)"
        >
          <PopoverPrimitive.Popup
            data-control-ui="trigger-menu"
            data-popup-kind="trigger-menu"
            data-control-family="popup"
            data-slot="root"
            data-surface="floating"
            data-popup-part="list-surface"
            role="presentation"
            initialFocus={false}
            finalFocus={false}
            onMouseDown={(event) => event.preventDefault()}
            style={style}
            className={cn("grid w-64 grid-rows-[minmax(0,1fr)]", className)}
          >
            <ScrollArea lockAxis="x">{children}</ScrollArea>
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

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

// Scrolls only the menu's own scroller; scrollIntoView would also scroll the page whenever the popup sits outside the viewport.
function revealInMenu(item: HTMLElement) {
  const surface = item.closest('[data-popup-part="list-surface"]');
  if (surface === null) return;
  for (let scroller = item.parentElement; scroller !== null; scroller = scroller.parentElement) {
    const { overflowY } = getComputedStyle(scroller);
    if (overflowY === "auto" || overflowY === "scroll") {
      const itemRect = item.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      if (itemRect.top < scrollerRect.top) scroller.scrollTop -= scrollerRect.top - itemRect.top;
      else if (itemRect.bottom > scrollerRect.bottom) scroller.scrollTop += itemRect.bottom - scrollerRect.bottom;
      return;
    }
    if (scroller === surface) return;
  }
}

export function TriggerMenuItem({
  className,
  active = false,
  disabled = false,
  onMouseDown,
  onClick,
  ref,
  ...props
}: TriggerMenuItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const item = itemRef.current;
    // A hovered item was activated by the pointer and is already under it; only keyboard moves need revealing.
    if (active && item !== null && !item.matches(":hover")) revealInMenu(item);
  }, [active]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: options never take focus; the text input that owns the menu handles the keyboard.
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
      onClick={disabled ? undefined : onClick}
      className={cn(popupItemStructureClasses, className)}
      {...props}
      ref={(node) => {
        itemRef.current = node;
        return setRef(ref, node);
      }}
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
      className={cn("flex shrink-0 items-center justify-center", className)}
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
      className={className}
      {...props}
    />
  );
}

export function TriggerMenuGroup({ className, ...props }: TriggerMenuGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA listbox option groups are role="group"; a fieldset is a form grouping.
    <div
      data-control-ui="trigger-menu"
      data-control-family="popup"
      data-popup-kind="trigger-menu"
      data-slot="group"
      role="group"
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
      className={className}
      {...props}
    />
  );
}
