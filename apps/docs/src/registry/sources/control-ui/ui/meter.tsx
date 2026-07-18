"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type { MeterIndicatorProps, MeterLabelProps, MeterProps, MeterTrackProps, MeterValueProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, 100% Base UI: static gauge, Track is --muted rail, Indicator fills w/ --primary from value/min/max, no JS.
// Unlike Progress, value always a number (role=meter, never indeterminate); optional Label+Value row above rail.
export function Meter({ className, ...props }: MeterProps) {
  return (
    <MeterPrimitive.Root
      data-control-ui="meter"
      data-slot="root"
      className={cn("flex w-full flex-col gap-2", skinSlot("meter", "root", {}), className)}
      {...props}
    />
  );
}

export function MeterLabel({ className, ...props }: MeterLabelProps) {
  return (
    <MeterPrimitive.Label
      data-control-ui="meter"
      data-slot="label"
      className={cn("text-label font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function MeterValue({ className, ...props }: MeterValueProps) {
  return (
    <MeterPrimitive.Value
      data-control-ui="meter"
      data-slot="value"
      className={cn("text-label tabular-nums text-muted-foreground", className)}
      {...props}
    />
  );
}

export function MeterTrack({ className, ...props }: MeterTrackProps) {
  return (
    <MeterPrimitive.Track
      data-control-ui="meter"
      data-slot="track"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", skinSlot("meter", "track", {}), className)}
      {...props}
    />
  );
}

export function MeterIndicator({ className, ...props }: MeterIndicatorProps) {
  return (
    <MeterPrimitive.Indicator
      data-control-ui="meter"
      data-slot="indicator"
      className={cn(
        "h-full rounded-full bg-primary transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
        skinSlot("meter", "indicator", {}),
        className,
      )}
      {...props}
    />
  );
}
