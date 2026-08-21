"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import { controlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type InputProps = Omit<Omit<ComponentProps<"input">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

export function Input({ size = "md", className, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-control-ui="input"
      data-slot="root"
      data-control-family="field"
      data-control="true"
      data-size={size}
      className={cn("w-full min-w-0", controlSize({ size }), className)}
      {...props}
    />
  );
}
