import type { BadgeColor } from "@/components/control-ui/ui/badge";
import type { TimelineState } from "@/components/control-ui/ui/timeline";

export type AgentRunStatus = "pending" | "running" | "waiting" | "success" | "error" | "cancelled";

export type AgentRunSummary = { id: string; title: string; status: AgentRunStatus };

export const agentRunStatusLabels = {
  pending: "Queued",
  running: "Running",
  waiting: "Needs approval",
  success: "Done",
  error: "Failed",
  cancelled: "Cancelled",
} satisfies Record<AgentRunStatus, string>;

export const agentRunStatusColors = {
  pending: "neutral",
  running: "blue",
  waiting: "yellow",
  success: "green",
  error: "red",
  cancelled: "neutral",
} satisfies Record<AgentRunStatus, BadgeColor>;

export const agentRunStepLabels = {
  neutral: "Step",
  pending: "Pending",
  running: "Running",
  waiting: "Waiting for approval",
  success: "Done",
  error: "Failed",
} satisfies Record<TimelineState, string>;
