"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import type { ControlledChoice, OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { popupItemFocusProps } from "@/components/control-ui/lib/popup-item-focus";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { type PopupItemTone, popupItemStructureClasses } from "@/components/control-ui/surface-variants";

type ContextMenuPositionerProps = Pick<
  ComponentProps<typeof ContextMenuPrimitive.Positioner>,
  "side" | "sideOffset" | "align" | "alignOffset" | "collisionBoundary" | "collisionPadding" | "collisionAvoidance"
>;

type ContextMenuItemPrimitiveProps = Pick<
  ComponentProps<typeof ContextMenuPrimitive.Item>,
  "closeOnClick" | "label" | "nativeButton" | "render"
>;

export type ContextMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type ContextMenuTriggerProps = ComponentProps<"div"> &
  Pick<ComponentProps<typeof ContextMenuPrimitive.Trigger>, "render"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuGroupProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuContentProps = Omit<ComponentProps<"div">, "style"> &
  ContextMenuPositionerProps & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  ContextMenuItemPrimitiveProps & { style?: CSSProperties & PopupKnobStyle } & {
    disabled?: boolean;
    inset?: boolean;
    tone?: PopupItemTone;
    onClick?: (event: MouseEvent) => void;
  };

export type ContextMenuCheckboxItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  ContextMenuItemPrimitiveProps & {
    style?: CSSProperties & PopupKnobStyle;
  } & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  };

export type ContextMenuRadioGroupProps<TValue extends string = string> = ComponentProps<"div"> &
  Omit<ControlledChoice<TValue>, "defaultValue"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuRadioItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  ContextMenuItemPrimitiveProps & {
    style?: CSSProperties & PopupKnobStyle;
  } & {
    value: string;
    disabled?: boolean;
  };

export type ContextMenuLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  inset?: boolean;
};

export type ContextMenuSeparatorProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuShortcutProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuSubProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type ContextMenuSubTriggerProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> &
  Pick<
    ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger>,
    "label" | "nativeButton" | "render" | "openOnHover" | "delay" | "closeDelay"
  > & {
    style?: CSSProperties & PopupKnobStyle;
  } & {
    disabled?: boolean;
    inset?: boolean;
  };

export type ContextMenuSubContentProps = ContextMenuContentProps;

const popupClasses = "min-w-[10rem]";

const itemClasses = cn("group/cmi relative", popupItemStructureClasses);

export function ContextMenu(props: ContextMenuProps) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return (
    <ContextMenuPrimitive.Trigger
      data-control-ui="context-menu"
      data-control-family="popup"
      data-popup-kind="context-menu"
      data-slot="trigger"
      tabIndex={0}
      className={className}
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
      data-control-family="popup"
      data-popup-kind="context-menu"
      data-slot="group"
      className={className}
      {...props}
    />
  );
}

export function ContextMenuContent({
  className,
  children,
  side,
  sideOffset,
  align,
  alignOffset,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  ...props
}: ContextMenuContentProps) {
  const skin = useSkin();
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
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
        <ContextMenuPrimitive.Popup
          data-control-ui="context-menu"
          data-popup-kind="context-menu"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItem({ className, inset = false, tone = "neutral", ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      data-tone={tone}
      data-inset={inset || undefined}
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    />
  );
}

export function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="checkbox-item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
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

export function ContextMenuRadioGroup<TValue extends string = string>({ className, ...props }: ContextMenuRadioGroupProps<TValue>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-control-ui="context-menu"
      data-control-family="popup"
      data-popup-kind="context-menu"
      data-slot="radio-group"
      className={className}
      {...props}
    />
  );
}

export function ContextMenuRadioItem({ className, children, value, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      value={value}
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="radio-item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...mergeProps(popupItemFocusProps, props)}
    >
      <span className="pointer-events-none absolute start-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <span
            data-control-ui="context-menu"
            data-control-family="popup"
            data-popup-kind="context-menu"
            data-slot="radio-indicator"
            className="block size-1.5"
          />
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
      data-popup-kind="context-menu"
      data-slot="label"
      data-control-family="popup"
      data-popup-part="label"
      data-inset={inset || undefined}
      className={cn(className)}
      {...props}
    />
  );
}

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="separator"
      data-control-family="popup"
      data-popup-part="separator"
      className={cn(className)}
      {...props}
    />
  );
}

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  return (
    <span
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="shortcut"
      data-control-family="popup"
      data-popup-part="shortcut"
      aria-hidden="true"
      className={cn(className)}
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
      data-popup-kind="context-menu"
      data-slot="sub-trigger"
      data-control-family="popup"
      data-popup-part="item"
      data-inset={inset || undefined}
      className={cn(itemClasses, className)}
      {...props}
    >
      {children}
      <span
        data-control-ui="context-menu"
        data-popup-kind="context-menu"
        data-control-family="popup"
        data-slot="sub-trigger-indicator"
        data-icon-dir="inline"
        aria-hidden="true"
      >
        ›
      </span>
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

export function ContextMenuSubContent({
  className,
  children,
  side,
  sideOffset = -4,
  align,
  alignOffset = -5,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  ...props
}: ContextMenuSubContentProps) {
  const skin = useSkin();
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
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
        <ContextMenuPrimitive.Popup
          data-control-ui="context-menu"
          data-popup-kind="context-menu"
          data-slot="sub-content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}
