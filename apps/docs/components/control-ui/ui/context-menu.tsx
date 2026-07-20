"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { ComponentProps } from "react";
import type {
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuSeparatorProps,
  ContextMenuShortcutProps,
  ContextMenuSubContentProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuTriggerProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinFamily, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";

// Composes like DropdownMenu with a right-click/long-press trigger; API is shadcn/ui context-menu compatible.
// Popup + rows share Control UI popover/row tokens with DropdownMenu and Select popups.

const popupClasses = cn("min-w-[10rem]", floatingListContentClasses);

// group/cmi lets gutter glyphs and shortcuts key off the highlighted row if a pack wants them to.
const itemClasses = cn("group/cmi relative", floatingListItemClasses);

export function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger
      data-control-ui="context-menu"
      data-slot="trigger"
      className={cn(skinSlot("context-menu", "trigger", {}), className)}
      {...props}
    />
  );
}

export function ContextMenuPortal(props: ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal {...props} />;
}

export function ContextMenuGroup({ className, ...props }: ContextMenuGroupProps) {
  return (
    <ContextMenuPrimitive.Group
      data-control-ui="context-menu"
      data-slot="group"
      className={cn(skinSlot("context-menu", "group", {}), className)}
      {...props}
    />
  );
}

export function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      {/* Portals land outside token-scoped ancestor; positioner re-asserts skin scope, anchors to pointer (no side/align). */}
      <ContextMenuPrimitive.Positioner data-skin={skinId()} data-effects={skinEffects()} className="z-[80] outline-none">
        <ContextMenuPrimitive.Popup
          data-control-ui="context-menu"
          data-slot="content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn(popupClasses, skinFamily("popup", "list-surface"), skinSlot("context-menu", "content", {}), className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItem({ className, inset = false, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-control-ui="context-menu"
      data-slot="item"
      data-popup-part="item"
      className={cn(
        itemClasses,
        inset && "pl-8",
        skinFamily("popup", "item"),
        skinSlot("context-menu", "item", { disabled: Boolean(props.disabled) }),
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-control-ui="context-menu"
      data-slot="checkbox-item"
      data-popup-part="item"
      className={cn(
        itemClasses,
        "pl-8",
        skinFamily("popup", "item"),
        skinSlot("context-menu", "checkbox-item", { disabled: Boolean(props.disabled) }),
        className,
      )}
      {...props}
    >
      {/* ✓ gutter — inherits currentColor */}
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export function ContextMenuRadioGroup({ className, ...props }: ContextMenuRadioGroupProps) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-control-ui="context-menu"
      data-slot="radio-group"
      className={cn(skinSlot("context-menu", "radio-group", {}), className)}
      {...props}
    />
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-control-ui="context-menu"
      data-slot="radio-item"
      data-popup-part="item"
      className={cn(
        itemClasses,
        "pl-8",
        skinFamily("popup", "item"),
        skinSlot("context-menu", "radio-item", { disabled: Boolean(props.disabled) }),
        className,
      )}
      {...props}
    >
      {/* • gutter — a filled dot in currentColor */}
      <span className="pointer-events-none absolute left-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <span className="block size-1.5 rounded-full bg-current" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export function ContextMenuLabel({ className, inset = false, ...props }: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-control-ui="context-menu"
      data-slot="label"
      data-popup-part="label"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-1 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground",
        inset && "pl-8",
        skinFamily("popup", "label"),
        skinSlot("context-menu", "label", {}),
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-control-ui="context-menu"
      data-slot="separator"
      data-popup-part="separator"
      className={cn(
        "-mx-[var(--popover-padding)] my-1 h-px bg-border",
        skinFamily("popup", "separator"),
        skinSlot("context-menu", "separator", {}),
        className,
      )}
      {...props}
    />
  );
}

// Right-aligned ⌘-style keyboard hint.
export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  return (
    <span
      data-control-ui="context-menu"
      data-slot="shortcut"
      data-popup-part="shortcut"
      className={cn(
        "ml-auto pl-6 text-body tracking-[0.02em] text-muted-foreground",
        skinFamily("popup", "shortcut"),
        skinSlot("context-menu", "shortcut", {}),
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSub(props: ContextMenuSubProps) {
  return <ContextMenuPrimitive.SubmenuRoot {...props} />;
}

export function ContextMenuSubTrigger({ className, inset = false, children, ...props }: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-control-ui="context-menu"
      data-slot="sub-trigger"
      data-popup-part="item"
      className={cn(
        itemClasses,
        "data-[popup-open]:bg-foreground/6",
        inset && "pl-8",
        skinFamily("popup", "item"),
        skinSlot("context-menu", "sub-trigger", { disabled: Boolean(props.disabled) }),
        className,
      )}
      {...props}
    >
      {children}
      {/* › submenu chevron — follows the row's currentColor */}
      <span aria-hidden="true" className="ml-auto pl-4 text-body leading-none">
        ›
      </span>
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

export function ContextMenuSubContent({ className, children, ...props }: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        className="z-[80] outline-none"
        sideOffset={-4}
        alignOffset={-5}
      >
        <ContextMenuPrimitive.Popup
          data-control-ui="context-menu"
          data-slot="sub-content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn(popupClasses, skinFamily("popup", "list-surface"), skinSlot("context-menu", "sub-content", {}), className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}
