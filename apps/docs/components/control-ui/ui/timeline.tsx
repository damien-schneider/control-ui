import type {
  TimelineContentProps,
  TimelineDescriptionProps,
  TimelineIndicatorProps,
  TimelineItemProps,
  TimelineMetaProps,
  TimelineProps,
  TimelineSeparatorProps,
  TimelineTitleProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

export function Timeline({ className, ...props }: TimelineProps) {
  return (
    <ol
      data-control-ui="timeline"
      data-slot="root"
      {...props}
      className={cn("grid min-w-0", skinSlot("timeline", "root", {}), className)}
    />
  );
}

export function TimelineItem({ state = "neutral", className, ...props }: TimelineItemProps) {
  return (
    <li
      data-control-ui="timeline"
      data-slot="item"
      data-state={state}
      {...props}
      className={cn(
        "group/timeline-item relative grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0",
        skinSlot("timeline", "item", { state }),
        className,
      )}
    />
  );
}

export function TimelineIndicator({ className, ...props }: TimelineIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="timeline"
      data-slot="indicator"
      {...props}
      className={cn(
        "relative z-10 col-start-1 row-start-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&_svg]:size-4 group-data-[state=error]/timeline-item:text-destructive-text group-data-[state=running]/timeline-item:text-primary-text group-data-[state=success]/timeline-item:text-foreground",
        skinSlot("timeline", "indicator", {}),
        className,
      )}
    />
  );
}

export function TimelineSeparator({ className, ...props }: TimelineSeparatorProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="timeline"
      data-slot="separator"
      {...props}
      className={cn(
        "absolute top-5 bottom-0 left-[calc(0.5rem-0.5px)] col-start-1 w-px bg-border group-last/timeline-item:hidden",
        skinSlot("timeline", "separator", {}),
        className,
      )}
    />
  );
}

export function TimelineContent({ className, ...props }: TimelineContentProps) {
  return (
    <div
      data-control-ui="timeline"
      data-slot="content"
      {...props}
      className={cn("col-start-2 row-start-1 grid min-w-0 gap-1", skinSlot("timeline", "content", {}), className)}
    />
  );
}

export function TimelineTitle({ className, ...props }: TimelineTitleProps) {
  return (
    <div
      data-control-ui="timeline"
      data-slot="title"
      {...props}
      className={cn("min-w-0 text-label font-medium leading-5 text-foreground", skinSlot("timeline", "title", {}), className)}
    />
  );
}

export function TimelineDescription({ className, ...props }: TimelineDescriptionProps) {
  return (
    <div
      data-control-ui="timeline"
      data-slot="description"
      {...props}
      className={cn("min-w-0 wrap-anywhere text-label leading-5 text-muted-foreground", skinSlot("timeline", "description", {}), className)}
    />
  );
}

export function TimelineMeta({ className, ...props }: TimelineMetaProps) {
  return (
    <div
      data-control-ui="timeline"
      data-slot="meta"
      {...props}
      className={cn("mt-1 flex min-w-0 flex-wrap items-center gap-1.5", skinSlot("timeline", "meta", {}), className)}
    />
  );
}
