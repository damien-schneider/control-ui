"use client";

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import { Fragment } from "react";
import type { InputOTPProps, InputOTPSeparatorProps, InputOTPSlotProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

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
      className={cn("h-px w-2.5 shrink-0", className)}
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
      className={cn("flex items-center gap-2", className)}
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
