"use client";

import { ChevronRight, CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useState } from "react";

import type { TaskListProps, TaskStatus } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";

type TaskEntry = {
  key: string;
  status: TaskStatus;
  label: string;
};

type TaskListContextValue = {
  registerTask: (entry: TaskEntry) => void;
  unregisterTask: (key: string) => void;
  tasks: TaskEntry[];
  total: number;
  current?: TaskEntry;
  /** 1-based position rendered as "Task 3 of 5"; 0 while no task is registered. */
  currentNumber: number;
  allCompleted: boolean;
};

const TaskListContext = createContext<TaskListContextValue | null>(null);

function useTaskListContext() {
  const context = useContext(TaskListContext);
  if (!context) throw new Error("TaskList compound components must be rendered inside <TaskList>.");
  return context;
}

function upsert(entries: TaskEntry[], entry: TaskEntry) {
  const index = entries.findIndex((existing) => existing.key === entry.key);
  if (index === -1) return [...entries, entry];
  const next = [...entries];
  next[index] = entry;
  return next;
}

function currentTaskIndex(tasks: TaskEntry[]) {
  const active = tasks.findIndex((task) => task.status === "active");
  if (active !== -1) return active;
  const pending = tasks.findIndex((task) => task.status === "pending");
  if (pending !== -1) return pending;
  return tasks.length - 1;
}

export function TaskList({ className, children, ...props }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  // useState-once keeps identities stable; register upserts IN PLACE (a status change must not reorder)
  // and unregister runs only at item unmount — a combined effect cleanup would move updated items to the end.
  const [registerTask] = useState(() => (entry: TaskEntry) => {
    setTasks((previous) => upsert(previous, entry));
  });
  const [unregisterTask] = useState(() => (key: string) => {
    setTasks((previous) => previous.filter((task) => task.key !== key));
  });

  const total = tasks.length;
  const currentIndex = currentTaskIndex(tasks);
  const current = tasks[currentIndex];
  const allCompleted = total > 0 && tasks.every((task) => task.status === "completed");

  return (
    <TaskListContext.Provider
      value={{ registerTask, unregisterTask, tasks, total, current, currentNumber: total === 0 ? 0 : currentIndex + 1, allCompleted }}
    >
      <Collapsible
        data-control-ui="task-list"
        data-slot="root"
        data-surface="panel"
        className={cn(
          "w-full overflow-hidden rounded-field border bg-card/90 text-body shadow-md ring-1 ring-foreground/4 backdrop-blur",
          skinSlot("task-list", "root", {}),
          className,
        )}
        {...props}
      >
        {children}
      </Collapsible>
    </TaskListContext.Provider>
  );
}

export type TaskListTriggerProps = ComponentProps<"button">;

export function TaskListTrigger({ className, children, ...props }: TaskListTriggerProps) {
  const list = useTaskListContext();

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <TaskListIndicator status={list.allCompleted ? "completed" : "active"} />
          <TaskListProgress />
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          {/* The collapsed pill previews the current task; the expanded list already shows it, so hide it while open. */}
          <TaskListLabel className="in-data-[state=open]:hidden" />
        </>
      )}
    </CollapsibleTrigger>
  );
}

export type TaskListProgressProps = ComponentProps<"span">;

export function TaskListProgress({ className, children, ...props }: TaskListProgressProps) {
  const list = useTaskListContext();

  return (
    <span
      data-control-ui="task-list"
      data-slot="progress"
      className={cn("shrink-0 font-medium tabular-nums text-muted-foreground", skinSlot("task-list", "progress", {}), className)}
      {...props}
    >
      {children ?? `Task ${list.currentNumber} of ${list.total}`}
    </span>
  );
}

export type TaskListLabelProps = ComponentProps<"span">;

export function TaskListLabel({ className, children, ...props }: TaskListLabelProps) {
  const list = useTaskListContext();

  return (
    <span
      data-control-ui="task-list"
      data-slot="label"
      className={cn("min-w-0 flex-1 truncate text-foreground", skinSlot("task-list", "label", {}), className)}
      {...props}
    >
      {children ?? list.current?.label}
    </span>
  );
}

export type TaskListContentProps = ComponentProps<"ol">;

export function TaskListContent({ className, children, ...props }: TaskListContentProps) {
  return (
    // keepMounted: closed items must stay registered — the collapsed pill derives "Task 3 of 5" from them.
    <CollapsibleContent keepMounted>
      <ol
        data-control-ui="task-list"
        data-slot="items"
        className={cn("flex flex-col gap-0.5 px-2 pb-2", skinSlot("task-list", "items", {}), className)}
        {...props}
      >
        {children}
      </ol>
    </CollapsibleContent>
  );
}

export type TaskListItemProps = Omit<ComponentProps<"li">, "children"> & {
  label: string;
  status?: TaskStatus;
  children?: ReactNode;
};

export function TaskListItem({ label, status = "pending", className, children, ...props }: TaskListItemProps) {
  const list = useTaskListContext();
  const key = useId();

  useEffect(() => list.registerTask({ key, status, label }), [list.registerTask, key, status, label]);
  useEffect(() => () => list.unregisterTask(key), [list.unregisterTask, key]);

  return (
    <li
      data-control-ui="task-list"
      data-slot="item"
      data-status={status}
      className={cn(
        "flex items-center gap-2 rounded-[var(--radius-popup-item)] px-1.5 py-1 text-sm text-foreground",
        "data-[status=pending]:text-muted-foreground data-[status=pending]:opacity-70",
        skinSlot("task-list", "item", { status }),
        className,
      )}
      {...props}
    >
      <TaskListIndicator status={status} />
      <span className="min-w-0 flex-1 truncate">{children ?? label}</span>
    </li>
  );
}

const indicatorIcons = {
  pending: CircleDashed,
  active: Loader2,
  completed: CircleCheck,
} as const;

export type TaskListIndicatorProps = ComponentProps<"span"> & {
  status?: TaskStatus;
};

export function TaskListIndicator({ status = "pending", className, ...props }: TaskListIndicatorProps) {
  const Icon = indicatorIcons[status];

  return (
    <span
      data-control-ui="task-list"
      data-slot="item-indicator"
      data-status={status}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-muted-foreground/70",
        "data-[status=active]:text-primary-text data-[status=completed]:text-primary-text",
        skinSlot("task-list", "item-indicator", { status }),
        className,
      )}
      {...props}
    >
      {/* Loader, not expressive motion: like Spinner, it keeps spinning under reduced motion. */}
      <Icon aria-hidden="true" className={cn("size-3.5", status === "active" && "animate-spin")} />
      <span className="sr-only">{status}</span>
    </span>
  );
}
