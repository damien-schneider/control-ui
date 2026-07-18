"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { createContext, useContext } from "react";
import type {
  ControlSize,
  NumberFieldDecrementProps,
  NumberFieldGroupProps,
  NumberFieldIncrementProps,
  NumberFieldInputProps,
  NumberFieldProps,
  NumberFieldScrubAreaProps,
} from "@/components/control-ui/contracts";
import { controlSize, controlSurfaceClasses } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI NumberField: Group wears controlSurfaceClasses+--radius-control+controlSize (matches Input/Select/Button).
// Decrement+transparent Input (no own border, Group carries surface)+Increment fuse into one joined segment; focus-within lifts ring, data-[invalid] turns destructive.
// `size` lives on Root, shared to Group via context — one prop resizes whole unit.
const NumberFieldSizeContext = createContext<ControlSize>("md");

export function NumberField({ size = "md", value, defaultValue, children, ...props }: NumberFieldProps) {
  return (
    <NumberFieldSizeContext.Provider value={size}>
      {/* value/defaultValue explicit, not spread — Base UI decides controlled-ness from value!==undefined on first render. */}
      <NumberFieldPrimitive.Root value={value} defaultValue={defaultValue} {...props}>
        {children}
      </NumberFieldPrimitive.Root>
    </NumberFieldSizeContext.Provider>
  );
}

export function NumberFieldGroup({ className, children, ...props }: NumberFieldGroupProps) {
  const size = useContext(NumberFieldSizeContext);
  return (
    <NumberFieldPrimitive.Group
      data-control-ui="number-field"
      data-slot="group"
      data-control="true"
      data-size={size}
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-[var(--radius-control)] font-medium outline-none transition duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-within:ring-2 focus-within:ring-foreground/20 data-[invalid]:ring-2 data-[invalid]:ring-destructive data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        controlSurfaceClasses,
        controlSize({ size }),
        // Ramp bundles padding+gap for single-element control; Group is flush joined segment — keep height/text, zero padding/gap.
        "gap-0 px-0",
        skinSlot("number-field", "group", { size }),
        className,
      )}
      {...props}
    >
      {children}
    </NumberFieldPrimitive.Group>
  );
}

export function NumberFieldInput({ className, ...props }: NumberFieldInputProps) {
  return (
    <NumberFieldPrimitive.Input
      data-control-ui="number-field"
      data-slot="input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-2 text-center font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        skinSlot("number-field", "input", {}),
        className,
      )}
      {...props}
    />
  );
}

export function NumberFieldDecrement({ className, children, ...props }: NumberFieldDecrementProps) {
  return (
    <NumberFieldPrimitive.Decrement
      data-control-ui="number-field"
      data-slot="decrement"
      aria-label="Decrease"
      className={cn(
        "flex aspect-square h-full shrink-0 cursor-pointer select-none items-center justify-center border-r border-border text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-foreground active:bg-foreground/6 data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50",
        skinSlot("number-field", "decrement", {}),
        className,
      )}
      {...props}
    >
      {children ?? <MinusIcon />}
    </NumberFieldPrimitive.Decrement>
  );
}

export function NumberFieldIncrement({ className, children, ...props }: NumberFieldIncrementProps) {
  return (
    <NumberFieldPrimitive.Increment
      data-control-ui="number-field"
      data-slot="increment"
      aria-label="Increase"
      className={cn(
        "flex aspect-square h-full shrink-0 cursor-pointer select-none items-center justify-center border-l border-border text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:text-foreground active:bg-foreground/6 data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50",
        skinSlot("number-field", "increment", {}),
        className,
      )}
      {...props}
    >
      {children ?? <PlusIcon />}
    </NumberFieldPrimitive.Increment>
  );
}

// Optional scrub affordance: drag horizontally (e.g. over field's <label>) to change value; custom grow-cursor while dragging.
export function NumberFieldScrubArea({ className, children, ...props }: NumberFieldScrubAreaProps) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-control-ui="number-field"
      data-slot="scrub-area"
      className={cn("cursor-ew-resize select-none", skinSlot("number-field", "scrub-area", {}), className)}
      {...props}
    >
      {children}
      <NumberFieldPrimitive.ScrubAreaCursor
        data-control-ui="number-field"
        data-slot="scrub-cursor"
        className={cn("drop-shadow-sm", skinSlot("number-field", "scrub-cursor", {}))}
      >
        <CursorGrowIcon />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  );
}

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 8h10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function CursorGrowIcon() {
  return (
    <svg width="26" height="14" viewBox="0 0 24 14" fill="currentColor" className="block text-foreground" aria-hidden="true">
      <path d="M19.5 5.5 6.5 5.52V2L1 7l5.5 5V8.5h13V12L25 7l-5.5-5v3.5Z" />
    </svg>
  );
}
