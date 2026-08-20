"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { RadioGroupProps, RadioProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// `orientation` is visual only — Base UI owns roving focus on both axes and exposes no such prop.
export function RadioGroup<TValue extends string = string>({ className, orientation = "vertical", ...props }: RadioGroupProps<TValue>) {
  return (
    <RadioGroupPrimitive<TValue>
      data-control-ui="radio-group"
      data-control-family="choice"
      data-choice-kind="radio-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn(
        "flex gap-2 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4 data-[orientation=vertical]:flex-col",
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
      data-choice-kind="radio-group"
      data-slot="item"
      data-control-family="choice"
      disabled={disabled}
      className={cn(
        "group/radio relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center",
        "data-[disabled]:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-control-ui="radio-group"
        data-control-family="choice"
        data-choice-kind="radio-group"
        data-slot="indicator"
        className="size-1.5 data-[unchecked]:hidden"
      />
    </RadioPrimitive.Root>
  );
}
