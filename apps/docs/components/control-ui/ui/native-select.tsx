"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type NativeSelectProps = Omit<Omit<ComponentProps<"select">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

export function NativeSelect({
  ref,
  id,
  name,
  value,
  defaultValue,
  disabled,
  autoFocus,
  size = "md",
  className,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div data-control-family="field" data-field-kind="native-select" className="relative inline-flex w-full items-center">
      <InputPrimitive
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        autoFocus={autoFocus}
        render={
          <select
            {...props}
            data-control-ui="native-select"
            data-field-kind="native-select"
            data-slot="root"
            data-size={size}
            data-control-family="field"
            data-control="true"
            className={cn("w-full min-w-0 cursor-pointer", className)}
          >
            {children}
          </select>
        }
      />
      <span
        aria-hidden="true"
        data-control-ui="native-select"
        data-control-family="field"
        data-field-kind="native-select"
        data-slot="icon"
        className="pointer-events-none absolute"
      >
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
