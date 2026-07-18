"use client";

import { useChat } from "@ai-sdk/react";
import { type DynamicToolUIPart, getToolName, isDynamicToolUIPart, isToolUIPart, type ToolUIPart, type UIMessage } from "ai";
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

function activityState(state: ToolUIPart["state"] | DynamicToolUIPart["state"]): ActivityState {
  if (state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "input-streaming") return "running";
  return "pending";
}

function renderToolPart(part: ToolUIPart | DynamicToolUIPart) {
  const state = activityState(part.state);
  return (
    <Activity kind="tool" name={getToolName(part)} state={state}>
      <ActivityTrigger>
        <ActivityIcon />
        <ActivityTitle />
        <ActivityStatus className="sr-only" />
      </ActivityTrigger>
      <ActivityContent>
        {part.input !== undefined ? (
          <ActivityDetail>
            <ActivityDetailLabel>Input</ActivityDetailLabel>
            <ActivityDetailContent className="font-mono text-caption">{JSON.stringify(part.input, null, 2)}</ActivityDetailContent>
          </ActivityDetail>
        ) : null}
        {part.output !== undefined || part.errorText ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent className={state === "error" ? "text-destructive-text" : undefined}>
              {part.errorText ?? JSON.stringify(part.output, null, 2)}
            </ActivityDetailContent>
          </ActivityDetail>
        ) : null}
      </ActivityContent>
    </Activity>
  );
}

function partKey(part: UIMessage["parts"][number]) {
  if ("toolCallId" in part) return part.toolCallId;
  if ("sourceId" in part) return part.sourceId;
  if ("id" in part && typeof part.id === "string") return part.id;
  if ("url" in part && typeof part.url === "string") return `${part.type}-${part.url}`;
  if ("text" in part && typeof part.text === "string") return `${part.type}-${part.text}`;
  return `${part.type}-${JSON.stringify(part)}`;
}

function AiSdkMessage({ message }: { message: UIMessage }) {
  if (message.role === "system") return null;

  return (
    <ChatTurn from={message.role}>
      <ChatMessage from={message.role}>
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageContent>
              {message.parts.map((part) => {
                const key = partKey(part);

                if (isToolUIPart(part) || isDynamicToolUIPart(part)) {
                  return <div key={key}>{renderToolPart(part)}</div>;
                }
                if (part.type === "reasoning") {
                  return (
                    <ChatThought key={key} details={part.text}>
                      Reasoning
                    </ChatThought>
                  );
                }
                if (part.type === "source-url") {
                  return (
                    <SourceBadge key={key} href={part.url}>
                      {part.title}
                    </SourceBadge>
                  );
                }
                if (part.type === "source-document") return <span key={key}>{part.title}</span>;
                if (part.type === "text") return <span key={key}>{part.text}</span>;
                return <span key={key}>Unsupported message part: {part.type}</span>;
              })}
            </ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </ChatTurn>
  );
}

export function ChatSurface() {
  const { messages, sendMessage, status, stop } = useChat();
  const isRunning = status === "submitted" || status === "streaming";

  const composer = (
    <ChatInput
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ text: value });
        clear();
      }}
    >
      <ChatInputShell>
        <ChatInputTextarea placeholder="Ask the model..." />
        <ChatInputToolbar>
          <ChatInputTools>AI SDK</ChatInputTools>
          {isRunning ? (
            <Button type="button" size="xs" variant="quiet" onClick={stop}>
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
        <AiSdkMessage key={message.id} message={message} />
      ))}
    </ChatBlock>
  );
}
