"use client";

import { RotateCcw, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AgentRunStatus } from "@/components/control-ui/blocks/agent-run";
import {
  AgentRunAside,
  AgentRunBlock,
  AgentRunBody,
  AgentRunDetails,
  AgentRunHeader,
  AgentRunPlan,
  AgentRunSection,
  AgentRunStep,
  AgentRunToolCall,
} from "@/components/control-ui/blocks/agent-run";
import type { ToolApprovalState } from "@/components/control-ui/tool-approval";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalDescription,
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
import { CodeDiff } from "@/components/control-ui/ui/code-diff";
import {
  approvalMessage,
  type DemoStep,
  type DemoToolCall,
  demoRuns,
  draftAfter,
  draftBefore,
  initialSteps,
  RUN_ELAPSED_AT_OPEN_MS,
} from "./data";

const POST_SENT_MS = 1200;
const ARCHIVE_DONE_MS = 1600;

type DemoRun = {
  startedAt: number;
  endedAt?: number;
  status: AgentRunStatus;
  approval: ToolApprovalState;
  steps: DemoStep[];
};

function createInitialRun(): DemoRun {
  return {
    startedAt: Date.now() - RUN_ELAPSED_AT_OPEN_MS,
    status: "waiting",
    approval: "pending",
    steps: initialSteps.map((step) => ({ ...step, tools: step.tools.map((tool) => ({ ...tool })) })),
  };
}

function patchStep(steps: DemoStep[], stepId: string, patch: Partial<DemoStep>): DemoStep[] {
  return steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step));
}

function patchTool(steps: DemoStep[], toolId: string, patch: Partial<DemoToolCall>): DemoStep[] {
  return steps.map((step) => ({ ...step, tools: step.tools.map((tool) => (tool.id === toolId ? { ...tool, ...patch } : tool)) }));
}

function finishRun(run: DemoRun): DemoRun {
  const endedAt = Date.now();
  return {
    ...run,
    endedAt,
    status: "success",
    steps: patchTool(patchStep(run.steps, "archive", { state: "success", end: endedAt - run.startedAt }), "storage-move", {
      state: "success",
      end: endedAt - run.startedAt,
    }),
  };
}

function sendPost(run: DemoRun): DemoRun {
  const at = Date.now() - run.startedAt;
  const archiveTool: DemoToolCall = {
    id: "storage-move",
    name: "storage.move",
    summary: "3 files → cold storage",
    state: "running",
    start: at,
  };
  let steps = patchTool(run.steps, "slack-post", { state: "success", end: at, output: { ok: true, channel: "#revenue" } });
  steps = patchStep(steps, "post", { state: "success", end: at, detail: "Sent to the finance channel" });
  steps = patchStep(steps, "archive", { state: "running", start: at, tools: [archiveTool] });
  return { ...run, steps };
}

function denyPost(run: DemoRun): DemoRun {
  const endedAt = Date.now();
  const at = endedAt - run.startedAt;
  let steps = patchTool(run.steps, "slack-post", { state: "error", end: at, errorText: "Denied by you" });
  steps = patchStep(steps, "post", { state: "error", end: at, detail: "Skipped" });
  return { ...run, approval: "denied", status: "cancelled", endedAt, steps };
}

function stopRunning(run: DemoRun): DemoRun {
  const endedAt = Date.now();
  const at = endedAt - run.startedAt;
  const steps = run.steps.map((step) => ({
    ...step,
    ...(step.state === "running" ? { state: "error" as const, end: at } : {}),
    tools: step.tools.map((tool) =>
      tool.state === "running" ? { ...tool, state: "error" as const, end: at, errorText: "Stopped" } : tool,
    ),
  }));
  return { ...run, status: "cancelled", endedAt, steps };
}

export function AgentRunExample() {
  const [run, setRun] = useState(createInitialRun);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function approve() {
    setRun((current) => ({
      ...current,
      approval: "approved",
      status: "running",
      steps: patchTool(patchStep(current.steps, "post", { state: "running" }), "slack-post", { state: "running" }),
    }));
    timers.current.push(
      setTimeout(() => setRun(sendPost), POST_SENT_MS),
      setTimeout(() => setRun(finishRun), POST_SENT_MS + ARCHIVE_DONE_MS),
    );
  }

  function deny() {
    setRun(denyPost);
  }

  function stop() {
    if (run.status === "waiting") {
      deny();
      return;
    }
    clearTimers();
    setRun(stopRunning);
  }

  function runAgain() {
    clearTimers();
    setRun(createInitialRun());
  }

  const isActive = run.status === "running" || run.status === "waiting";
  const toolCount = run.steps.reduce((total, step) => total + step.tools.length, 0);
  const runs = demoRuns.map((summary) => (summary.id === "churn-report" ? { ...summary, status: run.status } : summary));
  const at = (offset: number | undefined) => (offset === undefined ? undefined : run.startedAt + offset);

  const aside = (
    <AgentRunAside>
      <AgentRunSection title="Draft">
        <CodeDiff oldText={draftBefore} newText={draftAfter} lang="markdown" overflow="wrap" diffStyle="unified" header={false} />
      </AgentRunSection>
      <AgentRunDetails
        items={[
          { label: "Agent", value: "Reporter" },
          { label: "Trigger", value: "Schedule · Mondays 09:00" },
          { label: "Tool calls", value: String(toolCount) },
          { label: "Cost", value: "$0.04" },
        ]}
      />
    </AgentRunAside>
  );

  return (
    <div className="h-[min(760px,82vh)] min-h-160 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background shadow-md">
      <AgentRunBlock layout="contained" persistOpen={false} keyboardShortcut={null} runs={runs} activeRunId="churn-report">
        <AgentRunHeader
          title="Weekly churn report"
          status={run.status}
          startedAt={run.startedAt}
          endedAt={run.endedAt}
          actions={
            isActive ? (
              <Button size="xs" variant="quiet" onClick={stop}>
                <Square />
                Stop
              </Button>
            ) : (
              <Button size="xs" variant="quiet" onClick={runAgain}>
                <RotateCcw />
                Run again
              </Button>
            )
          }
        />
        <AgentRunBody aside={aside}>
          <AgentRunPlan description={`${run.steps.length} steps`}>
            {run.steps.map((step) => (
              <AgentRunStep
                key={step.id}
                state={step.state}
                title={step.title}
                detail={step.detail}
                startedAt={at(step.start)}
                endedAt={at(step.end)}
              >
                {step.tools.map((tool) => (
                  <AgentRunToolCall
                    key={tool.id}
                    name={tool.name}
                    summary={tool.summary}
                    state={tool.state}
                    input={tool.input}
                    output={tool.output}
                    errorText={tool.errorText}
                    startedAt={at(tool.start)}
                    endedAt={at(tool.end)}
                  />
                ))}
                {step.id === "post" ? (
                  <ToolApproval state={run.approval} risk="medium" onApprove={approve} onDeny={deny}>
                    <ToolApprovalBody>
                      <ToolApprovalHeader>
                        <ToolApprovalIcon>
                          <Send />
                        </ToolApprovalIcon>
                        <ToolApprovalTitle>Post to #revenue</ToolApprovalTitle>
                        <ToolApprovalRisk />
                        <ToolApprovalStatus />
                      </ToolApprovalHeader>
                      <ToolApprovalDescription>The agent wants to share this week's churn summary.</ToolApprovalDescription>
                      <ToolApprovalPreview>
                        <ToolApprovalField label="Channel">#revenue</ToolApprovalField>
                        <ToolApprovalField label="Mentions">@finance-leads</ToolApprovalField>
                        <ToolApprovalField label="Message">{approvalMessage}</ToolApprovalField>
                      </ToolApprovalPreview>
                    </ToolApprovalBody>
                    <ToolApprovalFooter>
                      <ToolApprovalDeny />
                      <ToolApprovalApprove />
                    </ToolApprovalFooter>
                  </ToolApproval>
                ) : null}
              </AgentRunStep>
            ))}
          </AgentRunPlan>
        </AgentRunBody>
      </AgentRunBlock>
    </div>
  );
}
