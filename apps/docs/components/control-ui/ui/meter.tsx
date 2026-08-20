"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type { MeterIndicatorProps, MeterLabelProps, MeterProps, MeterTrackProps, MeterValueProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// value is required — role="meter" is static gauge, never indeterminate way Progress can be.
export function Meter({ className, ...props }: MeterProps) {
  return (
    <MeterPrimitive.Root
      data-control-ui="meter"
      data-range-kind="meter"
      data-slot="root"
      data-control-family="range"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  );
}

export function MeterLabel({ className, ...props }: MeterLabelProps) {
  return (
    <MeterPrimitive.Label
      data-control-ui="meter"
      data-control-family="range"
      data-range-kind="meter"
      data-slot="label"
      className={className}
      {...props}
    />
  );
}

export function MeterValue({ className, ...props }: MeterValueProps) {
  return (
    <MeterPrimitive.Value
      data-control-ui="meter"
      data-control-family="range"
      data-range-kind="meter"
      data-slot="value"
      className={className}
      {...props}
    />
  );
}

export function MeterTrack({ className, ...props }: MeterTrackProps) {
  return (
    <MeterPrimitive.Track
      data-control-ui="meter"
      data-control-family="range"
      data-range-kind="meter"
      data-slot="track"
      className={cn("relative h-2 w-full overflow-hidden", className)}
      {...props}
    />
  );
}

export function MeterIndicator({ className, ...props }: MeterIndicatorProps) {
  return (
    <MeterPrimitive.Indicator
      data-control-ui="meter"
      data-control-family="range"
      data-range-kind="meter"
      data-slot="indicator"
      className={className}
      {...props}
    />
  );
}
