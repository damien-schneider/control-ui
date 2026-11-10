"use client";

import { ChevronRight, CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";

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
  /** Announced once every task is done. */
  completedLabel?: string;
  style?: CSSProperties & TaskListKnobStyle;
};

type TaskListStyleProps<Props, Style> = Omit<Props, "style"> & { style?: CSSProperties & Style };

type TaskEntry = {
  key: string;
  status: TaskStatus;
  label: string;
  node: HTMLElement | null;
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

function compareDocumentOrder(a: TaskEntry, b: TaskEntry) {
  if (!a.node || !b.node) return 0;
  const position = a.node.compareDocumentPosition(b.node);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

// Items register in mount order, so one inserted mid-list would count as the last task.
// Returns the input array when it is already ordered so a state update can bail out.
function inDocumentOrder(entries: TaskEntry[]) {
  const sorted = [...entries].sort(compareDocumentOrder);
  return sorted.every((entry, index) => entry === entries[index]) ? entries : sorted;
}

function currentTaskIndex(tasks: TaskEntry[]) {
  const active = tasks.findIndex((task) => task.status === "active");
  if (active !== -1) return active;
  const pending = tasks.findIndex((task) => task.status === "pending");
  if (pending !== -1) return pending;
  return tasks.length - 1;
}

export function TaskList({ statusLabels, completedLabel = "All tasks completed", className, children, ...props }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [hasProgressed, setHasProgressed] = useState(false);
  // register upserts in place so status change never reorders, and unregister runs only at item unmount —
  // combined effect cleanup would move every updated item to end
  const [registration] = useState<TaskListRegistrationContextValue>(() => ({
    registerTask(entry) {
      setTasks((previous) => inDocumentOrder(upsert(previous, entry)));
    },
    unregisterTask(key) {
      setTasks((previous) => previous.filter((task) => task.key !== key));
    },
  }));
  // A keyed reorder re-renders no item, so nothing re-registers.
  useEffect(() => setTasks(inDocumentOrder));

  const total = tasks.length;
  const currentIndex = currentTaskIndex(tasks);
  const current = tasks[currentIndex];
  const allCompleted = total > 0 && tasks.every((task) => task.status === "completed");
  const labels = { ...taskStatusLabels, ...statusLabels };
  // A list that mounts already finished (history) stays silent; only a completion that happens while mounted is announced.
  if (!hasProgressed && total > 0 && !allCompleted) setHasProgressed(true);
  const completedStatus = allCompleted && hasProgressed ? completedLabel : "";
  const progressStatus = current?.status === "active" ? `${current.label}: ${labels.active}` : completedStatus;

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
  const { current } = useTaskListContext();

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
          <TaskListIndicator status={current?.status ?? "pending"} />
          <TaskListProgress />
          <ChevronRight
            aria-hidden="true"
            data-icon-dir="inline"
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

export type TaskListProgressProps = TaskListStyleProps<ComponentProps<"span">, TaskListKnobStyle> & {
  /** Formats the 1-based position of the current task; `children` replaces it entirely. */
  label?: (current: number, total: number) => string;
};

function taskProgressLabel(current: number, total: number) {
  return `Task ${current} of ${total}`;
}

export function TaskListProgress({ label = taskProgressLabel, className, children, ...props }: TaskListProgressProps) {
  const { currentNumber, total } = useTaskListContext();

  return (
    <span data-control-ui="task-list" data-control-family="task-list" data-slot="progress" className={cn("shrink-0", className)} {...props}>
      {children ?? label(currentNumber, total)}
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
        // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none.
        role="list"
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

export function TaskListItem({ label, status = "pending", className, children, ref, ...props }: TaskListItemProps) {
  const { registerTask, unregisterTask } = useTaskListRegistrationContext();
  const key = useId();
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => registerTask({ key, status, label, node: itemRef.current }), [registerTask, key, status, label]);
  useEffect(() => () => unregisterTask(key), [unregisterTask, key]);

  return (
    <li
      ref={(node) => {
        itemRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
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
      <Icon aria-hidden="true" data-motion-essential={status === "active" ? "" : undefined} />
      <span className="sr-only">{statusLabels[status]}</span>
    </span>
  );
}
