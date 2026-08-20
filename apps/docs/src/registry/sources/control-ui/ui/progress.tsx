"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type {
  ProgressIndicatorProps,
  ProgressLabelProps,
  ProgressProps,
  ProgressTrackProps,
  ProgressValueProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

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
