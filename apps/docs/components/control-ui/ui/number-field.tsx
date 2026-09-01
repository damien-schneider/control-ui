"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { createContext, useContext } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type NumberFieldChangeReason =
  | "input-change"
  | "input-clear"
  | "input-blur"
  | "input-paste"
  | "keyboard"
  | "increment-press"
  | "decrement-press"
  | "wheel"
  | "scrub"
  | "none";

export type NumberFieldChangeEventDetails = {
  reason: NumberFieldChangeReason;
  event: Event;
  cancel?: () => void;
  allowPropagation?: () => void;
  isCanceled?: boolean;
  isPropagationAllowed?: boolean;
  trigger?: Element | undefined;
};

export type NumberFieldProps = {
  size?: ControlSize;
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null, eventDetails: NumberFieldChangeEventDetails) => void;
  onValueCommitted?: (value: number | null, eventDetails: NumberFieldChangeEventDetails) => void;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  snapOnStep?: boolean;
  allowOutOfRange?: boolean;
  allowWheelScrub?: boolean;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  style?: CSSProperties & FieldKnobStyle;
  children?: ReactNode;
};

export type NumberFieldGroupProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type NumberFieldInputProps = Omit<ComponentProps<"input">, "style"> & { style?: CSSProperties & FieldKnobStyle };

export type NumberFieldIncrementProps = ComponentProps<"button"> & { nativeButton?: boolean } & { style?: CSSProperties & FieldKnobStyle };

export type NumberFieldDecrementProps = ComponentProps<"button"> & { nativeButton?: boolean } & { style?: CSSProperties & FieldKnobStyle };

export type NumberFieldScrubAreaProps = ComponentProps<"span"> & {
  direction?: "horizontal" | "vertical";
  pixelSensitivity?: number;
  teleportDistance?: number;
} & { style?: CSSProperties & FieldKnobStyle };

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
      className={cn("inline-flex items-stretch overflow-hidden", className)}
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
      className={cn("h-full min-w-0 flex-1 disabled:cursor-not-allowed", className)}
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
