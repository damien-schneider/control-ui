"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

type DropdownMenuStyledProps<PrimitiveProps> = Omit<PrimitiveProps, "className" | "style"> & {
  className?: string;
  style?: CSSProperties & PopupKnobStyle;
};

export type DropdownMenuProps = MenuPrimitive.Root.Props;

export const dropdownMenuTriggerVariants = ["surface", "ghost"] as const;

export type DropdownMenuTriggerVariant = (typeof dropdownMenuTriggerVariants)[number];

export type DropdownMenuTriggerProps = Omit<ComponentProps<"button">, "style"> &
  Pick<ComponentProps<typeof MenuPrimitive.Trigger>, "nativeButton" | "render"> & { style?: CSSProperties & ButtonKnobStyle } & {
    size?: ControlSize;
    iconOnly?: boolean;
    variant?: DropdownMenuTriggerVariant;
  };

export type DropdownMenuContentProps = DropdownMenuStyledProps<MenuPrimitive.Popup.Props> &
  Pick<
    MenuPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "collisionBoundary" | "collisionPadding" | "collisionAvoidance"
  >;

export type DropdownMenuItemProps = DropdownMenuStyledProps<MenuPrimitive.Item.Props>;
export type DropdownMenuGroupProps = DropdownMenuStyledProps<MenuPrimitive.Group.Props>;
export type DropdownMenuCheckboxItemProps = DropdownMenuStyledProps<MenuPrimitive.CheckboxItem.Props>;
export type DropdownMenuRadioGroupProps = DropdownMenuStyledProps<MenuPrimitive.RadioGroup.Props>;
export type DropdownMenuRadioItemProps = DropdownMenuStyledProps<MenuPrimitive.RadioItem.Props>;
export type DropdownMenuSubProps = MenuPrimitive.SubmenuRoot.Props;
export type DropdownMenuSubTriggerProps = DropdownMenuStyledProps<MenuPrimitive.SubmenuTrigger.Props>;
export type DropdownMenuSubContentProps = DropdownMenuContentProps;
export type DropdownMenuShortcutProps = DropdownMenuStyledProps<ComponentProps<"span">>;

export type DropdownMenuSeparatorProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type DropdownMenuLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

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
}: DropdownMenuTriggerProps) {
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
      className={cn("relative isolate inline-flex shrink-0 items-center justify-center overflow-visible", className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </MenuPrimitive.Trigger>
  );
}

export function DropdownMenuContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  ...props
}: DropdownMenuContentProps) {
  const skin = useSkin();
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
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
      className={cn(popupItemStructureClasses, className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator
      data-control-ui="dropdown-menu"
      data-slot="separator"
      data-control-family="popup"
      data-popup-part="separator"
      className={cn(className)}
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
      className={cn(className)}
      {...props}
    />
  );
}

export function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal {...props} />;
}

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <MenuPrimitive.Group data-control-ui="dropdown-menu" data-control-family="popup" data-slot="group" {...props} />;
}

export function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-control-ui="dropdown-menu"
      data-control-family="popup"
      data-popup-part="item"
      data-slot="checkbox-item"
      className={cn("relative", popupItemStructureClasses, className)}
      {...props}
    >
      <MenuPrimitive.CheckboxItemIndicator className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <DropdownMenuCheck />
      </MenuPrimitive.CheckboxItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <MenuPrimitive.RadioGroup data-control-ui="dropdown-menu" data-control-family="popup" data-slot="radio-group" {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-control-ui="dropdown-menu"
      data-control-family="popup"
      data-popup-part="item"
      data-slot="radio-item"
      className={cn("relative", popupItemStructureClasses, className)}
      {...props}
    >
      <MenuPrimitive.RadioItemIndicator className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <DropdownMenuCheck />
      </MenuPrimitive.RadioItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuCheck() {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
      <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <MenuPrimitive.SubmenuRoot {...props} />;
}

export function DropdownMenuSubTrigger({ className, children, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-control-ui="dropdown-menu"
      data-control-family="popup"
      data-popup-part="item"
      data-slot="sub-trigger"
      className={cn(popupItemStructureClasses, className)}
      {...props}
    >
      {children}
      <span data-control-ui="dropdown-menu" data-control-family="popup" data-slot="sub-trigger-indicator" aria-hidden="true">
        ›
      </span>
    </MenuPrimitive.SubmenuTrigger>
  );
}

export function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuContent data-control-ui="dropdown-menu" data-slot="sub-content" side="right" sideOffset={0} alignOffset={-3} {...props} />
  );
}

export function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
  return <span data-control-ui="dropdown-menu" data-control-family="popup" data-popup-part="shortcut" data-slot="shortcut" {...props} />;
}
