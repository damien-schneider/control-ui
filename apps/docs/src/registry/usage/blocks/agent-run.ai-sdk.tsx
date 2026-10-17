"use client";

import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import { type DynamicToolUIPart, getToolName, isDynamicToolUIPart, isToolUIPart, type ToolUIPart, type UIMessage } from "ai";
import type { ActivityState } from "@/components/control-ui/activity";
import type { AgentRunStatus } from "@/components/control-ui/blocks/agent-run";
import {
  AgentRunAside,
  AgentRunBlock,
  AgentRunBody,
  AgentRunDetails,
  AgentRunHeader,
  AgentRunPlan,
  AgentRunStep,
  AgentRunToolCall,
} from "@/components/control-ui/blocks/agent-run";
import type { ToolApprovalState } from "@/components/control-ui/tool-approval";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalField,
  ToolApprovalFooter,
  ToolApprovalHeader,
  ToolApprovalIcon,
  ToolApprovalPreview,
  ToolApprovalRisk,
  ToolApprovalStatus,
  ToolApprovalTitle,
} from "@/components/control-ui/tool-approval";
import { Button } from "@/components/control-ui/ui/button";
import type { TimelineState } from "@/components/control-ui/ui/timeline";

type ToolPart = ToolUIPart | DynamicToolUIPart;
type ApprovalResponse = UseChatHelpers<UIMessage>["addToolApprovalResponse"];
type Task = { id: string; content: string; status: "pending" | "in_progress" | "completed"; activeForm: string };

// Your `task_write` tool returns `{ tasks }` with this shape; the latest result is the plan.
const TASK_TOOL_NAMES: readonly string[] = ["task_write", "task_update", "task_complete", "task_check"];
const BEFORE_PLAN = "before-plan";

function isTaskList(value: unknown): value is { tasks: Task[] } {
  if (typeof value !== "object" || value === null || !("tasks" in value) || !Array.isArray(value.tasks)) return false;
  return value.tasks.every(
    (task: unknown) =>
      typeof task === "object" && task !== null && "id" in task && "content" in task && "status" in task && "activeForm" in task,
  );
}

function activityState(state: ToolPart["state"]): ActivityState {
  if (state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "approval-requested") return "waiting";
  if (state === "input-streaming" || state === "input-available" || state === "approval-responded") return "running";
  return "pending";
}

function groupToolsByTask(parts: readonly ToolPart[]) {
  let plan: Task[] = [];
  let currentStepId: string | undefined;
  const toolsByStep = new Map<string, ToolPart[]>();

  for (const part of parts) {
    if (TASK_TOOL_NAMES.includes(getToolName(part))) {
      const result = part.state === "output-available" ? part.output : undefined;
      if (isTaskList(result)) {
        plan = result.tasks;
        currentStepId = plan.find((task) => task.status === "in_progress")?.id ?? currentStepId;
      }
      continue;
    }
    const stepId = currentStepId ?? BEFORE_PLAN;
    const bucket = toolsByStep.get(stepId) ?? [];
    bucket.push(part);
    toolsByStep.set(stepId, bucket);
  }

  return { plan, toolsByStep };
}

function gettingStartedState(tools: readonly ToolPart[]): TimelineState {
  const states = tools.map((part) => activityState(part.state));
  if (states.includes("waiting")) return "waiting";
  if (states.includes("running")) return "running";
  if (states.includes("error")) return "error";
  return "success";
}

const taskStepStates = { completed: "success", in_progress: "running", pending: "pending" } satisfies Record<Task["status"], TimelineState>;

function renderTool(part: ToolPart, onApprovalResponse: ApprovalResponse) {
  const approval = part.approval;
  let approvalState: ToolApprovalState = "pending";
  if (approval?.approved === true) approvalState = "approved";
  if (approval?.approved === false) approvalState = "denied";

  return [
    <AgentRunToolCall
      key={part.toolCallId}
      name={getToolName(part)}
      state={activityState(part.state)}
      input={part.input}
      output={part.output}
      errorText={part.errorText}
    />,
    approval === undefined ? null : (
      <ToolApproval
        key={`${part.toolCallId}-approval`}
        state={approvalState}
        onApprove={() => onApprovalResponse({ id: approval.id, approved: true })}
        onDeny={() => onApprovalResponse({ id: approval.id, approved: false })}
      >
        <ToolApprovalBody>
          <ToolApprovalHeader>
            <ToolApprovalIcon />
            <ToolApprovalTitle>{`Run ${getToolName(part)}?`}</ToolApprovalTitle>
            <ToolApprovalRisk />
            <ToolApprovalStatus />
          </ToolApprovalHeader>
          <ToolApprovalPreview>
            <ToolApprovalField label="Input">
              <div className="whitespace-pre-wrap wrap-anywhere">{JSON.stringify(part.input, null, 2)}</div>
            </ToolApprovalField>
          </ToolApprovalPreview>
        </ToolApprovalBody>
        <ToolApprovalFooter>
          <ToolApprovalDeny />
          <ToolApprovalApprove />
        </ToolApprovalFooter>
      </ToolApproval>
    ),
  ];
}

export function AgentRunSurface({ run }: { run: { id: string; title: string; startedAt: number; endedAt?: number } }) {
  const { messages, status: chatStatus, stop, addToolApprovalResponse } = useChat();
  const toolParts = messages
    .flatMap((message) => (message.role === "assistant" ? message.parts : []))
    .filter((part): part is ToolPart => isToolUIPart(part) || isDynamicToolUIPart(part));
  const { plan, toolsByStep } = groupToolsByTask(toolParts);
  const startedTools = toolsByStep.get(BEFORE_PLAN) ?? [];
  const toolCount = [...toolsByStep.values()].reduce((total, tools) => total + tools.length, 0);

  let status: AgentRunStatus = "pending";
  if (toolParts.some((part) => part.state === "approval-requested")) status = "waiting";
  else if (chatStatus === "submitted" || chatStatus === "streaming") status = "running";
  else if (chatStatus === "error") status = "error";
  else if (messages.length > 0 && plan.every((task) => task.status === "completed")) status = "success";

  const aside = (
    <AgentRunAside>
      <AgentRunDetails items={[{ label: "Tool calls", value: String(toolCount) }]} />
    </AgentRunAside>
  );

  return (
    <AgentRunBlock runs={[{ id: run.id, title: run.title, status }]} activeRunId={run.id}>
      <AgentRunHeader
        title={run.title}
        status={status}
        startedAt={run.startedAt}
        endedAt={run.endedAt}
        actions={
          status === "running" ? (
            <Button size="xs" variant="quiet" onClick={stop}>
              Stop
            </Button>
          ) : null
        }
      />
      <AgentRunBody aside={aside}>
        <AgentRunPlan description={plan.length === 0 && startedTools.length === 0 ? "Waiting for the agent to plan…" : undefined}>
          {startedTools.length > 0 ? (
            <AgentRunStep title="Getting started" state={gettingStartedState(startedTools)}>
              {startedTools.flatMap((part) => renderTool(part, addToolApprovalResponse))}
            </AgentRunStep>
          ) : null}
          {plan.map((task) => {
            const tools = toolsByStep.get(task.id) ?? [];
            const isWaiting = tools.some((part) => part.state === "approval-requested");
            return (
              <AgentRunStep
                key={task.id}
                title={task.content}
                detail={task.status === "in_progress" ? task.activeForm : undefined}
                state={isWaiting ? "waiting" : taskStepStates[task.status]}
              >
                {tools.length > 0 ? tools.flatMap((part) => renderTool(part, addToolApprovalResponse)) : null}
              </AgentRunStep>
            );
          })}
        </AgentRunPlan>
      </AgentRunBody>
    </AgentRunBlock>
  );
}
