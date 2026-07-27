"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type { InputProps } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Auto-wires to Field through `FieldControl render={<Input/>}`, which is what publishes validity data-* ring styles off.
const fieldClasses =
  "rounded-[var(--radius-control)] border bg-card/72 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:ring-2 data-[invalid]:ring-destructive";

export function Input({ size = "md", className, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-control-ui="input"
      data-slot="root"
      data-size={size}
      className={cn("w-full min-w-0", fieldClasses, controlSize({ size }), skinSlot("input", "root", { size }), className)}
      {...props}
    />
  );
}
