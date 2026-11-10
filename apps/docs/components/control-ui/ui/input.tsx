"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useInputGroupControlRef, useIsInsideInputGroup } from "@/components/control-ui/ui/input-group";

export type InputProps = Omit<Omit<ComponentProps<"input">, "size">, "style"> & { style?: CSSProperties & FieldKnobStyle } & {
  size?: ControlSize;
};

type RefinedInputProps = InputProps & Pick<ComponentProps<typeof InputPrimitive>, "render">;

export function Input({ ref, size = "md", className, ...props }: RefinedInputProps) {
  const groupControlRef = useInputGroupControlRef(ref);
  if (useIsInsideInputGroup()) {
    return (
      <InputPrimitive
        {...props}
        ref={groupControlRef}
        data-control-ui="input-group"
        data-control-family="field"
        data-field-kind="input-group"
        data-slot="input"
        className={cn("h-full min-w-0 flex-1", className)}
      />
    );
  }
  return (
    <InputPrimitive
      {...props}
      ref={ref}
      data-control-ui="input"
      data-slot="root"
      data-control-family="field"
      data-control="true"
      data-size={size}
      className={cn("w-full min-w-0", className)}
    />
  );
}
