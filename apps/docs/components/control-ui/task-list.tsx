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

type TaskListRegistrationContextValue = {
  registerTask: (entry: TaskEntry) => void;
  unregisterTask: (key: string) => void;
};

type TaskListContextValue = {
  total: number;
  current?: TaskEntry;
  /** 1-based position rendered as "Task 3 of 5"; 0 while no task is registered. */
  currentNumber: number;
  allCompleted: boolean;
};

const TaskListContext = createContext<TaskListContextValue | null>(null);

const TaskListRegistrationContext = createContext<TaskListRegistrationContextValue | null>(null);

function useTaskListContext() {
  const context = useContext(TaskListContext);
  if (!context) throw new Error("TaskList compound components must be rendered inside <TaskList>.");
  return context;
}

function useTaskListRegistrationContext() {
  const context = useContext(TaskListRegistrationContext);
  if (!context) throw new Error("TaskList items must be rendered inside <TaskList>.");
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
  // register upserts in place so status change never reorders, and unregister runs only at item unmount —
  // combined effect cleanup would move every updated item to end
  const [registration] = useState<TaskListRegistrationContextValue>(() => ({
    registerTask(entry) {
      setTasks((previous) => upsert(previous, entry));
    },
    unregisterTask(key) {
      setTasks((previous) => previous.filter((task) => task.key !== key));
    },
  }));

  const total = tasks.length;
  const currentIndex = currentTaskIndex(tasks);
  const current = tasks[currentIndex];
  const allCompleted = total > 0 && tasks.every((task) => task.status === "completed");

  return (
    <TaskListRegistrationContext.Provider value={registration}>
      <TaskListContext.Provider value={{ total, current, currentNumber: total === 0 ? 0 : currentIndex + 1, allCompleted }}>
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
    </TaskListRegistrationContext.Provider>
  );
}

export type TaskListTriggerProps = ComponentProps<"button">;

export function TaskListTrigger({ className, children, ...props }: TaskListTriggerProps) {
  const { allCompleted } = useTaskListContext();

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
          <TaskListIndicator status={allCompleted ? "completed" : "active"} />
          <TaskListProgress />
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          {/* expanded list already shows current task, so pill's preview hides while open */}
          <TaskListLabel className="in-data-[state=open]:hidden" />
        </>
      )}
    </CollapsibleTrigger>
  );
}

export type TaskListProgressProps = ComponentProps<"span">;

export function TaskListProgress({ className, children, ...props }: TaskListProgressProps) {
  const { currentNumber, total } = useTaskListContext();

  return (
    <span
      data-control-ui="task-list"
      data-slot="progress"
      className={cn("shrink-0 font-medium tabular-nums text-muted-foreground", skinSlot("task-list", "progress", {}), className)}
      {...props}
    >
      {children ?? `Task ${currentNumber} of ${total}`}
    </span>
  );
}

export type TaskListLabelProps = ComponentProps<"span">;

export function TaskListLabel({ className, children, ...props }: TaskListLabelProps) {
  const { current } = useTaskListContext();

  return (
    <span
      data-control-ui="task-list"
      data-slot="label"
      className={cn("min-w-0 flex-1 truncate text-foreground", skinSlot("task-list", "label", {}), className)}
      {...props}
    >
      {children ?? current?.label}
    </span>
  );
}

export type TaskListContentProps = ComponentProps<"ol">;

export function TaskListContent({ className, children, ...props }: TaskListContentProps) {
  return (
    // closed items must stay registered — collapsed pill derives "Task 3 of 5" from them
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
  const { registerTask, unregisterTask } = useTaskListRegistrationContext();
  const key = useId();

  useEffect(() => registerTask({ key, status, label }), [registerTask, key, status, label]);
  useEffect(() => () => unregisterTask(key), [unregisterTask, key]);

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
      {/* loader, not expressive motion — like Spinner it keeps turning under reduced motion */}
      <Icon aria-hidden="true" className={cn("size-3.5", status === "active" && "animate-spin")} />
      <span className="sr-only">{status}</span>
    </span>
  );
}
