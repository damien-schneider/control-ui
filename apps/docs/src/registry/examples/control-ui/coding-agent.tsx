"use client";

import {
  ArrowUpIcon,
  BlocksIcon,
  Clock3Icon,
  CodeXmlIcon,
  FolderIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  HammerIcon,
  LoaderCircleIcon,
  MicIcon,
  PanelRightIcon,
  PlusIcon,
  ScanSearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TelescopeIcon,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import { Activity, ActivityIcon, ActivityRow, ActivityStatus, ActivityTitle } from "@/components/control-ui/activity";
import {
  CodingAgentBlock,
  CodingAgentConversation,
  CodingAgentEmptyState,
  type CodingAgentNavigationItem,
  type CodingAgentProject,
  type CodingAgentSuggestion,
  type CodingAgentTask,
} from "@/components/control-ui/blocks/coding-agent";
import {
  ChatComposer,
  ChatComposerAccent,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { ModelSwitcher } from "@/components/control-ui/model-switcher";
import { Button } from "@/components/control-ui/ui/button";

const navigation: readonly CodingAgentNavigationItem[] = [
  { id: "pull-requests", label: "Pull requests", icon: <GitPullRequestIcon /> },
  {
    id: "scheduled",
    label: "Scheduled",
    icon: <Clock3Icon />,
    trailing: (
      <span className="flex items-center">
        <span className="size-1.5 rounded-full bg-[oklch(0.72_0.14_240)]" aria-hidden="true" />
        <span className="sr-only">New activity</span>
      </span>
    ),
  },
  { id: "plugins", label: "Plugins", icon: <BlocksIcon /> },
];

const projects: readonly CodingAgentProject[] = [
  {
    id: "control-ui",
    name: "control-ui",
    tasks: [
      {
        id: "coding-agent-block",
        title: "Build a coding-agent workspace",
        trailing: (
          <span className="flex items-center">
            <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Running</span>
          </span>
        ),
      },
      {
        id: "code-diff-defaults",
        title: "Improve code diff defaults",
        trailing: (
          <span className="flex items-center">
            <GitBranchIcon className="size-3.5 text-[oklch(0.68_0.16_300)]" aria-hidden="true" />
            <span className="sr-only">Branch active</span>
          </span>
        ),
      },
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

const suggestions: readonly CodingAgentSuggestion[] = [
  {
    id: "explore",
    title: "Explore and understand code",
    icon: <TelescopeIcon className="size-4" />,
    prompt: "Map the registry architecture and explain how blocks are installed.",
  },
  {
    id: "build",
    title: "Build a new feature, app, or tool",
    icon: <HammerIcon className="size-4" />,
    prompt: "Build a polished coding-agent workspace from our existing components.",
  },
  {
    id: "review",
    title: "Review code and suggest changes",
    icon: <ScanSearchIcon className="size-4" />,
    prompt: "Review the current branch and suggest focused improvements.",
  },
  {
    id: "fix",
    title: "Fix issues and failures",
    icon: <WrenchIcon className="size-4" />,
    prompt: "Find the failing checks, fix the root cause, and verify the result.",
  },
];

const models = [
  { value: "high", label: "Reasoning", hint: "High" },
  { value: "balanced", label: "Reasoning", hint: "Balanced" },
];

const initialPrompt = "Thanks to our components, create a block that feels like a focused coding workspace.";

export function CodingAgentExample() {
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>("coding-agent-block");
  const [customTaskTitle, setCustomTaskTitle] = useState<string>();
  const [draft, setDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(true);
  const [model, setModel] = useState("high");
  const activeTask = findTask(activeTaskId);
  const activeTaskTitle = customTaskTitle ?? activeTask?.title ?? "New task";

  function startNewTask() {
    setActiveTaskId(undefined);
    setCustomTaskTitle(undefined);
    setSubmittedPrompt("");
    setIsRunning(false);
  }

  function selectTask(task: CodingAgentTask) {
    setActiveTaskId(task.id);
    setCustomTaskTitle(undefined);
    setSubmittedPrompt(task.title);
    setIsRunning(task.id === "coding-agent-block");
  }

  function submitPrompt({ value, clear }: { value: string; clear: () => void }) {
    const prompt = value.trim();
    if (!prompt) return;

    if (!activeTaskId) {
      setActiveTaskId("local-task");
      setCustomTaskTitle(prompt);
    }
    setSubmittedPrompt(prompt);
    setIsRunning(true);
    clear();
  }

  const composer = (
    <ChatComposer
      density="compact"
      state={isRunning ? "submitting" : "idle"}
      value={draft}
      onValueChange={setDraft}
      onSubmit={submitPrompt}
    >
      <ChatComposerShell className="bg-card">
        <ChatComposerAccent />
        <div className="flex min-w-0 items-center gap-3 border-b border-border/60 px-3 py-2 text-caption text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <FolderIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">control-ui</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CodeXmlIcon className="size-3.5" aria-hidden="true" />
            Local
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <GitBranchIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">feat/coding-agent-block</span>
          </span>
        </div>
        <ChatComposerTextarea className="min-h-18" placeholder="Do anything" />
        <ChatComposerToolbar>
          <ChatComposerTools>
            <Button variant="ghost" size="sm" iconOnly aria-label="Attach context">
              <PlusIcon className="size-4" />
            </Button>
            <Button variant="quiet" size="xs">
              <ShieldCheckIcon className="size-3.5" />
              <span className="hidden sm:inline">Approve for me</span>
            </Button>
          </ChatComposerTools>
          <div className="flex min-w-0 items-center gap-1">
            <ModelSwitcher models={models} value={model} onValueChange={setModel} size="xs" variant="ghost" />
            <Button variant="ghost" size="sm" iconOnly aria-label="Use microphone">
              <MicIcon className="size-3.5" />
            </Button>
            {isRunning ? (
              <Button variant="solid" size="sm" iconOnly shape="circle" aria-label="Stop response" onClick={() => setIsRunning(false)}>
                <span className="size-2 rounded-[2px] bg-current" />
              </Button>
            ) : (
              <ChatComposerSubmit size="sm" iconOnly shape="circle" aria-label="Send message">
                <ArrowUpIcon className="size-4" />
              </ChatComposerSubmit>
            )}
          </div>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );

  return (
    <div className="h-[min(760px,82vh)] min-h-160 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background shadow-md">
      <CodingAgentBlock
        layout="contained"
        appName="Workbench"
        navigation={navigation}
        projects={projects}
        activeTaskId={activeTaskId}
        activeTaskTitle={activeTaskTitle}
        onTaskSelect={selectTask}
        onNewTask={startNewTask}
        headerActions={
          <>
            <Button variant="surface" size="xs" className="hidden sm:inline-flex">
              Open in
              <SlidersHorizontalIcon className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" iconOnly aria-label="Toggle details panel">
              <PanelRightIcon className="size-3.5" />
            </Button>
          </>
        }
        sidebarFooter={
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <span className="flex size-5 items-center justify-center rounded-full bg-[oklch(0.72_0.16_70)] text-[10px] font-semibold text-[oklch(0.2_0.02_70)]">
              DS
            </span>
            <span className="truncate">damien</span>
          </Button>
        }
      >
        <CodingAgentConversation composer={composer}>
          {activeTaskId ? (
            <ActiveTask prompt={submittedPrompt} isRunning={isRunning} />
          ) : (
            <CodingAgentEmptyState suggestions={suggestions} onSuggestionSelect={(prompt) => setDraft(prompt)} />
          )}
        </CodingAgentConversation>
      </CodingAgentBlock>
    </div>
  );
}

function findTask(taskId: string | undefined) {
  if (!taskId) return undefined;
  return projects.flatMap((project) => project.tasks).find((task) => task.id === taskId);
}

function ActiveTask({ prompt, isRunning }: { prompt: string; isRunning: boolean }) {
  return (
    <>
      <ChatTurn from="user">
        <ChatMessage from="user" density="compact">
          <ChatMessageRow className="py-0">
            <ChatMessageBody className="max-w-[min(85%,38rem)]">
              <ChatMessageContent className="bg-foreground/8 text-sm leading-6 text-foreground ring-1 ring-foreground/8">
                {prompt}
              </ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      </ChatTurn>
      <ChatTurn from="assistant">
        <Activity state={isRunning ? "running" : "success"} className="my-0">
          <ActivityRow className="px-0">
            <ActivityIcon />
            <ActivityTitle>{isRunning ? "Thinking" : "Ready"}</ActivityTitle>
            <ActivityStatus className="sr-only" />
          </ActivityRow>
        </Activity>
        {!isRunning ? (
          <ChatMessage from="assistant" density="compact">
            <ChatMessageRow className="py-0">
              <ChatMessageBody className="max-w-full flex-1">
                <ChatMessageContent className="text-sm leading-7">
                  The workspace shell is ready. Choose another task or send a follow-up to continue.
                </ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        ) : null}
      </ChatTurn>
    </>
  );
}
