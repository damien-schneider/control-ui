import type { ComponentProps, CSSProperties } from "react";
import type { TimelineKnobStyle } from "@/components/control-ui/knob-contracts/timeline-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TimelineState = "neutral" | "pending" | "running" | "success" | "error";

export type TimelineProps = ComponentProps<"ol"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineItemProps = ComponentProps<"li"> & {
  state?: TimelineState;
} & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineIndicatorProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineSeparatorProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineContentProps = ComponentProps<"div"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineTitleProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineDescriptionProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & TimelineKnobStyle };

export type TimelineMetaProps = ComponentProps<"div"> & { style?: CSSProperties & TimelineKnobStyle };

export function Timeline({ className, ...props }: TimelineProps) {
  return (
    <ol data-control-ui="timeline" data-control-family="timeline" data-slot="root" {...props} className={cn("grid min-w-0", className)} />
  );
}

export function TimelineItem({ state = "neutral", className, ...props }: TimelineItemProps) {
  return (
    <li
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="item"
      data-state={state}
      {...props}
      className={cn("group/timeline-item relative grid min-w-0 grid-cols-[1rem_minmax(0,1fr)]", className)}
    />
  );
}

export function TimelineIndicator({ className, ...props }: TimelineIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="indicator"
      {...props}
      className={cn("relative z-10 col-start-1 row-start-1 flex shrink-0 items-center justify-center", className)}
    />
  );
}

export function TimelineSeparator({ className, ...props }: TimelineSeparatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="separator"
      {...props}
      className={cn("absolute top-5 bottom-0 left-[calc(0.5rem-0.5px)] col-start-1 w-px group-last/timeline-item:hidden", className)}
    />
  );
}

export function TimelineContent({ className, ...props }: TimelineContentProps) {
  return (
    <div
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="content"
      {...props}
      className={cn("col-start-2 row-start-1 grid min-w-0", className)}
    />
  );
}

export function TimelineTitle({ className, ...props }: TimelineTitleProps) {
  return (
    <div data-control-ui="timeline" data-control-family="timeline" data-slot="title" {...props} className={cn("min-w-0", className)} />
  );
}

export function TimelineDescription({ className, ...props }: TimelineDescriptionProps) {
  return (
    <div
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="description"
      {...props}
      className={cn("min-w-0 wrap-anywhere", className)}
    />
  );
}

export function TimelineMeta({ className, ...props }: TimelineMetaProps) {
  return (
    <div
      data-control-ui="timeline"
      data-control-family="timeline"
      data-slot="meta"
      {...props}
      className={cn("flex min-w-0 flex-wrap items-center", className)}
    />
  );
}
