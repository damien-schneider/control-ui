"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { RangeKnobStyle } from "@/components/control-ui/knob-contracts/range-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type ProgressProps = Omit<
  ComponentProps<"div"> & {
    value: number | null;
    min?: number;
    max?: number;
    format?: Intl.NumberFormatOptions;
    getAriaValueText?: (formattedValue: string | null, value: number | null) => string;
    locale?: Intl.LocalesArgument;
  },
  "style"
> & { style?: CSSProperties & RangeKnobStyle };

export type ProgressTrackProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & RangeKnobStyle };

export type ProgressIndicatorProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & RangeKnobStyle };

export type ProgressLabelProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & RangeKnobStyle };

export type ProgressValueProps = Omit<
  Omit<ComponentProps<"span">, "children"> & {
    children?: ((formattedValue: string | null, value: number | null) => ReactNode) | null;
  },
  "style"
> & { style?: CSSProperties & RangeKnobStyle };

// value null = indeterminate.
export function Progress({ className, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-control-ui="progress"
      data-range-kind="progress"
      data-slot="root"
      data-control-family="range"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <ProgressPrimitive.Label
      data-control-ui="progress"
      data-control-family="range"
      data-range-kind="progress"
      data-slot="label"
      className={className}
      {...props}
    />
  );
}

export function ProgressValue({ className, ...props }: ProgressValueProps) {
  return (
    <ProgressPrimitive.Value
      data-control-ui="progress"
      data-control-family="range"
      data-range-kind="progress"
      data-slot="value"
      className={className}
      {...props}
    />
  );
}

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  return (
    <ProgressPrimitive.Track
      data-control-ui="progress"
      data-control-family="range"
      data-range-kind="progress"
      data-slot="track"
      className={cn("relative h-2 w-full overflow-hidden", className)}
      {...props}
    />
  );
}

export function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-control-ui="progress"
      data-control-family="range"
      data-range-kind="progress"
      data-slot="indicator"
      className={className}
      {...props}
    />
  );
}
