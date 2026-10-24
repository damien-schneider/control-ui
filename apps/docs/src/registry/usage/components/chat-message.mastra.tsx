import type { MastraDBMessage } from "@mastra/core/agent/message-list";
import {
  type DynamicToolPart,
  type FilePart,
  MessageFactory,
  type MessageRoleRendererProps,
  type MessageRoleRenderers,
  type MessageStatusRenderers,
  type ToolInvocationPart,
} from "@mastra/react";
import type { ReactNode } from "react";
import type { ActivityState } from "@/components/control-ui/activity";
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
import type { ChatRole } from "@/components/control-ui/hooks/use-chat-message";
import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";
import { SourceBadge } from "@/components/control-ui/source-badge";
import { Text } from "@/components/control-ui/ui/typography";

function renderJson(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function activityState(state?: string): ActivityState {
  if (state === "result" || state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "approval-requested") return "waiting";
  if (state === "partial-call" || state === "input-streaming" || state === "call" || state === "approval-responded") return "running";
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

function isImageMediaType(mimeType: string) {
  return mimeType === "image" || mimeType.startsWith("image/");
}

// Mastra file parts carry base64 in `data`; a provider that already hands back a data URL passes straight through.
function fileSrc({ mimeType, data }: FilePart) {
  return data.startsWith("data:") ? data : `data:${mimeType};base64,${data}`;
}

function renderFile(part: FilePart) {
  const name = "filename" in part && typeof part.filename === "string" ? part.filename : "Attachment";
  return (
    <InlineAttachment name={name}>
      {isImageMediaType(part.mimeType) ? <InlineAttachmentMedia src={fileSrc(part)} alt={name} /> : null}
      <InlineAttachmentContent>
        <InlineAttachmentTitle />
      </InlineAttachmentContent>
    </InlineAttachment>
  );
}

function pendingApprovalIds(metadata: Record<string, unknown> | undefined) {
  const requests = metadata?.requireApprovalMetadata;
  if (typeof requests !== "object" || requests === null) return [];
  return Object.values(requests).flatMap((request: unknown) =>
    typeof request === "object" && request !== null && "toolCallId" in request && typeof request.toolCallId === "string"
      ? [request.toolCallId]
      : [],
  );
}

function renderToolInvocation(part: ToolInvocationPart, pendingApprovals: readonly string[]) {
  const invocation = part.toolInvocation;
  const awaitsApproval = invocation.state === "call" && pendingApprovals.includes(invocation.toolCallId);
  const state = awaitsApproval ? "waiting" : activityState(invocation.state);

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
          <ActivityDetailContent format="code">{renderJson(invocation.rawInput ?? invocation.args)}</ActivityDetailContent>
        </ActivityDetail>
        {invocation.result !== undefined || invocation.errorText ? (
          <ActivityDetail>
            <ActivityDetailLabel>Output</ActivityDetailLabel>
            <ActivityDetailContent tone={state === "error" ? "destructive" : "default"}>
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
            <ActivityDetailContent format="code">{renderJson(part.input)}</ActivityDetailContent>
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
  Tripwire: ({ text }) => (
    <Text as="p" role="alert">
      {text}
    </Text>
  ),
  Warning: ({ text }) => (
    <Text as="p" role="status">
      {text}
    </Text>
  ),
  Error: ({ text }) => (
    <Text as="p" role="alert">
      {text}
    </Text>
  ),
  Pending: ({ children }) => <div aria-busy="true">{children}</div>,
  Task: ({ passed }) => (
    <Text as="p" role="status">
      Task {passed ? "completed" : "needs another step"}
    </Text>
  ),
} satisfies MessageStatusRenderers;

export function Example({ message }: { message: MastraDBMessage }) {
  const pendingApprovals = pendingApprovalIds(message.content.metadata);
  return (
    <MessageFactory
      message={message}
      roles={messageRoles}
      status={messageStatus}
      Text={({ text }) => <span>{text}</span>}
      Reasoning={({ reasoning, state }) => (
        <Activity kind="reasoning" state={state === "streaming" ? "running" : "success"}>
          <ActivityTrigger>
            <ActivityIcon />
            <ActivityTitle>Reasoning</ActivityTitle>
          </ActivityTrigger>
          <ActivityContent>{reasoning}</ActivityContent>
        </Activity>
      )}
      File={renderFile}
      StepStart={() => <hr />}
      ToolInvocation={(part) => renderToolInvocation(part, pendingApprovals)}
      DynamicTool={renderDynamicTool}
      SourceUrl={({ title, url }) => <SourceBadge href={url}>{title}</SourceBadge>}
      SourceDocument={({ title }) => <span>{title}</span>}
      Data={({ data }) => <pre>{renderJson(data)}</pre>}
      fallback={(part) => <span>Unsupported message part: {part.type}</span>}
    />
  );
}
