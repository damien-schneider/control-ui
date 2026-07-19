import type { MastraDBMessage } from "@mastra/core/agent/message-list";
import {
  type DynamicToolPart,
  MessageFactory,
  type MessageRoleRendererProps,
  type MessageRoleRenderers,
  type MessageStatusRenderers,
  type ToolInvocationPart,
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
import { ChatThought } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import type { ActivityState, ChatRole } from "@/components/control-ui/contracts";
import { InlineAttachment, InlineAttachmentContent, InlineAttachmentTitle } from "@/components/control-ui/inline-attachment";
import { SourceBadge } from "@/components/control-ui/source-badge";

function renderJson(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function activityState(state?: string): ActivityState {
  if (state === "result" || state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "partial-call" || state === "input-streaming") return "running";
  return "pending";
}

function renderMessage(from: ChatRole, children: ReactNode) {
  return (
    <ChatMessage from={from}>
      <ChatMessageRow>
        <ChatMessageBody>
          <ChatMessageContent>{children}</ChatMessageContent>
        </ChatMessageBody>
      </ChatMessageRow>
    </ChatMessage>
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
            {renderJson(invocation.rawInput ?? invocation.args)}
          </ActivityDetailContent>
        </ActivityDetail>
        {invocation.result !== undefined || invocation.errorText ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent className={state === "error" ? "text-destructive-text" : undefined}>
              {invocation.errorText ?? renderJson(invocation.result)}
            </ActivityDetailContent>
          </ActivityDetail>
        ) : null}
      </ActivityContent>
    </Activity>
  );
}

function renderDynamicTool(part: DynamicToolPart) {
  const state = activityState(part.state);
  const name = part.toolName ?? "tool";
  return (
    <Activity kind="tool" name={name} state={state}>
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
        {part.output !== undefined ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent>{renderJson(part.output)}</ActivityDetailContent>
          </ActivityDetail>
        ) : null}
      </ActivityContent>
    </Activity>
  );
}

const messageRoles = {
  User: ({ children }: MessageRoleRendererProps) => renderMessage("user", children),
  Assistant: ({ children }: MessageRoleRendererProps) => renderMessage("assistant", children),
  System: ({ children }: MessageRoleRendererProps) => renderMessage("system", children),
  Signal: ({ children }: MessageRoleRendererProps) => renderMessage("tool", children),
} satisfies MessageRoleRenderers;

const messageStatus = {
  Tripwire: ({ text }) => <p role="alert">{text}</p>,
  Warning: ({ text }) => <p role="status">{text}</p>,
  Error: ({ text }) => <p role="alert">{text}</p>,
  Pending: ({ children }) => <div aria-busy="true">{children}</div>,
  Task: ({ passed }) => <p role="status">Task {passed ? "completed" : "needs another step"}</p>,
} satisfies MessageStatusRenderers;

export function Example({ message }: { message: MastraDBMessage }) {
  return (
    <MessageFactory
      message={message}
      roles={messageRoles}
      status={messageStatus}
      Text={({ text }) => <span>{text}</span>}
      Reasoning={({ reasoning }) => <ChatThought details={reasoning}>Reasoning</ChatThought>}
      File={(part) => (
        <InlineAttachment name={"filename" in part && typeof part.filename === "string" ? part.filename : "Attachment"}>
          <InlineAttachmentContent>
            <InlineAttachmentTitle />
          </InlineAttachmentContent>
        </InlineAttachment>
      )}
      StepStart={() => <hr />}
      ToolInvocation={renderToolInvocation}
      DynamicTool={renderDynamicTool}
      SourceUrl={({ title, url }) => <SourceBadge href={url}>{title}</SourceBadge>}
      SourceDocument={({ title }) => <span>{title}</span>}
      Data={({ data }) => <pre>{renderJson(data)}</pre>}
      fallback={(part) => <span>Unsupported message part: {part.type}</span>}
    />
  );
}
