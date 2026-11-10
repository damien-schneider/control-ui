"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlledChoice, HoverIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { ChoiceKnobStyle } from "@/components/control-ui/knob-contracts/choice-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

export type RadioGroupProps<TValue extends string = string> = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> &
  ControlledChoice<TValue> & {
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    orientation?: "horizontal" | "vertical";
    indicator?: HoverIndicator;
  } & { style?: CSSProperties & ChoiceKnobStyle };

export type RadioProps = Omit<RadioPrimitive.Root.Props<string>, "className" | "style" | "children"> & {
  className?: string;
  style?: CSSProperties & ChoiceKnobStyle;
};

// `orientation` is visual only — Base UI owns roving focus on both axes and exposes no such prop.
export function RadioGroup<TValue extends string = string>({
  className,
  orientation = "vertical",
  indicator,
  children,
  ...props
}: RadioGroupProps<TValue>) {
  const skin = useSkin();
  const resolvedIndicator = indicator ?? skin.indicators?.["radio-group"] ?? "none";
  return (
    <RadioGroupPrimitive<TValue>
      data-control-ui="radio-group"
      data-control-family="choice"
      data-choice-kind="radio-group"
      data-slot="root"
      data-orientation={orientation}
      data-track={resolvedIndicator}
      className={cn(
        "flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[track=hover]:relative data-[track=hover]:isolate",
        className,
      )}
      {...props}
    >
      {children}
      {resolvedIndicator === "hover" ? <TrackHighlight /> : null}
    </RadioGroupPrimitive>
  );
}

export function Radio({ className, ...props }: RadioProps) {
  return (
    <RadioPrimitive.Root
      data-control-ui="radio-group"
      data-choice-kind="radio-group"
      data-slot="item"
      data-control-family="choice"
      className={cn("group/radio relative inline-flex shrink-0 items-center justify-center", className)}
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

export function RadioGroupItem({ className, htmlFor, children, ...props }: ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      data-control-ui="radio-group"
      data-control-family="choice"
      data-choice-kind="radio-group"
      data-slot="label"
      data-track-item=""
      className={cn("flex items-start [&>[data-control-family=choice]]:mt-[calc((1lh_-_var(--cui-choice-size))/2)]", className)}
      {...props}
    >
      {children}
    </label>
  );
}
