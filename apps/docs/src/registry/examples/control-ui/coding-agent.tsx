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
  ScanSearchIcon,
  TelescopeIcon,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import { Activity, ActivityIcon, ActivityRow, ActivityTitle } from "@/components/control-ui/activity";
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
  ChatComposerHeader,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { ModelSwitcher } from "@/components/control-ui/model-switcher";
import { Badge } from "@/components/control-ui/ui/badge";
import { Spinner } from "@/components/control-ui/ui/spinner";

const navigation: readonly CodingAgentNavigationItem[] = [
  { id: "pull-requests", label: "Pull requests", icon: <GitPullRequestIcon /> },
  {
    id: "scheduled",
    label: "Scheduled",
    icon: <Clock3Icon />,
    trailing: (
      <Badge color="blue" size="sm">
        New
      </Badge>
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
            <Spinner size="xs" label="Running" />
          </span>
        ),
      },
      {
        id: "code-diff-defaults",
        title: "Improve code diff defaults",
        trailing: (
          <Badge color="purple" size="sm">
            <GitBranchIcon aria-hidden="true" />
            <span className="sr-only">Branch active</span>
          </Badge>
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
    icon: <TelescopeIcon />,
    prompt: "Map the registry architecture and explain how blocks are installed.",
  },
  {
    id: "build",
    title: "Build a new feature, app, or tool",
    icon: <HammerIcon />,
    prompt: "Build a polished coding-agent workspace from our existing components.",
  },
  {
    id: "review",
    title: "Review code and suggest changes",
    icon: <ScanSearchIcon />,
    prompt: "Review the current branch and suggest focused improvements.",
  },
  {
    id: "fix",
    title: "Fix issues and failures",
    icon: <WrenchIcon />,
    prompt: "Find the failing checks, fix the root cause, and verify the result.",
  },
];

const models = [
  { value: "sonnet", label: "Claude Sonnet" },
  { value: "gpt", label: "GPT" },
];

const initialPrompt = "Thanks to our components, create a block that feels like a focused coding workspace.";

const navigationSummaries: Record<string, string> = {
  "pull-requests": "Three pull requests are waiting for review across control-ui and docs.",
  scheduled: "The nightly registry audit ran at 02:00 and found one outdated manifest.",
  plugins: "Connect GitHub, Linear, or your own tools so the agent can reach them.",
};

export function CodingAgentExample() {
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>("coding-agent-block");
  const [customTaskTitle, setCustomTaskTitle] = useState<string>();
  const [draft, setDraft] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(true);
  const [model, setModel] = useState("sonnet");
  const [activeNavigationId, setActiveNavigationId] = useState<string>();
  const activeNavigation = navigation.find((item) => item.id === activeNavigationId);
  const activeTask = findTask(activeTaskId);
  const activeTaskTitle = activeNavigation?.label ?? customTaskTitle ?? activeTask?.title ?? "New task";

  function startNewTask() {
    setActiveNavigationId(undefined);
    setActiveTaskId(undefined);
    setCustomTaskTitle(undefined);
    setSubmittedPrompt("");
    setIsRunning(false);
  }

  function selectTask(task: CodingAgentTask) {
    setActiveNavigationId(undefined);
    setActiveTaskId(task.id);
    setCustomTaskTitle(undefined);
    setSubmittedPrompt(task.title);
    setIsRunning(task.id === "coding-agent-block");
  }

  function selectNavigation(item: CodingAgentNavigationItem) {
    setActiveNavigationId(item.id);
    setActiveTaskId(undefined);
    setCustomTaskTitle(undefined);
    setSubmittedPrompt("");
    setIsRunning(false);
  }

  function submitPrompt({ value, clear }: { value: string; clear: () => void }) {
    const prompt = value.trim();
    if (!prompt) return;

    setActiveNavigationId(undefined);
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
      <ChatComposerShell>
        <ChatComposerHeader>
          <span className="flex min-w-0 items-center gap-1.5">
            <FolderIcon aria-hidden="true" />
            <span className="truncate">control-ui</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CodeXmlIcon aria-hidden="true" />
            Local
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <GitBranchIcon aria-hidden="true" />
            <span className="truncate">feat/coding-agent-block</span>
          </span>
        </ChatComposerHeader>
        <ChatComposerTextarea placeholder="Do anything" />
        <ChatComposerToolbar>
          <ChatComposerTools>
            <ModelSwitcher models={models} value={model} onValueChange={setModel} size="xs" variant="ghost" />
          </ChatComposerTools>
          <div className="flex min-w-0 items-center gap-1">
            <ChatComposerSubmit size="sm" iconOnly shape="circle" aria-label="Send message" onStop={() => setIsRunning(false)}>
              <ArrowUpIcon />
            </ChatComposerSubmit>
          </div>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );

  let conversation = <CodingAgentEmptyState suggestions={suggestions} onSuggestionSelect={(prompt) => setDraft(prompt)} />;
  if (activeNavigation) {
    conversation = <CodingAgentEmptyState title={activeNavigation.label} description={navigationSummaries[activeNavigation.id]} />;
  } else if (activeTaskId) {
    conversation = <ActiveTask prompt={submittedPrompt} isRunning={isRunning} />;
  }

  return (
    <div className="h-[min(760px,82vh)] min-h-160 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background shadow-md">
      <CodingAgentBlock
        layout="contained"
        persistOpen={false}
        keyboardShortcut={null}
        appName="Workbench"
        navigation={navigation}
        projects={projects}
        activeNavigationId={activeNavigationId}
        activeTaskId={activeTaskId}
        activeTaskTitle={activeTaskTitle}
        onNavigationSelect={selectNavigation}
        onTaskSelect={selectTask}
        onNewTask={startNewTask}
      >
        <CodingAgentConversation composer={composer}>{conversation}</CodingAgentConversation>
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
          <ChatMessageRow>
            <ChatMessageBody className="max-w-[min(85%,38rem)]">
              <ChatMessageContent>{prompt}</ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      </ChatTurn>
      <ChatTurn from="assistant">
        <Activity state={isRunning ? "running" : "success"} className="my-0">
          <ActivityRow>
            <ActivityIcon />
            <ActivityTitle>{isRunning ? "Thinking" : "Ready"}</ActivityTitle>
          </ActivityRow>
        </Activity>
        {!isRunning ? (
          <ChatMessage from="assistant" density="compact">
            <ChatMessageRow>
              <ChatMessageBody className="max-w-full flex-1">
                <ChatMessageContent>The workspace shell is ready. Choose another task or send a follow-up to continue.</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        ) : null}
      </ChatTurn>
    </>
  );
}
