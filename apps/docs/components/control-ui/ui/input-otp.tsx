"use client";

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import { Fragment } from "react";
import type { InputOTPProps, InputOTPSeparatorProps, InputOTPSlotProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI OtpField: each slot a control-shaped box sharing --radius-control/card+ring surface w/ Input & Select trigger.
// Code reads as a row of the same control family; focused slot lifts ring in pure CSS.
const slotClasses =
  "relative flex size-[var(--control-h-md)] items-center justify-center rounded-[var(--radius-control)] bg-card/72 text-center text-body font-medium tabular-nums text-foreground shadow-sm ring-1 ring-inset ring-border outline-none transition placeholder:text-muted-foreground focus:z-[1] focus:ring-2 focus:ring-foreground/20 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";

export function InputOTPSlot({ index, length, className, ...props }: InputOTPSlotProps) {
  return (
    <OTPFieldPrimitive.Input
      data-control-ui="input-otp"
      data-slot="slot"
      data-control="true"
      aria-label={length ? `Character ${index + 1} of ${length}` : `Character ${index + 1}`}
      className={cn(slotClasses, skinSlot("input-otp", "slot", {}), className)}
      {...props}
    />
  );
}

export function InputOTPSeparator({ className, ...props }: InputOTPSeparatorProps) {
  return (
    <OTPFieldPrimitive.Separator
      data-control-ui="input-otp"
      data-slot="separator"
      className={cn("h-px w-2.5 shrink-0 rounded-full bg-border", skinSlot("input-otp", "separator", {}), className)}
      {...props}
    />
  );
}

export function InputOTP({ length = 6, separator = false, className, children, ...props }: InputOTPProps) {
  return (
    <OTPFieldPrimitive.Root
      data-control-ui="input-otp"
      data-slot="root"
      length={length}
      className={cn("flex items-center gap-2", skinSlot("input-otp", "root", {}), className)}
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
