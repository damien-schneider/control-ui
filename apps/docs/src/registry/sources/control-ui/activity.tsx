"use client";

import { Check, ChevronRight, CircleAlert, CircleDashed, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { ActivityKind, ActivityProps, ActivityState, ScrollAreaProps } from "@/components/control-ui/contracts";
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
        data-status={state}
        data-surface={kind === "tool" ? "panel" : undefined}
        aria-busy={context.isRunning || undefined}
        className={cn("group/activity my-1 min-w-0 text-body", skinSlot("activity", "root", { kind, state }), className)}
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

const activityRowClassName = "flex min-h-8 w-fit max-w-full items-center gap-2 px-1.5 py-1 text-left text-muted-foreground";

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
        "flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4",
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
        <div className="grid min-w-0 gap-2 px-1 pb-2 pt-1">{children}</div>
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
      className={cn("text-caption font-medium text-muted-foreground", skinSlot("activity", "detail-label", {}), className)}
    />
  );
}

export type ActivityDetailContentProps = ComponentProps<"div">;

export function ActivityDetailContent({ className, ...props }: ActivityDetailContentProps) {
  return (
    <div
      data-control-ui="activity"
      data-slot="detail-content"
      {...props}
      className={cn(
        "min-w-0 whitespace-pre-wrap wrap-anywhere text-label leading-5 text-foreground",
        skinSlot("activity", "detail-content", {}),
        className,
      )}
    />
  );
}

export type ActivityListProps = ComponentProps<"ol">;

export function ActivityList({ className, ...props }: ActivityListProps) {
  return (
    <ol
      data-control-ui="activity"
      data-slot="list"
      {...props}
      className={cn("grid gap-0.5", skinSlot("activity", "list", {}), className)}
    />
  );
}

export type ActivityItemProps = ComponentProps<"li"> & {
  icon?: ReactNode;
};

export function ActivityItem({ className, icon, children, ...props }: ActivityItemProps) {
  return (
    <li
      data-control-ui="activity"
      data-slot="item"
      {...props}
      className={cn(
        "flex min-h-7 min-w-0 items-start gap-2 py-0.5 text-label leading-5 text-muted-foreground",
        skinSlot("activity", "item", {}),
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          data-control-ui="activity"
          data-slot="item-icon"
          className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center [&_svg]:size-4", skinSlot("activity", "item-icon", {}))}
        >
          {icon}
        </span>
      ) : null}
      <span
        data-control-ui="activity"
        data-slot="item-content"
        className={cn("min-w-0 flex-1 wrap-anywhere", skinSlot("activity", "item-content", {}))}
      >
        {children}
      </span>
    </li>
  );
}
