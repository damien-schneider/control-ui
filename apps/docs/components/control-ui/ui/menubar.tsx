"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import type {
  MenubarContentProps,
  MenubarGroupProps,
  MenubarItemProps,
  MenubarLabelProps,
  MenubarMenuProps,
  MenubarProps,
  MenubarSeparatorProps,
  MenubarShortcutProps,
  MenubarSubContentProps,
  MenubarSubProps,
  MenubarSubTriggerProps,
  MenubarTriggerProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";

// Refined skin slot, 100% Base UI: Menubar root = horizontal row of Menu.Root menus, each trigger drops its own full Menu.
// Bar is thin bg-card/border rail; triggers are flat text buttons highlighting on data-[popup-open].
// Popups/rows reuse popover token set (--radius-popover, --radius-popup-item, --popover-padding) shared w/ Menu/Select/Context Menu.

const popupClasses = cn("min-w-[11rem]", floatingListContentClasses);

// Popup rows: height --control-h xs, radius --radius-popup-item, padding --padding-x — one token set across Menu/Select/Context Menu/Menubar.
const itemClasses = cn("group/mbi relative", floatingListItemClasses);

export function Menubar({ className, ...props }: MenubarProps) {
  return (
    <MenubarPrimitive
      data-control-ui="menubar"
      data-slot="root"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius-control)] ring-1 ring-inset ring-border bg-card p-1 shadow-xs",
        skinSlot("menubar", "root", {}),
        className,
      )}
      {...props}
    />
  );
}

export function MenubarMenu(props: MenubarMenuProps) {
  return <MenuPrimitive.Root {...props} />;
}

export function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <MenuPrimitive.Trigger
      data-control-ui="menubar"
      data-slot="trigger"
      data-control="true"
      data-size="sm"
      className={cn(
        "inline-flex cursor-default select-none items-center rounded-[var(--radius-control)] font-medium text-foreground outline-none transition hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-foreground/20 data-[popup-open]:bg-foreground/7 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45",
        controlSize({ size: "sm" }),
        skinSlot("menubar", "trigger", {}),
        className,
      )}
      {...props}
    />
  );
}

export function MenubarContent({ className, children, ...props }: MenubarContentProps) {
  return (
    <MenuPrimitive.Portal>
      {/* Portal escapes token-scoped ancestor — positioner re-asserts ACTIVE skin's scope (theme.css mirrors). */}
      <MenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={6}
        className="z-[80] outline-none"
      >
        <MenuPrimitive.Popup
          data-control-ui="menubar"
          data-slot="content"
          data-surface="floating"
          className={cn(popupClasses, skinSlot("menubar", "content", {}), className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

export function MenubarGroup({ className, ...props }: MenubarGroupProps) {
  return (
    <MenuPrimitive.Group
      data-control-ui="menubar"
      data-slot="group"
      className={cn(skinSlot("menubar", "group", {}), className)}
      {...props}
    />
  );
}

export function MenubarItem({ className, ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-control-ui="menubar"
      data-slot="item"
      className={cn(itemClasses, skinSlot("menubar", "item", { disabled: Boolean(props.disabled) }), className)}
      {...props}
    />
  );
}

export function MenubarLabel({ className, inset = false, ...props }: MenubarLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-control-ui="menubar"
      data-slot="label"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-1 text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground",
        inset && "pl-8",
        skinSlot("menubar", "label", {}),
        className,
      )}
      {...props}
    />
  );
}

export function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return (
    // -mx bleeds the rule through the popup padding so it spans edge-to-edge; rows keep their inset.
    <MenuPrimitive.Separator
      data-control-ui="menubar"
      data-slot="separator"
      className={cn("-mx-[var(--popover-padding)] my-1 h-px bg-border", skinSlot("menubar", "separator", {}), className)}
      {...props}
    />
  );
}

export function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      data-control-ui="menubar"
      data-slot="shortcut"
      className={cn("ml-auto pl-6 text-body tracking-[0.02em] text-muted-foreground", skinSlot("menubar", "shortcut", {}), className)}
      {...props}
    />
  );
}

export function MenubarSub(props: MenubarSubProps) {
  return <MenuPrimitive.SubmenuRoot {...props} />;
}

export function MenubarSubTrigger({ className, inset = false, children, ...props }: MenubarSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-control-ui="menubar"
      data-slot="sub-trigger"
      className={cn(
        itemClasses,
        "data-[popup-open]:bg-foreground/6",
        inset && "pl-8",
        skinSlot("menubar", "sub-trigger", { disabled: Boolean(props.disabled) }),
        className,
      )}
      {...props}
    >
      {children}
      {/* › submenu chevron — follows the row's currentColor */}
      <span aria-hidden="true" className="ml-auto pl-4 text-body leading-none">
        ›
      </span>
    </MenuPrimitive.SubmenuTrigger>
  );
}

export function MenubarSubContent({ className, children, ...props }: MenubarSubContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="right"
        align="start"
        sideOffset={-4}
        alignOffset={-5}
        className="z-[80] outline-none"
      >
        <MenuPrimitive.Popup
          data-control-ui="menubar"
          data-slot="sub-content"
          data-surface="floating"
          className={cn(popupClasses, skinSlot("menubar", "sub-content", {}), className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
