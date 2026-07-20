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
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinFamily, skinId, skinSlot } from "@/components/control-ui/skin";
import { floatingListContentClasses, floatingListItemClasses } from "@/components/control-ui/surface-variants";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

// Unlike Combobox, input is FREE TEXT: value/onValueChange is the filter string, picking an item just
// fills the field — never locks to a discrete value, no per-row ItemIndicator (Base UI has none).

export function Autocomplete<Value = string>({ children, ...props }: AutocompleteProps<Value>) {
  return <AutocompletePrimitive.Root {...props}>{children}</AutocompletePrimitive.Root>;
}

export function AutocompleteClear({ className, children, ...props }: AutocompleteClearProps) {
  return (
    <AutocompletePrimitive.Clear
      data-control-ui="autocomplete"
      data-slot="clear"
      aria-label="Clear search"
      className={cn(
        "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-control)] text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
        skinSlot("autocomplete", "clear", {}),
        className,
      )}
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
      data-slot="root"
      className={cn("relative flex w-full items-center", skinSlot("autocomplete", "root", {}))}
    >
      <AutocompletePrimitive.Input
        data-control-ui="autocomplete"
        data-slot="input"
        data-control="true"
        data-size={size}
        className={cn(
          "w-full min-w-0 rounded-[var(--radius-control)] pr-9 font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-45",
          controlSurfaceClasses,
          controlSize({ size }),
          skinSlot("autocomplete", "input", { size }),
          className,
        )}
        {...props}
      />
      <AutocompleteClear className="absolute right-1.5 top-1/2 -translate-y-1/2" />
    </AutocompletePrimitive.InputGroup>
  );
}

export function AutocompleteContent({ className, children, sideOffset = 6, ...props }: AutocompleteContentProps) {
  return (
    <AutocompletePrimitive.Portal>
      {/* Portals land outside container-scoped skin root; positioner re-asserts token scope on itself. */}
      <AutocompletePrimitive.Positioner
        data-skin={skinId()}
        data-effects={skinEffects()}
        side="bottom"
        align="start"
        sideOffset={sideOffset}
        className="z-[80] outline-none"
      >
        <AutocompletePrimitive.Popup
          data-control-ui="autocomplete"
          data-slot="content"
          data-surface="floating"
          data-popup-part="list-surface"
          className={cn(
            "w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)]",
            floatingListContentClasses,
            skinFamily("popup", "list-surface"),
            skinSlot("autocomplete", "content", {}),
            className,
          )}
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
        data-slot="list"
        data-popup-part="list-content"
        className={cn("outline-none", skinFamily("popup", "list-content"), skinSlot("autocomplete", "list", {}), className)}
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
      data-slot="empty"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-6 text-center text-body text-muted-foreground empty:h-0 empty:overflow-hidden empty:p-0",
        skinSlot("autocomplete", "empty", {}),
        className,
      )}
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
      data-slot="item"
      data-popup-part="item"
      disabled={disabled}
      className={cn(
        floatingListItemClasses,
        skinFamily("popup", "item"),
        skinSlot("autocomplete", "item", { disabled: Boolean(disabled) }),
        className,
      )}
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
      data-slot="group"
      className={cn("py-1", skinSlot("autocomplete", "group", {}), className)}
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
      data-slot="group-label"
      data-popup-part="label"
      className={cn(
        "px-[calc(var(--padding-x)*0.5)] py-1 text-meta font-medium text-muted-foreground",
        skinFamily("popup", "label"),
        skinSlot("autocomplete", "group-label", {}),
        className,
      )}
      {...props}
    >
      {children}
    </AutocompletePrimitive.GroupLabel>
  );
}
