"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, use, useEffect, useState } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { shouldAcceptComboboxValueChange } from "./combobox-disabled-selection";

export type ComboboxProps<Value = string, Multiple extends boolean | undefined = false> = Pick<
  ComboboxPrimitive.Root.Props<Value, Multiple>,
  | "children"
  | "multiple"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "inputValue"
  | "defaultInputValue"
  | "onInputValueChange"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "disabled"
  | "readOnly"
  | "required"
  | "name"
  | "autoHighlight"
  | "itemToStringLabel"
  | "isItemEqualToValue"
  | "filter"
  | "limit"
  | "modal"
> & { items?: readonly Value[] };

export type ComboboxInputProps = Omit<Omit<ComponentProps<"input">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

export type ComboboxTriggerProps = ComponentProps<"button"> & { style?: CSSProperties & FieldKnobStyle };

export type ComboboxContentProps = Omit<
  ComboboxPrimitive.Popup.Props & {
    sideOffset?: number;
    anchor?: ComboboxPrimitive.Positioner.Props["anchor"];
  },
  "style"
> & { style?: CSSProperties & PopupKnobStyle };

export type ComboboxListProps<Value = unknown> = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode | ((item: Value, index: number) => ReactNode);
} & { style?: CSSProperties & PopupKnobStyle };

export type ComboboxItemProps<Value = unknown> = Omit<
  Omit<ComponentProps<"div">, "value"> & {
    value?: Value;
    disabled?: boolean;
  },
  "style"
> & { style?: CSSProperties & PopupKnobStyle };

export type ComboboxEmptyProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type ComboboxGroupProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

export type ComboboxGroupLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & PopupKnobStyle };

type DisabledComboboxValueRegistry = {
  register: (value: unknown, disabled: boolean) => () => void;
};

const ComboboxDisabledValueContext = createContext<DisabledComboboxValueRegistry | null>(null);

export function Combobox<Value = string, Multiple extends boolean | undefined = false>({
  children,
  onValueChange,
  autoHighlight = true,
  ...props
}: ComboboxProps<Value, Multiple>) {
  const [disabledValues] = useState(() => new Set<unknown>());
  const [committedValue, setCommittedValue] = useState<unknown>(() => props.value ?? props.defaultValue ?? null);
  const [disabledValueRegistry] = useState<DisabledComboboxValueRegistry>(() => ({
    register(value, disabled) {
      if (!disabled || value === undefined) return () => {};
      disabledValues.add(value);
      return () => disabledValues.delete(value);
    },
  }));

  return (
    <ComboboxDisabledValueContext.Provider value={disabledValueRegistry}>
      <ComboboxPrimitive.Root
        autoHighlight={autoHighlight}
        {...props}
        onValueChange={(value, eventDetails) => {
          const previousValue = props.value === undefined ? committedValue : props.value;
          if (!shouldAcceptComboboxValueChange(value, previousValue, disabledValues)) {
            eventDetails.cancel();
            return;
          }
          setCommittedValue(value);
          onValueChange?.(value, eventDetails);
        }}
      >
        {children}
      </ComboboxPrimitive.Root>
    </ComboboxDisabledValueContext.Provider>
  );
}

export function ComboboxTrigger({ className, children, ...props }: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      data-control-ui="combobox"
      data-control-family="field"
      data-field-kind="combobox"
      data-slot="trigger"
      aria-label="Toggle suggestions"
      className={cn("group inline-flex size-6 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed", className)}
      {...props}
    >
      {children ?? (
        <ComboboxPrimitive.Icon data-control-ui="combobox" data-control-family="field" data-field-kind="combobox" data-slot="icon">
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ComboboxPrimitive.Icon>
      )}
    </ComboboxPrimitive.Trigger>
  );
}

export function ComboboxInput({ size = "md", className, ...props }: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup
      data-control-ui="combobox"
      data-control-family="field"
      data-field-kind="combobox"
      data-slot="input-group"
      className="relative flex w-full items-center"
    >
      <ComboboxPrimitive.Input
        data-control-ui="combobox"
        data-field-kind="combobox"
        data-slot="input"
        data-control="true"
        data-control-family="field"
        data-size={size}
        className={cn("w-full min-w-0 disabled:cursor-not-allowed", className)}
        {...props}
      />
      <ComboboxTrigger className="absolute end-1.5 top-1/2 -translate-y-1/2" />
    </ComboboxPrimitive.InputGroup>
  );
}

export function ComboboxContent({ className, children, sideOffset = 6, anchor, ...props }: ComboboxContentProps) {
  const skin = useSkin();
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        data-control-ui="combobox"
        data-popup-kind="combobox"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skin.id}
        data-effects={controlEffectsAttribute(skin.effects)}
        side="bottom"
        align="start"
        sideOffset={sideOffset}
        anchor={anchor}
        className="z-(--z-popup)"
      >
        <ComboboxPrimitive.Popup
          data-control-ui="combobox"
          data-popup-kind="combobox"
          data-control-family="popup"
          data-slot="content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn("w-[var(--anchor-width)] max-w-[var(--available-width)]", className)}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxList<Value = unknown>({ className, children, ...props }: ComboboxListProps<Value>) {
  return (
    <ScrollArea className="w-full" viewportClassName="overscroll-y-contain" maxHeight="min(18rem, var(--available-height))" lockAxis="x">
      <ComboboxPrimitive.List
        data-control-ui="combobox"
        data-popup-kind="combobox"
        data-slot="list"
        data-control-family="popup"
        data-popup-part="list-content"
        className={className}
        {...props}
      >
        {children}
      </ComboboxPrimitive.List>
    </ScrollArea>
  );
}

export function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      data-control-ui="combobox"
      data-control-family="popup"
      data-popup-kind="combobox"
      data-slot="empty"
      className={cn("px-[calc(var(--padding-x)*0.5)] empty:h-0 empty:overflow-hidden empty:p-0", className)}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Empty>
  );
}

export function ComboboxItem<Value = unknown>({ className, children, disabled, value, ...props }: ComboboxItemProps<Value>) {
  const disabledValueRegistry = use(ComboboxDisabledValueContext);

  useEffect(() => disabledValueRegistry?.register(value, Boolean(disabled)), [disabled, disabledValueRegistry, value]);

  return (
    <ComboboxPrimitive.Item
      data-control-ui="combobox"
      data-popup-kind="combobox"
      data-control-family="popup"
      data-slot="item"
      data-popup-part="item"
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      value={value}
      className={cn(popupItemStructureClasses, className)}
      {...props}
    >
      <span
        data-control-ui="combobox"
        data-control-family="popup"
        data-popup-kind="combobox"
        data-slot="item-text"
        className="flex min-w-0 flex-1 items-center truncate"
      >
        {children}
      </span>
      <span
        data-control-ui="combobox"
        data-popup-kind="combobox"
        data-control-family="popup"
        data-slot="item-indicator"
        className="flex size-3.5 shrink-0 items-center justify-center"
      >
        <ComboboxPrimitive.ItemIndicator>
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
            <path d="M2.5 6.5 5 9l4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ComboboxPrimitive.ItemIndicator>
      </span>
    </ComboboxPrimitive.Item>
  );
}

export function ComboboxGroup({ className, children, ...props }: ComboboxGroupProps) {
  return (
    <ComboboxPrimitive.Group
      data-control-ui="combobox"
      data-control-family="field"
      data-field-kind="combobox"
      data-slot="group"
      className={className}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Group>
  );
}

export function ComboboxGroupLabel({ className, children, ...props }: ComboboxGroupLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-control-ui="combobox"
      data-popup-kind="combobox"
      data-slot="group-label"
      data-control-family="popup"
      data-popup-part="label"
      className={cn("px-[calc(var(--padding-x)*0.5)]", className)}
      {...props}
    >
      {children}
    </ComboboxPrimitive.GroupLabel>
  );
}
