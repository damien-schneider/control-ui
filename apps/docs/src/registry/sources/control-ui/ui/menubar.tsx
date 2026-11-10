"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { popupItemFocusProps } from "@/components/control-ui/lib/popup-item-focus";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { type PopupItemTone, popupItemStructureClasses } from "@/components/control-ui/surface-variants";

type MenubarStyledProps<PrimitiveProps> = Omit<PrimitiveProps, "className" | "style"> & {
  className?: string;
  style?: CSSProperties & PopupKnobStyle;
};

type MenubarPositionerProps = Pick<
  MenuPrimitive.Positioner.Props,
  "side" | "sideOffset" | "align" | "alignOffset" | "collisionBoundary" | "collisionPadding" | "collisionAvoidance"
>;

type MenubarItemPrimitiveProps = Pick<MenuPrimitive.Item.Props, "closeOnClick" | "label" | "nativeButton" | "render">;

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

export type MenubarTriggerProps = Omit<ComponentProps<"button">, "style"> &
  Pick<MenuPrimitive.Trigger.Props<unknown>, "nativeButton" | "render"> & { style?: CSSProperties & ButtonKnobStyle };

export type MenubarContentProps = Omit<ComponentProps<"div">, "style"> &
  MenubarPositionerProps & { style?: CSSProperties & PopupKnobStyle };

export type MenubarGroupProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type MenubarItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  MenubarItemPrimitiveProps & { style?: CSSProperties & PopupKnobStyle } & {
    disabled?: boolean;
    inset?: boolean;
    tone?: PopupItemTone;
    onClick?: (event: MouseEvent) => void;
  };

export type MenubarCheckboxItemProps = MenubarStyledProps<MenuPrimitive.CheckboxItem.Props>;
export type MenubarRadioGroupProps = MenubarStyledProps<MenuPrimitive.RadioGroup.Props>;
export type MenubarRadioItemProps = MenubarStyledProps<MenuPrimitive.RadioItem.Props>;

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

export type MenubarSubTriggerProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  Pick<MenuPrimitive.SubmenuTrigger.Props, "label" | "nativeButton" | "render" | "openOnHover" | "delay" | "closeDelay"> & {
    style?: CSSProperties & PopupKnobStyle;
  } & {
    disabled?: boolean;
    inset?: boolean;
  };

export type MenubarSubContentProps = MenubarContentProps;

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

export function MenubarContent({
  className,
  children,
  side,
  sideOffset = 6,
  align = "start",
  alignOffset,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  ...props
}: MenubarContentProps) {
  const skin = useSkin();
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        {...skinScopeAttributes(skin)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        className="z-(--z-popup)"
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

export function MenubarItem({ tone = "neutral", inset, className, ...props }: MenubarItemProps) {
  return (
    <MenuPrimitive.Item
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      data-tone={tone}
      data-inset={inset ? "true" : undefined}
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    />
  );
}

export function MenubarCheckboxItem({ className, children, ...props }: MenubarCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="checkbox-item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    >
      <MenuPrimitive.CheckboxItemIndicator className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <MenubarCheck />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

export function MenubarRadioGroup(props: MenubarRadioGroupProps) {
  return (
    <MenuPrimitive.RadioGroup
      data-control-ui="menubar"
      data-control-family="popup"
      data-popup-kind="menubar"
      data-slot="radio-group"
      {...props}
    />
  );
}

export function MenubarRadioItem({ className, children, value, ...props }: MenubarRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      value={value}
      data-control-ui="menubar"
      data-popup-kind="menubar"
      data-slot="radio-item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    >
      <MenuPrimitive.RadioItemIndicator className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <MenubarCheck />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function MenubarCheck() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
      <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
      aria-hidden="true"
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
        data-icon-dir="inline"
        aria-hidden="true"
      >
        ›
      </span>
    </MenuPrimitive.SubmenuTrigger>
  );
}

export function MenubarSubContent({
  className,
  children,
  side,
  sideOffset = -4,
  align = "start",
  alignOffset = -5,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  ...props
}: MenubarSubContentProps) {
  const skin = useSkin();
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        {...skinScopeAttributes(skin)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        className="z-(--z-popup)"
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
