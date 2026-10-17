"use client";

import { MastraReactProvider, type TaskItem, type ToolInvocationPart, useChat } from "@mastra/react";
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

type RunDetails = { id: string; title: string; startedAt: number; endedAt?: number };
type TaskProgress = Pick<TaskItem, "id" | "status">;
type ToolCallApprovals = {
  decisions: Record<string, { status: "approved" | "declined" }>;
  pending: ReadonlySet<string>;
  approve: (toolCallId: string) => Promise<void>;
  decline: (toolCallId: string) => Promise<void>;
};

const TASK_TOOL_NAMES: readonly string[] = ["task_write", "task_update", "task_complete", "task_check"];
const BEFORE_PLAN = "before-plan";

function isTaskList(value: unknown): value is { tasks: TaskProgress[] } {
  if (typeof value !== "object" || value === null || !("tasks" in value) || !Array.isArray(value.tasks)) return false;
  return value.tasks.every(
    (task: unknown) =>
      typeof task === "object" &&
      task !== null &&
      "id" in task &&
      typeof task.id === "string" &&
      "status" in task &&
      typeof task.status === "string",
  );
}

function parseTaskList(result: unknown) {
  if (typeof result !== "string") return isTaskList(result) ? result.tasks : undefined;
  try {
    const parsed: unknown = JSON.parse(result);
    return isTaskList(parsed) ? parsed.tasks : undefined;
  } catch {
    return undefined;
  }
}

function pendingApprovalIds(metadata: Record<string, unknown> | undefined) {
  const requests = metadata?.requireApprovalMetadata;
  if (typeof requests !== "object" || requests === null) return [];
  return Object.values(requests).flatMap((request: unknown) =>
    typeof request === "object" && request !== null && "toolCallId" in request && typeof request.toolCallId === "string"
      ? [request.toolCallId]
      : [],
  );
}

function activityState(state: string): ActivityState {
  if (state === "result" || state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "approval-requested") return "waiting";
  if (state === "partial-call" || state === "input-streaming" || state === "call" || state === "approval-responded") return "running";
  return "pending";
}

function approvalState(decision: "approved" | "declined" | undefined): ToolApprovalState {
  if (decision === "approved") return "approved";
  if (decision === "declined") return "denied";
  return "pending";
}

function awaitsApproval(part: ToolInvocationPart, approvals: ToolCallApprovals) {
  const invocation = part.toolInvocation;
  if (approvals.decisions[invocation.toolCallId] !== undefined) return false;
  return invocation.state === "approval-requested" || approvals.pending.has(invocation.toolCallId);
}

function toolState(part: ToolInvocationPart, approvals: ToolCallApprovals): ActivityState {
  return awaitsApproval(part, approvals) ? "waiting" : activityState(part.toolInvocation.state);
}

function groupToolsByTask(parts: readonly ToolInvocationPart[]) {
  let currentStepId: string | undefined;
  const toolsByStep = new Map<string, ToolInvocationPart[]>();

  for (const part of parts) {
    const invocation = part.toolInvocation;
    if (TASK_TOOL_NAMES.includes(invocation.toolName)) {
      currentStepId = parseTaskList(invocation.result)?.find((task) => task.status === "in_progress")?.id ?? currentStepId;
      continue;
    }
    const stepId = currentStepId ?? BEFORE_PLAN;
    const bucket = toolsByStep.get(stepId) ?? [];
    bucket.push(part);
    toolsByStep.set(stepId, bucket);
  }

  return toolsByStep;
}

function gettingStartedState(tools: readonly ToolInvocationPart[], approvals: ToolCallApprovals): TimelineState {
  const states = tools.map((part) => toolState(part, approvals));
  if (states.includes("waiting")) return "waiting";
  if (states.includes("running")) return "running";
  if (states.includes("error")) return "error";
  return "success";
}

const taskStepStates = { completed: "success", in_progress: "running", pending: "pending" } satisfies Record<
  TaskItem["status"],
  TimelineState
>;

function renderTool(part: ToolInvocationPart, approvals: ToolCallApprovals) {
  const invocation = part.toolInvocation;
  const decision = approvals.decisions[invocation.toolCallId]?.status;
  const needsApproval = awaitsApproval(part, approvals) || decision !== undefined;

  return [
    <AgentRunToolCall
      key={invocation.toolCallId}
      name={invocation.toolName}
      state={toolState(part, approvals)}
      input={invocation.args}
      output={invocation.result}
      errorText={invocation.errorText}
    />,
    needsApproval ? (
      <ToolApproval
        key={`${invocation.toolCallId}-approval`}
        state={approvalState(decision)}
        onApprove={() => approvals.approve(invocation.toolCallId)}
        onDeny={() => approvals.decline(invocation.toolCallId)}
      >
        <ToolApprovalBody>
          <ToolApprovalHeader>
            <ToolApprovalIcon />
            <ToolApprovalTitle>{`Run ${invocation.toolName}?`}</ToolApprovalTitle>
            <ToolApprovalRisk />
            <ToolApprovalStatus />
          </ToolApprovalHeader>
          <ToolApprovalPreview>
            <ToolApprovalField label="Input">
              <div className="whitespace-pre-wrap wrap-anywhere">{JSON.stringify(invocation.args, null, 2)}</div>
            </ToolApprovalField>
          </ToolApprovalPreview>
        </ToolApprovalBody>
        <ToolApprovalFooter>
          <ToolApprovalDeny />
          <ToolApprovalApprove />
        </ToolApprovalFooter>
      </ToolApproval>
    ) : null,
  ];
}

function MastraAgentRun({ agentId, run }: { agentId: string; run: RunDetails }) {
  const { messages, tasks, isRunning, isAwaitingToolApproval, cancelRun, approveToolCall, declineToolCall, toolCallApprovals } = useChat({
    agentId,
  });
  const approvals = {
    decisions: toolCallApprovals,
    pending: new Set(messages.flatMap((message) => pendingApprovalIds(message.content.metadata))),
    approve: approveToolCall,
    decline: declineToolCall,
  };
  const toolParts = messages
    .flatMap((message) => (message.role === "assistant" ? message.content.parts : []))
    .filter((part): part is ToolInvocationPart => part.type === "tool-invocation");
  const toolsByStep = groupToolsByTask(toolParts);
  const startedTools = toolsByStep.get(BEFORE_PLAN) ?? [];
  const toolCount = [...toolsByStep.values()].reduce((total, tools) => total + tools.length, 0);

  let status: AgentRunStatus = "pending";
  if (isAwaitingToolApproval) status = "waiting";
  else if (isRunning) status = "running";
  else if (messages.length > 0 && tasks.every((task) => task.status === "completed")) status = "success";

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
            <Button size="xs" variant="quiet" onClick={cancelRun}>
              Stop
            </Button>
          ) : null
        }
      />
      <AgentRunBody aside={aside}>
        <AgentRunPlan description={tasks.length === 0 && startedTools.length === 0 ? "Waiting for the agent to plan…" : undefined}>
          {startedTools.length > 0 ? (
            <AgentRunStep title="Getting started" state={gettingStartedState(startedTools, approvals)}>
              {startedTools.flatMap((part) => renderTool(part, approvals))}
            </AgentRunStep>
          ) : null}
          {tasks.map((task) => {
            const tools = toolsByStep.get(task.id) ?? [];
            const isWaiting = tools.some((part) => awaitsApproval(part, approvals));
            return (
              <AgentRunStep
                key={task.id}
                title={task.content}
                detail={task.status === "in_progress" ? task.activeForm : undefined}
                state={isWaiting ? "waiting" : taskStepStates[task.status]}
              >
                {tools.length > 0 ? tools.flatMap((part) => renderTool(part, approvals)) : null}
              </AgentRunStep>
            );
          })}
        </AgentRunPlan>
      </AgentRunBody>
    </AgentRunBlock>
  );
}

export function AgentRunSurface({ agentId, baseUrl, run }: { agentId: string; baseUrl: string; run: RunDetails }) {
  return (
    <MastraReactProvider baseUrl={baseUrl}>
      <MastraAgentRun agentId={agentId} run={run} />
    </MastraReactProvider>
  );
}
