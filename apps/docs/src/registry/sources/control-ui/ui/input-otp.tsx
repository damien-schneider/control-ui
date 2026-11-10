"use client";

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, Fragment, useContext, useId } from "react";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InputOTPProps = {
  length?: number;
  separator?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValueComplete?: (value: string) => void;
  validationType?: OTPFieldPrimitive.Root.Props["validationType"];
  autoSubmit?: boolean;
  form?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  mask?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  slotLabel?: InputOTPSlotLabel;
} & { style?: CSSProperties & FieldKnobStyle };

export type InputOTPSlotLabel = (index: number, length: number | undefined) => string;

export type InputOTPSlotProps = {
  index: number;
  length?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  style?: CSSProperties & FieldKnobStyle;
};

export type InputOTPSeparatorProps = ComponentProps<"div"> & { style?: CSSProperties & FieldKnobStyle };

type InputOTPContextValue = { labelledBy?: string; slotLabel: InputOTPSlotLabel };

function defaultSlotLabel(index: number, length: number | undefined) {
  return length ? `Character ${index + 1} of ${length}` : `Character ${index + 1}`;
}

const InputOTPContext = createContext<InputOTPContextValue>({ slotLabel: defaultSlotLabel });

// First slot takes the group's name, so a wrapping Field label or the group label is announced on entry.
export function InputOTPSlot({ index, length, className, ...props }: InputOTPSlotProps) {
  const { labelledBy, slotLabel } = useContext(InputOTPContext);
  return (
    <OTPFieldPrimitive.Input
      data-control-ui="input-otp"
      data-field-kind="input-otp"
      data-slot="slot"
      data-control-family="field"
      data-control="true"
      aria-label={index === 0 ? undefined : slotLabel(index, length)}
      aria-labelledby={index === 0 ? labelledBy : undefined}
      className={cn("relative flex items-center justify-center", className)}
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

export function InputOTP({
  length = 6,
  separator = false,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  slotLabel = defaultSlotLabel,
  ...props
}: InputOTPProps) {
  const labelId = useId();
  const ownLabel = ariaLabel && !ariaLabelledBy ? ariaLabel : undefined;
  const labelledBy = ariaLabelledBy ?? (ownLabel ? labelId : undefined);
  return (
    <InputOTPContext.Provider value={{ labelledBy, slotLabel }}>
      {ownLabel ? (
        <span id={labelId} hidden>
          {ownLabel}
        </span>
      ) : null}
      <OTPFieldPrimitive.Root
        data-control-ui="input-otp"
        data-control-family="field"
        data-field-kind="input-otp"
        data-slot="root"
        length={length}
        aria-labelledby={labelledBy}
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
    </InputOTPContext.Provider>
  );
}
