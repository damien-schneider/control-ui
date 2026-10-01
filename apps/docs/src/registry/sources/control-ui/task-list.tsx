"use client";

import { ChevronRight, CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useState } from "react";

import type { TaskListKnobStyle } from "@/components/control-ui/knob-contracts/task-list-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { CollapsibleProps } from "@/components/control-ui/ui/collapsible";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { LiveStatus } from "@/components/control-ui/ui/live-status";

export type TaskStatus = "pending" | "active" | "completed";

export type TaskStatusLabels = Record<TaskStatus, string>;

export const taskStatusLabels: TaskStatusLabels = { pending: "Pending", active: "In progress", completed: "Done" };

export type TaskListProps = Omit<CollapsibleProps, "style"> & {
  statusLabels?: Partial<TaskStatusLabels>;
  style?: CSSProperties & TaskListKnobStyle;
};

type TaskListStyleProps<Props, Style> = Omit<Props, "style"> & { style?: CSSProperties & Style };

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
  statusLabels: TaskStatusLabels;
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

export function TaskList({ statusLabels, className, children, ...props }: TaskListProps) {
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
  const labels = { ...taskStatusLabels, ...statusLabels };
  const progressStatus = current?.status === "active" ? `${current.label}: ${labels.active}` : "";

  return (
    <TaskListRegistrationContext.Provider value={registration}>
      <TaskListContext.Provider
        value={{ total, current, currentNumber: total === 0 ? 0 : currentIndex + 1, allCompleted, statusLabels: labels }}
      >
        <Collapsible
          data-control-ui="task-list"
          data-control-family="task-list"
          data-slot="root"
          data-surface="panel"
          className={cn("w-full overflow-hidden", className)}
          {...props}
        >
          {children}
          <LiveStatus message={progressStatus} />
        </Collapsible>
      </TaskListContext.Provider>
    </TaskListRegistrationContext.Provider>
  );
}

export type TaskListTriggerProps = TaskListStyleProps<ComponentProps<"button">, TaskListKnobStyle>;

export function TaskListTrigger({ className, children, ...props }: TaskListTriggerProps) {
  const { allCompleted } = useTaskListContext();

  return (
    <CollapsibleTrigger
      data-control-ui="task-list"
      data-control-family="task-list"
      data-slot="trigger"
      className={cn("flex w-full items-center", className)}
      {...props}
    >
      {children ?? (
        <>
          <TaskListIndicator status={allCompleted ? "completed" : "active"} />
          <TaskListProgress />
          <ChevronRight
            aria-hidden="true"
            data-control-ui="task-list"
            data-control-family="task-list"
            data-slot="chevron"
            className="shrink-0"
          />
          {/* expanded list already shows current task, so pill's preview hides while open */}
          <TaskListLabel className="in-data-[state=open]:hidden" />
        </>
      )}
    </CollapsibleTrigger>
  );
}

export type TaskListProgressProps = TaskListStyleProps<ComponentProps<"span">, TaskListKnobStyle>;

export function TaskListProgress({ className, children, ...props }: TaskListProgressProps) {
  const { currentNumber, total } = useTaskListContext();

  return (
    <span data-control-ui="task-list" data-control-family="task-list" data-slot="progress" className={cn("shrink-0", className)} {...props}>
      {children ?? `Task ${currentNumber} of ${total}`}
    </span>
  );
}

export type TaskListLabelProps = TaskListStyleProps<ComponentProps<"span">, TaskListKnobStyle>;

export function TaskListLabel({ className, children, ...props }: TaskListLabelProps) {
  const { current } = useTaskListContext();
  const text = children ?? current?.label;

  return (
    <span
      data-control-ui="task-list"
      data-control-family="task-list"
      data-slot="label"
      title={typeof text === "string" ? text : undefined}
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    >
      {text}
    </span>
  );
}

export type TaskListContentProps = ComponentProps<"ol"> & { style?: CSSProperties & TaskListKnobStyle };

export function TaskListContent({ className, children, ...props }: TaskListContentProps) {
  return (
    // closed items must stay registered — collapsed pill derives "Task 3 of 5" from them
    <CollapsibleContent keepMounted>
      <ol
        data-control-ui="task-list"
        data-control-family="task-list"
        data-slot="items"
        className={cn("flex flex-col", className)}
        {...props}
      >
        {children}
      </ol>
    </CollapsibleContent>
  );
}

export type TaskListItemProps = TaskListStyleProps<Omit<ComponentProps<"li">, "children">, TaskListKnobStyle> & {
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
      data-control-family="task-list"
      data-slot="item"
      data-status={status}
      className={cn("flex items-center", className)}
      {...props}
    >
      <TaskListIndicator status={status} />
      <span className="min-w-0 flex-1 text-pretty">{children ?? label}</span>
    </li>
  );
}

const indicatorIcons = {
  pending: CircleDashed,
  active: Loader2,
  completed: CircleCheck,
} as const;

export type TaskListIndicatorProps = TaskListStyleProps<ComponentProps<"span">, TaskListKnobStyle> & {
  status?: TaskStatus;
};

export function TaskListIndicator({ status = "pending", className, ...props }: TaskListIndicatorProps) {
  const Icon = indicatorIcons[status];
  const statusLabels = useContext(TaskListContext)?.statusLabels ?? taskStatusLabels;

  return (
    <span
      data-control-ui="task-list"
      data-control-family="task-list"
      data-slot="item-indicator"
      data-status={status}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      {...props}
    >
      <Icon aria-hidden="true" data-motion-essential={status === "active" ? "" : undefined} className="size-3.5" />
      <span className="sr-only">{statusLabels[status]}</span>
    </span>
  );
}
