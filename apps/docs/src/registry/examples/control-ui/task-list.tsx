"use client";

import { useState } from "react";
import type { TaskStatus } from "@/components/control-ui/task-list";
import { TaskList, TaskListContent, TaskListItem, TaskListTrigger } from "@/components/control-ui/task-list";
import { Button } from "@/components/control-ui/ui/button";

const planSteps = [
  "Design data model + storage for projects/tasks/pomodoro",
  "Add native notification IPC handler for session completion",
  "Building projects sidebar and task list",
  "Build persistent pomodoro timer bar + timer engine",
  "Set window sizing, build, validate",
];

function statusFor(index: number, step: number): TaskStatus {
  if (index < step) return "completed";
  if (index === step) return "active";
  return "pending";
}

export function TaskListExample() {
  const [step, setStep] = useState(2);

  const isComplete = step === planSteps.length;

  return (
    <div className="mx-auto grid w-full max-w-xl gap-3">
      <TaskList defaultOpen>
        <TaskListTrigger />
        <TaskListContent>
          {planSteps.map((label, index) => (
            <TaskListItem key={label} label={label} status={statusFor(index, step)} />
          ))}
        </TaskListContent>
      </TaskList>
      <Button variant="quiet" size="sm" className="justify-self-end" onClick={() => setStep(isComplete ? 0 : step + 1)}>
        {isComplete ? "Restart plan" : "Complete current task"}
      </Button>
    </div>
  );
}
