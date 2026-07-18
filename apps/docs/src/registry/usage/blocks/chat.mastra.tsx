"use client";

import {
  MastraReactProvider,
  MessageFactory,
  type MessageRoleRendererProps,
  type MessageRoleRenderers,
  type ToolInvocationPart,
  useChat,
} from "@mastra/react";
import type { ReactNode } from "react";

import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import { ChatBlock } from "@/components/control-ui/blocks/chat";
import {
  ChatInput,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { ChatThought, ChatTurn } from "@/components/control-ui/chat-scene";
import type { ActivityState } from "@/components/control-ui/contracts";
import { SourceBadge } from "@/components/control-ui/source-badge";
import { Button } from "@/components/control-ui/ui/button";

function activityState(state: string): ActivityState {
  if (state === "result" || state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "partial-call" || state === "input-streaming") return "running";
  return "pending";
}

function renderTurn(from: "user" | "assistant", children: ReactNode) {
  return (
    <ChatTurn from={from}>
      <ChatMessage from={from}>
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageContent>{children}</ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </ChatTurn>
  );
}

function renderToolInvocation(part: ToolInvocationPart) {
  const invocation = part.toolInvocation;
  const state = activityState(invocation.state);

  return (
    <Activity kind="tool" name={invocation.toolName} state={state}>
      <ActivityTrigger>
        <ActivityIcon />
        <ActivityTitle />
        <ActivityStatus className="sr-only" />
      </ActivityTrigger>
      <ActivityContent>
        <ActivityDetail>
          <ActivityDetailLabel>Input</ActivityDetailLabel>
          <ActivityDetailContent className="font-mono text-caption">
            {JSON.stringify(invocation.rawInput ?? invocation.args, null, 2)}
          </ActivityDetailContent>
        </ActivityDetail>
        {invocation.result !== undefined || invocation.errorText ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent className={state === "error" ? "text-destructive-text" : undefined}>
              {invocation.errorText ?? JSON.stringify(invocation.result, null, 2)}
            </ActivityDetailContent>
          </ActivityDetail>
        ) : null}
      </ActivityContent>
    </Activity>
  );
}

const messageRoles = {
  User: ({ children }: MessageRoleRendererProps) => renderTurn("user", children),
  Assistant: ({ children }: MessageRoleRendererProps) => renderTurn("assistant", children),
  System: () => null,
  Signal: ({ children }: MessageRoleRendererProps) => renderTurn("assistant", children),
} satisfies MessageRoleRenderers;

function MastraChat({ agentId }: { agentId: string }) {
  const { cancelRun, isRunning, messages, sendMessage } = useChat({ agentId });

  const composer = (
    <ChatInput
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ message: value });
        clear();
      }}
    >
      <ChatInputShell>
        <ChatInputTextarea placeholder="Ask the agent..." />
        <ChatInputToolbar>
          <ChatInputTools>Mastra agent</ChatInputTools>
          {isRunning ? (
            <Button type="button" size="xs" variant="quiet" onClick={cancelRun}>
              Stop
            </Button>
          ) : (
            <ChatInputSubmit>Send</ChatInputSubmit>
          )}
        </ChatInputToolbar>
      </ChatInputShell>
    </ChatInput>
  );

  return (
    <ChatBlock composer={composer}>
      {messages.map((message) => (
        <MessageFactory
          key={message.id}
          message={message}
          roles={messageRoles}
          Text={({ text }) => <span>{text}</span>}
          Reasoning={({ reasoning }) => <ChatThought details={reasoning}>Reasoning</ChatThought>}
          ToolInvocation={renderToolInvocation}
          SourceUrl={({ title, url }) => <SourceBadge href={url}>{title}</SourceBadge>}
          SourceDocument={({ title }) => <span>{title}</span>}
          fallback={(part) => <span>Unsupported message part: {part.type}</span>}
        />
      ))}
    </ChatBlock>
  );
}

export function ChatSurface({ agentId, baseUrl }: { agentId: string; baseUrl: string }) {
  return (
    <MastraReactProvider baseUrl={baseUrl}>
      <MastraChat agentId={agentId} />
    </MastraReactProvider>
  );
}
