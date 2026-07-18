import type { TaskStatus } from "@/components/control-ui/contracts";
import { TaskList, TaskListContent, TaskListItem, TaskListTrigger } from "@/components/control-ui/task-list";

// Map your agent's plan/todo state (e.g. a todo tool's items) onto TaskListItem rows;
// the collapsed pill derives "Task 3 of 5" and the current label from item statuses.
export function Example({ tasks }: { tasks: { id: string; label: string; status: TaskStatus }[] }) {
  return (
    <TaskList defaultOpen={false}>
      <TaskListTrigger />
      <TaskListContent>
        {tasks.map((task) => (
          <TaskListItem key={task.id} label={task.label} status={task.status} />
        ))}
      </TaskListContent>
    </TaskList>
  );
}
