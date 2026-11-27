"use client";

import { ArrowUpIcon, BlocksIcon, Clock3Icon, GitBranchIcon, GitPullRequestIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Activity, ActivityIcon, ActivityRow, ActivityTitle } from "@/components/control-ui/activity";
import {
  CodingAgentBlock,
  CodingAgentConversation,
  CodingAgentEmptyState,
  type CodingAgentNavigationItem,
  type CodingAgentProject,
} from "@/components/control-ui/blocks/coding-agent";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Context } from "@/components/control-ui/context";
import { ModelSwitcher } from "@/components/control-ui/model-switcher";
import type { ToolApprovalState } from "@/components/control-ui/tool-approval";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { Badge } from "@/components/control-ui/ui/badge";
import { Spinner } from "@/components/control-ui/ui/spinner";
import { Text } from "@/components/control-ui/ui/typography";
import { LevelMark } from "./level-mark";
import { contextSegments, contextTokenLimit, WorkspaceTaskList, WorkspaceThread } from "./workspace-thread";

const scriptedTaskId = "coding-workspace";
const branchName = "feat/coding-workspace";

const navigation: readonly CodingAgentNavigationItem[] = [
  {
    id: "pull-requests",
    label: "Pull requests",
    icon: <GitPullRequestIcon />,
    trailing: (
      <Text size="caption" tone="muted" mono numeric>
        3
      </Text>
    ),
  },
  { id: "scheduled", label: "Scheduled", icon: <Clock3Icon /> },
  { id: "plugins", label: "Plugins", icon: <BlocksIcon /> },
];

const projects: readonly CodingAgentProject[] = [
  {
    id: "control-ui",
    name: "control-ui",
    tasks: [
      {
        id: scriptedTaskId,
        title: "Build a coding-agent workspace",
        trailing: (
          <span className="flex items-center">
            <Spinner size="xs" label="Running" />
          </span>
        ),
      },
      { id: "code-diff-defaults", title: "Improve code diff defaults" },
      { id: "tool-states", title: "Unify tool call states" },
      { id: "catalog-tags", title: "Update beta tags" },
    ],
  },
  {
    id: "docs",
    name: "docs",
    tasks: [
      { id: "navigation", title: "Tighten catalog navigation" },
      { id: "examples", title: "Polish component examples" },
    ],
  },
];

const navigationSummaries: Record<string, string> = {
  "pull-requests": "Three pull requests are waiting for review across control-ui and docs.",
  scheduled: "Nothing is scheduled. Recurring tasks you set up are listed here.",
  plugins: "Connect GitHub, Linear, or your own tools so the agent can reach them.",
};

const models = [{ value: "claude-sonnet-4-5" }, { value: "gpt-5" }];

const statusBadges = {
  pending: { color: "yellow", label: "Needs approval" },
  approved: { color: "green", label: "Approved" },
  denied: { color: "neutral", label: "Denied" },
  expired: { color: "neutral", label: "Expired" },
} as const satisfies Record<ToolApprovalState, { color: "yellow" | "green" | "neutral"; label: string }>;

type Prompt = { id: string; text: string };

function taskTitle(taskId: string) {
  return projects.flatMap((project) => project.tasks).find((task) => task.id === taskId)?.title;
}

function PromptTurns({ prompts, waitingLabel }: { prompts: readonly Prompt[]; waitingLabel: string }) {
  if (prompts.length === 0) return null;

  return (
    <>
      {prompts.map((prompt) => (
        <ChatTurn key={prompt.id} from="user">
          <ChatMessage from="user" density="compact">
            <ChatMessageRow>
              <ChatMessageBody className="max-w-[min(85%,38rem)]">
                <ChatMessageContent>{prompt.text}</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        </ChatTurn>
      ))}
      <ChatTurn from="assistant">
        <Activity state="running" className="my-0">
          <ActivityRow>
            <ActivityIcon />
            <ActivityTitle>{waitingLabel}</ActivityTitle>
          </ActivityRow>
        </Activity>
      </ChatTurn>
    </>
  );
}

export function WorkspaceScene() {
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(scriptedTaskId);
  const [activeNavigationId, setActiveNavigationId] = useState<string>();
  const [approval, setApproval] = useState<ToolApprovalState>("pending");
  const [draft, setDraft] = useState("");
  const [model, setModel] = useState(models[0].value);
  const [promptsByView, setPromptsByView] = useState<Record<string, readonly Prompt[]>>({});

  const viewId = activeNavigationId ?? activeTaskId ?? "new-task";
  const prompts = promptsByView[viewId] ?? [];
  const activeNavigation = navigation.find((item) => item.id === activeNavigationId);
  const isScriptedTask = !activeNavigation && activeTaskId === scriptedTaskId;
  const status = statusBadges[approval];

  function submitPrompt({ value, clear }: { value: string; clear: () => void }) {
    const text = value.trim();
    if (!text) return;
    setPromptsByView((current) => ({ ...current, [viewId]: [...(current[viewId] ?? []), { id: crypto.randomUUID(), text }] }));
    clear();
  }

  const composer = (
    <div className="grid min-w-0 gap-2">
      {isScriptedTask ? (
        <LevelMark level={2} label="TaskList" shape="pill" className="mt-7 w-fit max-w-full">
          <WorkspaceTaskList finished={approval === "approved"} />
        </LevelMark>
      ) : null}
      <ChatComposer density="compact" value={draft} onValueChange={setDraft} onSubmit={submitPrompt}>
        <ChatComposerShell>
          <ChatComposerTextarea placeholder="Do anything" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <ModelSwitcher models={models} value={model} onValueChange={setModel} size="xs" variant="ghost" />
            </ChatComposerTools>
            <div className="flex min-w-0 items-center gap-2">
              <Context segments={contextSegments} maxTokens={contextTokenLimit} model={model} locale="en-US" />
              <ChatComposerSubmit size="sm" iconOnly shape="circle" aria-label="Send message">
                <ArrowUpIcon />
              </ChatComposerSubmit>
            </div>
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>
    </div>
  );

  let conversation: ReactNode;
  if (isScriptedTask) {
    conversation = (
      <>
        <WorkspaceThread approval={approval} onApprovalChange={setApproval} model={model} branchName={branchName} />
        <PromptTurns prompts={prompts} waitingLabel={approval === "pending" ? "Waiting for your approval" : "Thinking"} />
      </>
    );
  } else if (prompts.length > 0) {
    conversation = <PromptTurns prompts={prompts} waitingLabel="Thinking" />;
  } else if (activeNavigation) {
    conversation = <CodingAgentEmptyState title={activeNavigation.label} description={navigationSummaries[activeNavigation.id]} />;
  } else if (activeTaskId) {
    conversation = (
      <CodingAgentEmptyState title={taskTitle(activeTaskId)} description="This task has no run yet. Send a prompt to start one." />
    );
  } else {
    conversation = <CodingAgentEmptyState />;
  }

  return (
    <CodingAgentBlock
      layout="contained"
      persistOpen={false}
      keyboardShortcut={null}
      appName="Workbench"
      navigation={navigation}
      projects={projects}
      activeNavigationId={activeNavigationId}
      activeTaskId={activeTaskId}
      activeTaskTitle={activeNavigation?.label ?? (activeTaskId ? taskTitle(activeTaskId) : undefined)}
      onNavigationSelect={(item) => setActiveNavigationId(item.id)}
      onTaskSelect={(task) => {
        setActiveNavigationId(undefined);
        setActiveTaskId(task.id);
      }}
      onNewTask={() => {
        setActiveNavigationId(undefined);
        setActiveTaskId(undefined);
      }}
      headerActions={
        isScriptedTask ? (
          <>
            <Badge color={status.color} size="sm">
              {status.label}
            </Badge>
            <span className="ms-2 hidden items-center gap-1.5 text-muted-foreground @2xl/workspace:flex">
              <GitBranchIcon aria-hidden="true" className="size-3.5" />
              <Text size="caption" mono className="whitespace-nowrap">
                {branchName}
              </Text>
            </span>
          </>
        ) : null
      }
      sidebarFooter={
        <div className="flex min-w-0 items-center gap-2 px-1 py-1">
          <Avatar size="xs" aria-hidden="true">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Text size="label" className="truncate">
            Ada Okafor
          </Text>
        </div>
      }
      className="@container/workspace"
    >
      <CodingAgentConversation composer={composer}>{conversation}</CodingAgentConversation>
    </CodingAgentBlock>
  );
}
