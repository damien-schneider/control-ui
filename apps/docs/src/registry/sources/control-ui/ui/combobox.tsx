"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { createContext, use, useEffect, useRef } from "react";
import type {
  ComboboxContentProps,
  ComboboxEmptyProps,
  ComboboxGroupLabelProps,
  ComboboxGroupProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxListProps,
  ComboboxProps,
  ComboboxTriggerProps,
} from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";
import { emitComboboxValueChange } from "./combobox-disabled-selection";

type DisabledComboboxValueRegistry = {
  register: (value: unknown, disabled: boolean) => () => void;
};

const ComboboxDisabledValueContext = createContext<DisabledComboboxValueRegistry | null>(null);

// Searchable single-select. Input shares --radius-control/controlSize with Button/Select; floating list rides shared popover tokens, rows match menu/select down to ItemIndicator.

export function Combobox<Value = string>({ children, onValueChange, ...props }: ComboboxProps<Value>) {
  const disabledValuesRef = useRef<Set<unknown> | null>(null);

  if (disabledValuesRef.current === null) {
    disabledValuesRef.current = new Set<unknown>();
  }

  const disabledValues = disabledValuesRef.current;
  const disabledValueRegistry: DisabledComboboxValueRegistry = {
    register(value, disabled) {
      if (!disabled || value === undefined) return () => {};
      disabledValues.add(value);
      return () => disabledValues.delete(value);
    },
  };

  return (
    <ComboboxDisabledValueContext.Provider value={disabledValueRegistry}>
      <ComboboxPrimitive.Root
        {...props}
        onValueChange={
          onValueChange
            ? (value: Value | Value[] | null) => {
                if (!Array.isArray(value)) emitComboboxValueChange(value, disabledValues, onValueChange);
              }
            : undefined
        }
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
      data-slot="trigger"
      aria-label="Toggle suggestions"
      className={cn(
        "group inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-control)] text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
        skinSlot("combobox", "trigger", {}),
        className,
      )}
      {...props}
    >
      {children ?? (
        <ComboboxPrimitive.Icon
          data-control-ui="combobox"
          data-slot="icon"
          className={cn(
            "transition-transform duration-[var(--duration-base)] ease-[var(--ease-emphasized)] group-data-[popup-open]:rotate-180",
            skinSlot("combobox", "icon", {}),
          )}
        >
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
      data-slot="root"
      className={cn("relative flex w-full items-center", skinSlot("combobox", "root", {}))}
    >
      <ComboboxPrimitive.Input
        data-control-ui="combobox"
        data-slot="input"
        data-control="true"
        data-size={size}
        className={cn(
          "w-full min-w-0 rounded-[var(--radius-control)] pr-9 font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
          controlSurfaceClasses,
          controlSize({ size }),
          skinSlot("combobox", "input", { size }),
          className,
        )}
        {...props}
      />
      <ComboboxTrigger className="absolute right-1.5 top-1/2 -translate-y-1/2" />
    </ComboboxPrimitive.InputGroup>
  );
}

export function ComboboxContent({ className, children, sideOffset = 6, ...props }: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal>
      {/* Portals land outside container-scoped skin root; positioner re-asserts token scope on itself. */}
      <ComboboxPrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={sideOffset}
        className="z-[80] outline-none"
      >
        <ComboboxPrimitive.Popup
          data-control-ui="combobox"
          data-slot="content"
          data-surface="floating"
          className={cn(
            "w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)]",
            floatingListContentClasses,
            skinSlot("combobox", "content", {}),
            className,
          )}
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
    <ComboboxPrimitive.List
      data-control-ui="combobox"
      data-slot="list"
      className={cn(
        "max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain outline-none",
        skinSlot("combobox", "list", {}),
        className,
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.List>
  );
}

export function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      data-control-ui="combobox"
      data-slot="empty"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-6 text-center text-body text-muted-foreground empty:h-0 empty:overflow-hidden empty:p-0",
        skinSlot("combobox", "empty", {}),
        className,
      )}
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
      data-slot="item"
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      value={value}
      className={cn(floatingListItemClasses, skinSlot("combobox", "item", { disabled: Boolean(disabled) }), className)}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      <span className="flex size-3.5 shrink-0 items-center justify-center text-foreground">
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
      data-slot="group"
      className={cn("py-1", skinSlot("combobox", "group", {}), className)}
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
      data-slot="group-label"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-1 text-meta font-medium text-muted-foreground",
        skinSlot("combobox", "group-label", {}),
        className,
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.GroupLabel>
  );
}
