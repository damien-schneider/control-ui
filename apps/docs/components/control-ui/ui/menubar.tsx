"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

export type MenubarProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  modal?: boolean;
  loopFocus?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

export type MenubarMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type MenubarTriggerProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & ButtonKnobStyle };

export type MenubarContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type MenubarGroupProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type MenubarItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type MenubarSeparatorProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type MenubarLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  inset?: boolean;
};

export type MenubarShortcutProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type MenubarSubProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type MenubarSubTriggerProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  disabled?: boolean;
  inset?: boolean;
};

export type MenubarSubContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

// row of independent Menu.Root menus — each trigger drops its own full menu.

const popupClasses = "min-w-[11rem]";

const itemClasses = cn("group/mbi relative", popupItemStructureClasses);

export function Menubar({ className, ...props }: MenubarProps) {
  return (
    <MenubarPrimitive
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="root"
      data-control-family="popup"
      data-popup-part="bar"
      className={cn("inline-flex items-center", className)}
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
      data-control-family="button"
      data-slot="trigger"
      data-control="true"
      data-cursor="default"
      data-size="sm"
      data-variant="ghost"
      data-tone="neutral"
      data-shape="default"
      className={cn("inline-flex select-none items-center", className)}
      {...props}
    />
  );
}

export function MenubarContent({ className, children, ...props }: MenubarContentProps) {
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
          data-control-ui="menubar"
          data-popup-kind="menubar"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn(popupClasses, className)}
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
      data-control-family="popup"
      data-popup-kind="menubar"
      data-slot="group"
      className={className}
      {...props}
    />
  );
}

export function MenubarItem({ className, ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...props}
    />
  );
}

export function MenubarLabel({ className, inset = false, ...props }: MenubarLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="label"
      data-control-family="popup"
      data-popup-part="label"
      data-inset={inset || undefined}
      className={cn(className)}
      {...props}
    />
  );
}

export function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return (
    // bleeds rule through popup padding so it spans edge to edge while rows keep their inset
    <MenuPrimitive.Separator
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="separator"
      data-control-family="popup"
      data-popup-part="separator"
      className={cn(className)}
      {...props}
    />
  );
}

export function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="shortcut"
      data-control-family="popup"
      data-popup-part="shortcut"
      className={cn(className)}
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
      data-popup-kind="menubar"
      data-slot="sub-trigger"
      data-control-family="popup"
      data-popup-part="item"
      data-inset={inset || undefined}
      className={cn(itemClasses, className)}
      {...props}
    >
      {children}
      <span
        data-control-ui="menubar"
        data-popup-kind="menubar"
        data-control-family="popup"
        data-slot="sub-trigger-indicator"
        aria-hidden="true"
      >
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
        className="z-[80]"
      >
        <MenuPrimitive.Popup
          data-control-ui="menubar"
          data-popup-kind="menubar"
          data-slot="sub-content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
