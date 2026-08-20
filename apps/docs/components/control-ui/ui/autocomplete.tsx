"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import type {
  AutocompleteClearProps,
  AutocompleteContentProps,
  AutocompleteEmptyProps,
  AutocompleteGroupLabelProps,
  AutocompleteGroupProps,
  AutocompleteInputProps,
  AutocompleteItemProps,
  AutocompleteListProps,
  AutocompleteProps,
} from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { popupItemStructureClasses } from "@/components/control-ui/surface-variants";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

// Free text, unlike Combobox — value is filter string, and picking item only fills field.

export function Autocomplete<Value = string>({ children, ...props }: AutocompleteProps<Value>) {
  return <AutocompletePrimitive.Root {...props}>{children}</AutocompletePrimitive.Root>;
}

export function AutocompleteClear({ className, children, ...props }: AutocompleteClearProps) {
  return (
    <AutocompletePrimitive.Clear
      data-control-ui="autocomplete"
      data-control-family="field"
      data-field-kind="autocomplete"
      data-slot="clear"
      aria-label="Clear search"
      className={cn("inline-flex size-6 shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed", className)}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 3 9 9M9 3 3 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </AutocompletePrimitive.Clear>
  );
}

export function AutocompleteInput({ size = "md", className, ...props }: AutocompleteInputProps) {
  return (
    <AutocompletePrimitive.InputGroup
      data-control-ui="autocomplete"
      data-control-family="field"
      data-field-kind="autocomplete"
      data-slot="root"
      className="relative flex w-full items-center"
    >
      <AutocompletePrimitive.Input
        data-control-ui="autocomplete"
        data-field-kind="autocomplete"
        data-slot="input"
        data-control="true"
        data-control-family="field"
        data-size={size}
        className={cn("w-full min-w-0 pr-9 disabled:cursor-not-allowed", controlSize({ size }), className)}
        {...props}
      />
      <AutocompleteClear className="absolute right-1.5 top-1/2 -translate-y-1/2" />
    </AutocompletePrimitive.InputGroup>
  );
}

export function AutocompleteContent({ className, children, sideOffset = 6, ...props }: AutocompleteContentProps) {
  return (
    <AutocompletePrimitive.Portal>
      {/* portal lands outside container-scoped skin root, so scope is re-asserted here */}
      <AutocompletePrimitive.Positioner
        data-control-ui="autocomplete"
        data-popup-kind="autocomplete"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={sideOffset}
        className="z-[80]"
      >
        <AutocompletePrimitive.Popup
          data-control-ui="autocomplete"
          data-popup-kind="autocomplete"
          data-control-family="popup"
          data-slot="content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn("w-[var(--anchor-width)] max-w-[var(--available-width)]", className)}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

export function AutocompleteList<Value = unknown>({ className, children, ...props }: AutocompleteListProps<Value>) {
  return (
    <ScrollArea className="w-full" maxHeight="min(18rem, var(--available-height))">
      <AutocompletePrimitive.List
        data-control-ui="autocomplete"
        data-popup-kind="autocomplete"
        data-slot="list"
        data-control-family="popup"
        data-popup-part="list-content"
        className={className}
        {...props}
      >
        {children}
      </AutocompletePrimitive.List>
    </ScrollArea>
  );
}

export function AutocompleteEmpty({ className, children, ...props }: AutocompleteEmptyProps) {
  return (
    <AutocompletePrimitive.Empty
      data-control-ui="autocomplete"
      data-control-family="field"
      data-field-kind="autocomplete"
      data-slot="empty"
      className={cn("px-[calc(var(--padding-x)*0.5)] py-6 empty:h-0 empty:overflow-hidden empty:p-0", className)}
      {...props}
    >
      {children}
    </AutocompletePrimitive.Empty>
  );
}

export function AutocompleteItem<Value = unknown>({ className, children, disabled, ...props }: AutocompleteItemProps<Value>) {
  return (
    <AutocompletePrimitive.Item
      data-control-ui="autocomplete"
      data-popup-kind="autocomplete"
      data-control-family="popup"
      data-slot="item"
      data-popup-part="item"
      disabled={disabled}
      className={cn(popupItemStructureClasses, className)}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
    </AutocompletePrimitive.Item>
  );
}

export function AutocompleteGroup({ className, children, ...props }: AutocompleteGroupProps) {
  return (
    <AutocompletePrimitive.Group
      data-control-ui="autocomplete"
      data-control-family="field"
      data-field-kind="autocomplete"
      data-slot="group"
      className={cn("py-1", className)}
      {...props}
    >
      {children}
    </AutocompletePrimitive.Group>
  );
}

export function AutocompleteGroupLabel({ className, children, ...props }: AutocompleteGroupLabelProps) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-control-ui="autocomplete"
      data-popup-kind="autocomplete"
      data-slot="group-label"
      data-control-family="popup"
      data-popup-part="label"
      className={cn("px-[calc(var(--padding-x)*0.5)] py-1", className)}
      {...props}
    >
      {children}
    </AutocompletePrimitive.GroupLabel>
  );
}
