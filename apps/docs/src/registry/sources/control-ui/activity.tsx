"use client";

import { Check, ChevronRight, CircleAlert, CircleDashed, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { ActivityDetailFormat, ActivityKind, ActivityProps, ActivityState, ScrollAreaProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

const activityStatusLabels = {
  pending: "Pending",
  running: "Running",
  success: "Complete",
  error: "Failed",
} satisfies Record<ActivityState, string>;

const activityStatusIcons = {
  pending: CircleDashed,
  running: LoaderCircle,
  success: Check,
  error: CircleAlert,
} satisfies Record<ActivityState, typeof CircleDashed>;

type ActivityContextValue = {
  isError: boolean;
  isRunning: boolean;
  kind: ActivityKind;
  name?: string;
  state: ActivityState;
  statusLabel: ReactNode;
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

function useActivityContext() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("Activity compound components must be rendered inside <Activity>.");
  return context;
}

function formatActivityTitle(value: string) {
  const words = value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  return words ? `${words[0].toUpperCase()}${words.slice(1)}` : value;
}

export function Activity({ kind = "default", name, state = "pending", statusLabel, className, children, ...props }: ActivityProps) {
  const context = {
    isError: state === "error",
    isRunning: state === "running",
    kind,
    name,
    state,
    statusLabel: statusLabel ?? activityStatusLabels[state],
  };
  return (
    <ActivityContext.Provider value={context}>
      <Collapsible
        data-control-ui="activity"
        data-slot="root"
        data-activity-state={state}
        data-activity-kind={kind}
        data-activity-name={name}
        aria-busy={context.isRunning || undefined}
        className={cn(
          "group/activity my-1 min-w-0 text-body [--activity-content-indent:calc(var(--activity-row-padding-x)+var(--activity-icon-size)+var(--activity-row-gap))] [--activity-icon-size:1rem] [--activity-row-gap:0.5rem] [--activity-row-padding-x:0.375rem]",
          skinSlot("activity", "root", { kind, state }),
          className,
        )}
        {...props}
      >
        <span
          role={context.isError ? "alert" : "status"}
          aria-live={context.isError ? "assertive" : "polite"}
          aria-atomic="true"
          data-control-ui="activity"
          data-slot="announcement"
          data-status={state}
          className={cn("sr-only", skinSlot("activity", "announcement", {}))}
        >
          {context.statusLabel}
        </span>
        {children}
      </Collapsible>
    </ActivityContext.Provider>
  );
}

type ActivityRowProps = ComponentProps<"div">;

const activityRowClassName =
  "flex min-h-8 w-fit max-w-full items-center gap-[var(--activity-row-gap)] px-[var(--activity-row-padding-x)] py-1 text-left text-muted-foreground";

export function ActivityRow({ className, ...props }: ActivityRowProps) {
  return (
    <div
      data-control-ui="activity"
      data-slot="row"
      {...props}
      className={cn(activityRowClassName, skinSlot("activity", "row", {}), className)}
    />
  );
}

export type ActivityTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  chevronProps?: ComponentProps<typeof ChevronRight> & { "data-slot"?: string };
};

export function ActivityTrigger({ className, children, chevronProps, ...props }: ActivityTriggerProps) {
  const activity = useActivityContext();
  return (
    <CollapsibleTrigger
      data-control-ui="activity"
      data-slot="trigger"
      {...props}
      className={cn(
        activityRowClassName,
        "rounded-[var(--radius-control)] hover:bg-muted/45 hover:text-foreground focus-visible:bg-muted/45",
        skinSlot("activity", "trigger", { kind: activity.kind }),
        className,
      )}
    >
      {children}
      <ChevronRight
        aria-hidden="true"
        data-control-ui="activity"
        data-slot="chevron"
        {...chevronProps}
        className={cn("size-3.5 shrink-0 text-muted-foreground/75", chevronProps?.className)}
      />
    </CollapsibleTrigger>
  );
}

export type ActivityIconProps = ComponentProps<"span">;

export function ActivityIcon({ className, children, ...props }: ActivityIconProps) {
  const activity = useActivityContext();
  const Icon = activityStatusIcons[activity.state];
  return (
    <span
      aria-hidden="true"
      data-control-ui="activity"
      data-slot="icon"
      {...props}
      className={cn(
        "flex size-[var(--activity-icon-size)] shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-[var(--activity-icon-size)]",
        activity.isRunning && "text-foreground",
        activity.isRunning && !children && "[&_svg]:animate-spin",
        activity.isError && "text-destructive-text",
        skinSlot("activity", "icon", { kind: activity.kind, state: activity.state }),
        className,
      )}
    >
      {children ?? <Icon />}
    </span>
  );
}

export type ActivityTitleProps = ComponentProps<"span">;

export function ActivityTitle({ className, children, ...props }: ActivityTitleProps) {
  const activity = useActivityContext();
  return (
    <span
      data-control-ui="activity"
      data-slot="title"
      {...props}
      className={cn("min-w-0 flex-1 truncate text-label font-normal text-current", skinSlot("activity", "title", {}), className)}
    >
      {children ?? (activity.name ? formatActivityTitle(activity.name) : undefined)}
    </span>
  );
}

export type ActivityStatusProps = ComponentProps<"span">;

export function ActivityStatus({ className, children, ...props }: ActivityStatusProps) {
  const activity = useActivityContext();
  return (
    <span
      data-control-ui="activity"
      data-slot="status"
      {...props}
      data-status={activity.state}
      className={cn(
        "shrink-0 text-caption text-muted-foreground",
        activity.isError && "text-destructive-text",
        skinSlot("activity", "status", { kind: activity.kind, state: activity.state }),
        className,
      )}
    >
      {children ?? activity.statusLabel}
    </span>
  );
}

export type ActivityContentProps = Omit<ComponentProps<typeof CollapsibleContent>, "children"> & {
  children?: ReactNode;
  maxHeight?: string | false;
  scrollAreaProps?: Omit<ScrollAreaProps, "children" | "maxHeight">;
};

export function ActivityContent({
  className,
  children,
  maxHeight = "var(--activity-content-max-height, min(24rem, 50dvh))",
  scrollAreaProps,
  ...props
}: ActivityContentProps) {
  const { className: scrollAreaClassName, viewportProps, lockAxis = "x", ...resolvedScrollAreaProps } = scrollAreaProps ?? {};
  const resolvedViewportProps = {
    ...viewportProps,
    "data-control-ui": viewportProps?.["data-control-ui"] ?? "activity",
    "data-slot": viewportProps?.["data-slot"] ?? "content-viewport",
  };
  return (
    <CollapsibleContent
      data-control-ui="activity"
      data-slot="content"
      className={cn(skinSlot("activity", "content", {}), className)}
      {...props}
    >
      <ScrollArea
        maxHeight={maxHeight || undefined}
        lockAxis={lockAxis}
        viewportProps={resolvedViewportProps}
        className={cn("min-w-0", scrollAreaClassName)}
        {...resolvedScrollAreaProps}
      >
        <div className="grid min-w-0 gap-3 pb-2 pl-[var(--activity-content-indent)] pr-1 pt-0.5">{children}</div>
      </ScrollArea>
    </CollapsibleContent>
  );
}

export type ActivityDetailProps = ComponentProps<"div">;

export function ActivityDetail({ className, ...props }: ActivityDetailProps) {
  return (
    <div
      data-control-ui="activity"
      data-slot="detail"
      {...props}
      className={cn("grid min-w-0 gap-1", skinSlot("activity", "detail", {}), className)}
    />
  );
}

export type ActivityDetailLabelProps = ComponentProps<"div">;

export function ActivityDetailLabel({ className, ...props }: ActivityDetailLabelProps) {
  return (
    <div
      data-control-ui="activity"
      data-slot="detail-label"
      {...props}
      className={cn(
        "text-micro font-medium uppercase tracking-[0.08em] text-muted-foreground",
        skinSlot("activity", "detail-label", {}),
        className,
      )}
    />
  );
}

export type ActivityDetailContentProps = ComponentProps<"div"> & {
  format?: ActivityDetailFormat;
};

export function ActivityDetailContent({ format = "text", className, ...props }: ActivityDetailContentProps) {
  return (
    <div
      data-control-ui="activity"
      data-slot="detail-content"
      data-format={format}
      {...props}
      className={cn(
        "min-w-0 whitespace-pre-wrap wrap-anywhere text-label leading-5 text-foreground",
        format === "code" && "w-fit max-w-full rounded-[var(--radius-control)] bg-muted/50 px-2 py-1.5 font-mono text-caption",
        skinSlot("activity", "detail-content", { format }),
        className,
      )}
    />
  );
}
