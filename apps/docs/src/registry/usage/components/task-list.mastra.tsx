"use client";

import { useChat } from "@mastra/react";

import { TaskList, TaskListContent, TaskListItem, TaskListTrigger } from "@/components/control-ui/task-list";

export function Example({ agentId }: { agentId: string }) {
  const { tasks } = useChat({ agentId });

  return (
    <TaskList defaultOpen={false}>
      <TaskListTrigger />
      <TaskListContent>
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            label={task.status === "in_progress" ? task.activeForm : task.content}
            status={task.status === "in_progress" ? "active" : task.status}
          />
        ))}
      </TaskListContent>
    </TaskList>
  );
}
