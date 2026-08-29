"use client";

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Fragment } from "react";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InputOTPProps = {
  length?: number;
  separator?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  mask?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
} & { style?: CSSProperties & FieldKnobStyle };

export type InputOTPSlotProps = {
  index: number;
  length?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties & FieldKnobStyle;
};

export type InputOTPSeparatorProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

export function InputOTPSlot({ index, length, className, ...props }: InputOTPSlotProps) {
  return (
    <OTPFieldPrimitive.Input
      data-control-ui="input-otp"
      data-field-kind="input-otp"
      data-slot="slot"
      data-control-family="field"
      data-control="true"
      aria-label={length ? `Character ${index + 1} of ${length}` : `Character ${index + 1}`}
      className={cn("relative flex size-[var(--control-h-md)] items-center justify-center", className)}
      {...props}
    />
  );
}

export function InputOTPSeparator({ className, ...props }: InputOTPSeparatorProps) {
  return (
    <OTPFieldPrimitive.Separator
      data-control-ui="input-otp"
      data-control-family="field"
      data-field-kind="input-otp"
      data-slot="separator"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

export function InputOTP({ length = 6, separator = false, className, children, ...props }: InputOTPProps) {
  return (
    <OTPFieldPrimitive.Root
      data-control-ui="input-otp"
      data-control-family="field"
      data-field-kind="input-otp"
      data-slot="root"
      length={length}
      className={cn("flex items-center", className)}
      {...props}
    >
      {children ??
        Array.from({ length }, (_, index) => `input-otp-slot-${index}`).map((slotKey, index) => (
          <Fragment key={slotKey}>
            {separator && index === Math.ceil(length / 2) ? <InputOTPSeparator /> : null}
            <InputOTPSlot index={index} length={length} />
          </Fragment>
        ))}
    </OTPFieldPrimitive.Root>
  );
}
