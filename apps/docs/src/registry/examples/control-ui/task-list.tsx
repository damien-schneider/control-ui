"use client";

import { useState } from "react";

import {
  ChatInput,
  ChatInputAccent,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";
import type { TaskStatus } from "@/components/control-ui/contracts";
import { TaskList, TaskListContent, TaskListItem, TaskListTrigger } from "@/components/control-ui/task-list";

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

  function submitPrompt({ clear }: { clear: () => void }) {
    setStep((current) => (current + 1) % (planSteps.length + 1));
    clear();
  }

  return (
    <div className="flex h-[440px] flex-col justify-end p-5">
      <ChatInput density="compact" onSubmit={submitPrompt}>
        <div className="absolute inset-x-2 bottom-full pb-2">
          <TaskList>
            <TaskListTrigger />
            <TaskListContent>
              {planSteps.map((label, index) => (
                <TaskListItem key={label} label={label} status={statusFor(index, step)} />
              ))}
            </TaskListContent>
          </TaskList>
        </div>
        <ChatInputShell>
          <ChatInputAccent />
          <ChatInputTextarea placeholder="Message the agent (sending advances the plan)..." />
          <ChatInputToolbar>
            <ChatInputTools>
              <span>
                {Math.min(step, planSteps.length)} of {planSteps.length} steps done
              </span>
            </ChatInputTools>
            <ChatInputSubmit>Send</ChatInputSubmit>
          </ChatInputToolbar>
        </ChatInputShell>
      </ChatInput>
    </div>
  );
}
