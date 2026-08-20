"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { InputProps } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";

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
