"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import type { ControlledChoice, OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

export type ContextMenuProps = {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
};

export type ContextMenuTriggerProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuGroupProps = ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  disabled?: boolean;
  inset?: boolean;
  onClick?: (event: MouseEvent) => void;
};

export type ContextMenuCheckboxItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
} & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export type ContextMenuRadioGroupProps<TValue extends string = string> = ComponentProps<"div"> &
  Omit<ControlledChoice<TValue>, "defaultValue"> & { style?: CSSProperties & PopupKnobStyle };

export type ContextMenuRadioItemProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & {
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

export type ContextMenuSubTriggerProps = Omit<Omit<ComponentProps<"div">, "onClick">, "style"> & {
  style?: CSSProperties & PopupKnobStyle;
} & {
  disabled?: boolean;
  inset?: boolean;
};

export type ContextMenuSubContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

// Composes like DropdownMenu behind right-click trigger; API stays shadcn/ui context-menu compatible.

const popupClasses = "min-w-[10rem]";

// group/cmi lets gutter glyphs and shortcuts key off highlighted row if pack wants them to.
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

export function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      {/* portal escapes every token-scoped ancestor, so scope is re-asserted here */}
      <ContextMenuPrimitive.Positioner data-skin={skinId()} data-effects={skinEffects()} className="z-[80]">
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

export function ContextMenuItem({ className, inset = false, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      data-inset={inset || undefined}
      className={cn(itemClasses, className)}
      {...props}
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
      {...props}
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

export function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-control-ui="context-menu"
      data-popup-kind="context-menu"
      data-slot="radio-item"
      data-control-family="popup"
      data-popup-part="item"
      className={cn(itemClasses, className)}
      {...props}
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
        aria-hidden="true"
      >
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
        className="z-[80]"
        sideOffset={-4}
        alignOffset={-5}
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
