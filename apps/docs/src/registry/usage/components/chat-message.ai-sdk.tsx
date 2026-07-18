import { type DynamicToolUIPart, getToolName, isDataUIPart, isDynamicToolUIPart, isToolUIPart, type ToolUIPart, type UIMessage } from "ai";

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
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { ChatThought } from "@/components/control-ui/chat-scene";
import type { ActivityState } from "@/components/control-ui/contracts";
import { InlineAttachment, InlineAttachmentContent, InlineAttachmentTitle } from "@/components/control-ui/inline-attachment";
import { SourceBadge } from "@/components/control-ui/source-badge";

function renderJson(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function activityState(state: ToolUIPart["state"] | DynamicToolUIPart["state"]): ActivityState {
  if (state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "input-streaming") return "running";
  return "pending";
}

function renderTool(part: ToolUIPart | DynamicToolUIPart, key: string) {
  const state = activityState(part.state);
  return (
    <Activity key={key} kind="tool" name={getToolName(part)} state={state}>
      <ActivityTrigger>
        <ActivityIcon />
        <ActivityTitle />
        <ActivityStatus className="sr-only" />
      </ActivityTrigger>
      <ActivityContent>
        {part.input !== undefined ? (
          <ActivityDetail>
            <ActivityDetailLabel>Input</ActivityDetailLabel>
            <ActivityDetailContent className="font-mono text-caption">{renderJson(part.input)}</ActivityDetailContent>
          </ActivityDetail>
        ) : null}
        {part.output !== undefined || part.errorText ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent className={state === "error" ? "text-destructive-text" : undefined}>
              {part.errorText ?? renderJson(part.output)}
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

function renderPart(part: UIMessage["parts"][number]) {
  const key = partKey(part);

  if (isToolUIPart(part) || isDynamicToolUIPart(part)) return renderTool(part, key);
  if (isDataUIPart(part)) return <pre key={key}>{renderJson(part.data)}</pre>;

  switch (part.type) {
    case "text":
      return <span key={key}>{part.text}</span>;
    case "reasoning":
      return (
        <ChatThought key={key} details={part.text}>
          Reasoning
        </ChatThought>
      );
    case "file":
      return (
        <InlineAttachment key={key} name={part.filename ?? "Attachment"}>
          <InlineAttachmentContent>
            <InlineAttachmentTitle />
          </InlineAttachmentContent>
        </InlineAttachment>
      );
    case "source-url":
      return (
        <SourceBadge key={key} href={part.url}>
          {part.title}
        </SourceBadge>
      );
    case "source-document":
      return <span key={key}>{part.title}</span>;
    case "step-start":
      return <hr key={key} />;
    case "reasoning-file":
      return (
        <a key={key} href={part.url}>
          Reasoning file
        </a>
      );
    case "custom":
      return <span key={key}>Custom provider content: {part.kind}</span>;
    default:
      return null;
  }
}

export function Example({ message }: { message: UIMessage }) {
  return (
    <ChatMessage from={message.role}>
      <ChatMessageRow>
        <ChatMessageBody>
          <ChatMessageContent>{message.parts.map(renderPart)}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
  );
}
