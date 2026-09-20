"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { ControlledChoice } from "@/components/control-ui/control-props";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";

export type SelectProps<TValue extends string = string> = Omit<ControlledChoice<TValue>, "value"> & {
  value?: TValue | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  items?: Record<string, ReactNode> | readonly { value: TValue; label: ReactNode }[];
  name?: string;
  children?: ReactNode;
};

export const selectTriggerVariants = ["surface", "ghost"] as const;

export type SelectTriggerVariant = (typeof selectTriggerVariants)[number];

export type SelectTriggerProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & ButtonKnobStyle } & {
  size?: ControlSize;
  variant?: SelectTriggerVariant;
};

export type SelectValueProps = {
  placeholder?: ReactNode;
  children?: ReactNode | ((value: string) => ReactNode);
};

export type SelectContentProps = Omit<ComponentProps<"div">, "style"> &
  Pick<ComponentProps<typeof SelectPrimitive.Positioner>, "alignItemWithTrigger"> & { style?: CSSProperties & PopupKnobStyle };

export type SelectItemProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle } & {
  value: string;
  label?: string;
  disabled?: boolean;
};

type RefinedSelectTriggerProps = SelectTriggerProps &
  Pick<ComponentProps<typeof SelectPrimitive.Trigger>, "nativeButton" | "render"> & { style?: CSSProperties & PopupKnobStyle };

export function Select<TValue extends string = string>({ children, onValueChange, ...props }: SelectProps<TValue>) {
  return (
    <SelectPrimitive.Root<TValue>
      {...props}
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value);
      }}
    >
      {children}
    </SelectPrimitive.Root>
  );
}

export function SelectTrigger({ size = "sm", variant = "surface", className, children, disabled, ...props }: RefinedSelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-control-ui="select"
      data-control-family="button"
      data-popup-kind="select"
      data-slot="trigger"
      data-control="true"
      data-size={size}
      data-variant={variant}
      data-tone="neutral"
      data-shape="default"
      className={cn("group relative isolate inline-flex shrink-0 items-center justify-between overflow-visible", className)}
      disabled={disabled}
      {...props}
    >
      <span
        data-control-ui="button"
        data-control-family="button"
        data-slot="content"
        className="relative z-[1] inline-flex min-w-0 items-center justify-center gap-[inherit]"
      >
        {children}
      </span>
      <SelectPrimitive.Icon
        data-control-ui="select"
        data-control-family="popup"
        data-popup-kind="select"
        data-slot="icon"
        className="relative z-[1]"
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({ children, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value className="min-w-0 truncate" {...props}>
      {children}
    </SelectPrimitive.Value>
  );
}

export function SelectContent({ className, children, alignItemWithTrigger = false, ...props }: SelectContentProps) {
  const skin = useSkin();
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        side="bottom"
        align="start"
        sideOffset={6}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-(--z-popup)"
      >
        <SelectPrimitive.Popup
          data-control-ui="select"
          data-popup-kind="select"
          data-slot="content"
          data-surface="floating"
          data-control-family="popup"
          data-popup-part="list-surface"
          className={cn("max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto", className)}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, disabled, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-control-ui="select"
      data-popup-kind="select"
      data-slot="item"
      data-control-family="popup"
      data-popup-part="item"
      disabled={disabled}
      className={cn(popupItemStructureClasses, className)}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center">{children}</SelectPrimitive.ItemText>
      <span
        data-control-ui="select"
        data-control-family="popup"
        data-popup-kind="select"
        data-slot="item-indicator"
        className="flex size-3.5 shrink-0 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
