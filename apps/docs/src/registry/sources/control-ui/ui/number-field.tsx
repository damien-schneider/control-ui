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
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";

// Group carries surface and Input stays transparent, so stepper and field fuse into one joined segment.
// `size` lives on Root and reaches Group through context, so one prop resizes whole unit.
const NumberFieldSizeContext = createContext<ControlSize>("md");

export function NumberField({ size = "md", value, defaultValue, children, ...props }: NumberFieldProps) {
  return (
    <NumberFieldSizeContext.Provider value={size}>
      {/* explicit, never spread — Base UI decides controlled-ness from value !== undefined on first render */}
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
      data-field-kind="number-field"
      data-slot="group"
      data-control="true"
      data-control-family="field"
      data-size={size}
      className={cn("inline-flex items-stretch overflow-hidden", controlSize({ size }), "gap-0 px-0", className)}
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
      data-control-family="field"
      data-field-kind="number-field"
      data-slot="input"
      className={cn("h-full min-w-0 flex-1 px-2 disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

export function NumberFieldDecrement({ className, children, ...props }: NumberFieldDecrementProps) {
  return (
    <NumberFieldPrimitive.Decrement
      data-control-ui="number-field"
      data-control-family="field"
      data-field-kind="number-field"
      data-slot="decrement"
      aria-label="Decrease"
      className={cn("flex aspect-square h-full shrink-0 cursor-pointer select-none items-center justify-center", className)}
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
      data-control-family="field"
      data-field-kind="number-field"
      data-slot="increment"
      aria-label="Increase"
      className={cn("flex aspect-square h-full shrink-0 cursor-pointer select-none items-center justify-center", className)}
      {...props}
    >
      {children ?? <PlusIcon />}
    </NumberFieldPrimitive.Increment>
  );
}

// optional drag-to-change affordance, usually wrapped around field's label
export function NumberFieldScrubArea({ className, children, ...props }: NumberFieldScrubAreaProps) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-control-ui="number-field"
      data-control-family="field"
      data-field-kind="number-field"
      data-slot="scrub-area"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    >
      {children}
      <NumberFieldPrimitive.ScrubAreaCursor
        data-control-ui="number-field"
        data-control-family="field"
        data-field-kind="number-field"
        data-slot="scrub-cursor"
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
    <svg
      data-control-ui="number-field"
      data-field-kind="number-field"
      data-control-family="field"
      data-slot="drag-icon"
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="currentColor"
      className="block"
      aria-hidden="true"
    >
      <path d="M19.5 5.5 6.5 5.52V2L1 7l5.5 5V8.5h13V12L25 7l-5.5-5v3.5Z" />
    </svg>
  );
}
