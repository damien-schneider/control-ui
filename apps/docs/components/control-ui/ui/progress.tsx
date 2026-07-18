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
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI: Track is --muted rail, Indicator fills w/ --primary from value/min/max, no JS.
// Optional Label+Value row above rail; both plain text slots.
export function Progress({ className, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-control-ui="progress"
      data-slot="root"
      className={cn("flex w-full flex-col gap-2", skinSlot("progress", "root", {}), className)}
      {...props}
    />
  );
}

export function ProgressLabel({ className, ...props }: ProgressLabelProps) {
  return (
    <ProgressPrimitive.Label
      data-control-ui="progress"
      data-slot="label"
      className={cn("text-label font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function ProgressValue({ className, ...props }: ProgressValueProps) {
  return (
    <ProgressPrimitive.Value
      data-control-ui="progress"
      data-slot="value"
      className={cn("text-label tabular-nums text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  return (
    <ProgressPrimitive.Track
      data-control-ui="progress"
      data-slot="track"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", skinSlot("progress", "track", {}), className)}
      {...props}
    />
  );
}

export function ProgressIndicator({ className, ...props }: ProgressIndicatorProps) {
  return (
    <ProgressPrimitive.Indicator
      data-control-ui="progress"
      data-slot="indicator"
      className={cn(
        "h-full rounded-full bg-primary transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
        skinSlot("progress", "indicator", {}),
        className,
      )}
      {...props}
    />
  );
}
