"use client";

import { BookOpenIcon, GitPullRequestArrowIcon, SquareTerminalIcon } from "lucide-react";
import { Activity, ActivityContent, ActivityStatus, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Context, ContextGraph, ContextLegend, ContextSummary } from "@/components/control-ui/context";
import type { ContextSegment } from "@/components/control-ui/context-model";
import { TaskList, TaskListContent, TaskListItem, TaskListTrigger } from "@/components/control-ui/task-list";
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
  type ToolApprovalState,
  ToolApprovalStatus,
  ToolApprovalTitle,
} from "@/components/control-ui/tool-approval";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/control-ui/ui/card";
import {
  Timeline,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/control-ui/ui/timeline";
import { Text } from "@/components/control-ui/ui/typography";
import { LevelMark } from "./level-mark";

export const contextTokenLimit = 200_000;

export const contextSegments = [
  { id: "system", label: "System prompt", tokens: 12_000, kind: "system" },
  { id: "tools", label: "Tools", tokens: 18_000, kind: "tool" },
  { id: "messages", label: "Messages", tokens: 52_000, kind: "message" },
  { id: "sources", label: "Sources", tokens: 8_000, kind: "source" },
  { id: "reasoning", label: "Reasoning", tokens: 10_000, kind: "reasoning" },
] satisfies ContextSegment[];

const activitySteps = [
  { id: "sidebar", icon: <BookOpenIcon />, label: "Read sidebar.tsx" },
  { id: "chat-layout", icon: <BookOpenIcon />, label: "Read chat-layout.tsx" },
  { id: "validate", icon: <SquareTerminalIcon />, label: "Ran the registry validation command" },
];

const planSteps = ["Read the sidebar and chat layout", "Compose the workspace shell", "Add the approval card", "Validate the registry"];
const finalStep = "Open pull request";

export function WorkspaceTaskList({ finished }: { finished: boolean }) {
  return (
    <TaskList>
      <TaskListTrigger />
      <TaskListContent>
        {planSteps.map((label) => (
          <TaskListItem key={label} label={label} status="completed" />
        ))}
        <TaskListItem label={finalStep} status={finished ? "completed" : "active"} />
      </TaskListContent>
    </TaskList>
  );
}

export function WorkspaceThread({
  approval,
  onApprovalChange,
  model,
  branchName,
}: {
  approval: ToolApprovalState;
  onApprovalChange: (state: ToolApprovalState) => void;
  model: string;
  branchName: string;
}) {
  return (
    <>
      <ChatTurn from="user">
        <ChatMessage from="user" density="compact">
          <ChatMessageRow>
            <ChatMessageBody className="max-w-[min(85%,26rem)]">
              <ChatMessageContent>Thanks to our components, create a block that feels like a focused coding workspace.</ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      </ChatTurn>
      <ChatTurn from="assistant">
        <Activity state="success" defaultOpen className="my-0">
          <ActivityTrigger>
            <ActivityTitle>Read 2 files, ran 1 command</ActivityTitle>
            <ActivityStatus>38s</ActivityStatus>
          </ActivityTrigger>
          <ActivityContent>
            <Timeline>
              {activitySteps.map((step) => (
                <TimelineItem key={step.id} state="success">
                  <TimelineIndicator>{step.icon}</TimelineIndicator>
                  <TimelineSeparator />
                  <TimelineContent>
                    <TimelineTitle>{step.label}</TimelineTitle>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </ActivityContent>
        </Activity>
        <div className="mt-9 grid w-full min-w-0 items-end gap-x-6 gap-y-9 @3xl/workspace:grid-cols-[minmax(0,1fr)_18.5rem]">
          <div className="grid min-w-0 justify-items-start gap-2">
            <LevelMark level={2} label="ToolApproval" shape="card" className="w-full">
              <ToolApproval
                state={approval}
                risk="medium"
                onApprove={() => onApprovalChange("approved")}
                onDeny={() => onApprovalChange("denied")}
              >
                <ToolApprovalBody>
                  <ToolApprovalHeader>
                    <ToolApprovalIcon>
                      <GitPullRequestArrowIcon />
                    </ToolApprovalIcon>
                    <ToolApprovalTitle>Push to origin</ToolApprovalTitle>
                    <ToolApprovalRisk />
                    <ToolApprovalStatus />
                  </ToolApprovalHeader>
                  <ToolApprovalDescription>Pushes 4 commits and opens a pull request.</ToolApprovalDescription>
                  <ToolApprovalPreview>
                    <ToolApprovalField label="Tool">git.push</ToolApprovalField>
                    <ToolApprovalField label="Branch">{branchName}</ToolApprovalField>
                    <ToolApprovalField label="Commits">4 commits, 12 files</ToolApprovalField>
                  </ToolApprovalPreview>
                </ToolApprovalBody>
                <ToolApprovalFooter>
                  <ToolApprovalDeny />
                  <LevelMark level={3} label="Button" shape="control">
                    <ToolApprovalApprove />
                  </LevelMark>
                </ToolApprovalFooter>
              </ToolApproval>
            </LevelMark>
            {approval === "pending" ? null : (
              <Button variant="quiet" size="xs" onClick={() => onApprovalChange("pending")}>
                Ask again
              </Button>
            )}
          </div>
          <LevelMark level={2} label="Context" shape="card" className="hidden @3xl/workspace:block">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Context</CardTitle>
                <CardAction>
                  <Text size="caption" tone="muted" mono>
                    {model}
                  </Text>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Context
                  segments={contextSegments}
                  maxTokens={contextTokenLimit}
                  model={model}
                  locale="en-US"
                  className="grid w-full gap-3.5"
                >
                  <ContextSummary />
                  <ContextGraph />
                  <ContextLegend />
                </Context>
              </CardContent>
            </Card>
          </LevelMark>
        </div>
      </ChatTurn>
    </>
  );
}
