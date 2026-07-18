"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { RadioGroupProps, RadioProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI: RadioGroup owns value; Radio = circle sharing control ring w/ Checkbox/Button, fills --primary w/ --primary-foreground dot via Indicator when selected.
// Inside Field.Root, data-invalid ring surfaces validation; Base UI stamps data-checked/-unchecked/-disabled.
// `orientation` visual only — Base UI owns roving focus both axes; we branch flex direction, primitive exposes no such prop.
export function RadioGroup({ className, onValueChange, orientation = "vertical", ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-control-ui="radio-group"
      data-slot="root"
      data-orientation={orientation}
      onValueChange={onValueChange ? (value) => onValueChange(typeof value === "string" ? value : String(value ?? "")) : undefined}
      className={cn(
        "flex gap-2 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4 data-[orientation=vertical]:flex-col",
        skinSlot("radio-group", "root", {}),
        className,
      )}
      {...props}
    />
  );
}

export function Radio({ className, disabled, ...props }: RadioProps) {
  return (
    <RadioPrimitive.Root
      data-control-ui="radio-group"
      data-slot="item"
      disabled={disabled}
      className={cn(
        "group/radio relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none",
        "bg-card/72 shadow-sm ring-1 ring-inset ring-border transition duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:ring-foreground/25",
        "data-[checked]:bg-primary data-[checked]:ring-primary",
        "focus-visible:ring-2 focus-visible:ring-foreground/20",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "data-[invalid]:ring-2 data-[invalid]:ring-destructive",
        skinSlot("radio-group", "item", { disabled: disabled ?? false }),
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-control-ui="radio-group"
        data-slot="indicator"
        className="size-1.5 rounded-full bg-primary-foreground data-[unchecked]:hidden"
      />
    </RadioPrimitive.Root>
  );
}
