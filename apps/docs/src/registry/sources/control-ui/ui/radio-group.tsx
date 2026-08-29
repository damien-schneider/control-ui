"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlledChoice } from "@/components/control-ui/control-props";
import type { ChoiceKnobStyle } from "@/components/control-ui/knob-contracts/choice-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type RadioGroupProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & {
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    orientation?: "horizontal" | "vertical";
  } & { style?: CSSProperties & ChoiceKnobStyle };

export type RadioProps = Omit<
  {
    value: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  },
  "style"
> & { style?: CSSProperties & ChoiceKnobStyle };

// `orientation` is visual only — Base UI owns roving focus on both axes and exposes no such prop.
export function RadioGroup<TValue extends string = string>({ className, orientation = "vertical", ...props }: RadioGroupProps<TValue>) {
  return (
    <RadioGroupPrimitive<TValue>
      data-control-ui="radio-group"
      data-control-family="choice"
      data-choice-kind="radio-group"
      data-slot="root"
      data-orientation={orientation}
      className={cn("flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col", className)}
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
        "group/radio relative inline-flex shrink-0 cursor-pointer items-center justify-center",
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
        className="data-[unchecked]:hidden"
      />
    </RadioPrimitive.Root>
  );
}
