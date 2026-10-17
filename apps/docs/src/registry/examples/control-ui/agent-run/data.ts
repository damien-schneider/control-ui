import type { ActivityState } from "@/components/control-ui/activity";
import type { AgentRunSummary } from "@/components/control-ui/blocks/agent-run";
import type { TimelineState } from "@/components/control-ui/ui/timeline";

export const RUN_ELAPSED_AT_OPEN_MS = 102_000;

export const demoRuns: readonly AgentRunSummary[] = [
  { id: "churn-report", title: "Weekly churn report", status: "waiting" },
  { id: "release-notes", title: "Draft release notes", status: "success" },
  { id: "crm-sync", title: "Sync CRM contacts", status: "error" },
  { id: "branch-cleanup", title: "Clean up stale branches", status: "cancelled" },
];

export type DemoToolCall = {
  id: string;
  name: string;
  summary: string;
  state: ActivityState;
  start: number;
  end?: number;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type DemoStep = {
  id: string;
  title: string;
  detail: string;
  state: TimelineState;
  start?: number;
  end?: number;
  tools: DemoToolCall[];
};

export const initialSteps: readonly DemoStep[] = [
  {
    id: "collect",
    title: "Collect last week's cancellations",
    detail: "Billing export for Oct 5–11",
    state: "success",
    start: 0,
    end: 9_000,
    tools: [
      {
        id: "billing-export",
        name: "billing.export",
        summary: "212 cancellations",
        state: "success",
        start: 400,
        end: 3_600,
        input: { from: "2026-10-05", to: "2026-10-11", event: "subscription.cancelled" },
        output: { rows: 212 },
      },
      {
        id: "warehouse-query",
        name: "warehouse.query",
        summary: "Plan mix of churned accounts",
        state: "success",
        start: 3_900,
        end: 8_700,
        input: "select plan, count(*) from churned_accounts group by plan",
        output: { starter: 131, team: 64, business: 17 },
      },
    ],
  },
  {
    id: "compare",
    title: "Compare with the previous four weeks",
    detail: "Trend by plan and region",
    state: "success",
    start: 9_000,
    end: 31_000,
    tools: [
      {
        id: "notebook-run",
        name: "notebook.run",
        summary: "churn-trend.ipynb",
        state: "success",
        start: 9_400,
        end: 30_200,
        input: { notebook: "churn-trend.ipynb", weeks: 5 },
        output: { churnRate: "3.1%", change: "+0.4 pt" },
      },
    ],
  },
  {
    id: "draft",
    title: "Draft the summary",
    detail: "Headline, drivers and next steps",
    state: "success",
    start: 31_000,
    end: 74_000,
    tools: [
      {
        id: "docs-write",
        name: "docs.write",
        summary: "Rewrote the headline paragraph",
        state: "success",
        start: 31_500,
        end: 73_400,
      },
    ],
  },
  {
    id: "post",
    title: "Post the summary to #revenue",
    detail: "Needs your approval",
    state: "waiting",
    start: 74_000,
    tools: [
      {
        id: "slack-post",
        name: "slack.post",
        summary: "#revenue",
        state: "waiting",
        start: 74_200,
        input: { channel: "#revenue", mention: "@finance-leads" },
      },
    ],
  },
  {
    id: "archive",
    title: "Archive the inputs",
    detail: "Move the exports to cold storage",
    state: "pending",
    tools: [],
  },
];

export const draftBefore =
  "## Weekly churn\n\nChurn held at 2.7% last week.\nStarter plans churned at the usual rate.\n\nNext: keep watching annual renewals.\n";

export const draftAfter =
  "## Weekly churn\n\nChurn rose 0.4 pt to 3.1% last week.\nMonthly Starter plans in EMEA drove most of the increase.\n\nNext: survey cancelled Starter accounts and review EMEA pricing.\n";

export const approvalMessage = "Churn rose 0.4 pt to 3.1% last week, driven by monthly Starter plans in EMEA.";
