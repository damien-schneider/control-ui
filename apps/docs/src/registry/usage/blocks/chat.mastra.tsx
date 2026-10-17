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
import { ChatBlock } from "@/components/control-ui/blocks/chat";
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
import { SourceBadge } from "@/components/control-ui/source-badge";
import type { ToolApprovalState } from "@/components/control-ui/tool-approval";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalField,
  ToolApprovalFooter,
  ToolApprovalHeader,
  ToolApprovalIcon,
  ToolApprovalPreview,
  ToolApprovalRisk,
  ToolApprovalStatus,
  ToolApprovalTitle,
} from "@/components/control-ui/tool-approval";
import { Button } from "@/components/control-ui/ui/button";

function activityState(state: string): ActivityState {
  if (state === "result" || state === "output-available") return "success";
  if (state === "output-error" || state === "output-denied") return "error";
  if (state === "approval-requested") return "waiting";
  if (state === "partial-call" || state === "input-streaming" || state === "call" || state === "approval-responded") return "running";
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

type ToolCallApprovals = {
  decisions: Record<string, { status: "approved" | "declined" }>;
  pending: ReadonlySet<string>;
  approve: (toolCallId: string) => Promise<void>;
  decline: (toolCallId: string) => Promise<void>;
};

function pendingApprovalIds(metadata: Record<string, unknown> | undefined) {
  const requests = metadata?.requireApprovalMetadata;
  if (typeof requests !== "object" || requests === null) return [];
  return Object.values(requests).flatMap((request: unknown) =>
    typeof request === "object" && request !== null && "toolCallId" in request && typeof request.toolCallId === "string"
      ? [request.toolCallId]
      : [],
  );
}

function approvalState(decision: "approved" | "declined" | undefined): ToolApprovalState {
  if (decision === "approved") return "approved";
  if (decision === "declined") return "denied";
  return "pending";
}

function renderToolInvocation(part: ToolInvocationPart, approvals: ToolCallApprovals) {
  const invocation = part.toolInvocation;
  const decision = approvals.decisions[invocation.toolCallId]?.status;
  const awaitsApproval =
    decision === undefined && (invocation.state === "approval-requested" || approvals.pending.has(invocation.toolCallId));
  const state = awaitsApproval ? "waiting" : activityState(invocation.state);
  const needsApproval = awaitsApproval || decision !== undefined;
  const args = invocation.rawInput ?? invocation.args;

  return (
    <div className="grid gap-2">
      <Activity kind="tool" name={invocation.toolName} state={state}>
        <ActivityTrigger>
          <ActivityIcon />
          <ActivityTitle />
          <ActivityStatus className="sr-only" />
        </ActivityTrigger>
        <ActivityContent>
          <ActivityDetail>
            <ActivityDetailLabel>Input</ActivityDetailLabel>
            <ActivityDetailContent format="code">{JSON.stringify(args, null, 2)}</ActivityDetailContent>
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
      {needsApproval ? (
        <ToolApproval
          state={approvalState(decision)}
          onApprove={() => approvals.approve(invocation.toolCallId)}
          onDeny={() => approvals.decline(invocation.toolCallId)}
        >
          <ToolApprovalBody>
            <ToolApprovalHeader>
              <ToolApprovalIcon />
              <ToolApprovalTitle>{`Run ${invocation.toolName}?`}</ToolApprovalTitle>
              <ToolApprovalRisk />
              <ToolApprovalStatus />
            </ToolApprovalHeader>
            <ToolApprovalPreview>
              <ToolApprovalField label="Input">
                <div className="whitespace-pre-wrap wrap-anywhere">{JSON.stringify(args, null, 2)}</div>
              </ToolApprovalField>
            </ToolApprovalPreview>
          </ToolApprovalBody>
          <ToolApprovalFooter>
            <ToolApprovalDeny />
            <ToolApprovalApprove />
          </ToolApprovalFooter>
        </ToolApproval>
      ) : null}
    </div>
  );
}

const messageRoles = {
  User: ({ children }: MessageRoleRendererProps) => renderTurn("user", children),
  Assistant: ({ children }: MessageRoleRendererProps) => renderTurn("assistant", children),
  System: () => null,
  Signal: ({ children }: MessageRoleRendererProps) => renderTurn("assistant", children),
} satisfies MessageRoleRenderers;

function MastraChat({ agentId }: { agentId: string }) {
  const { approveToolCall, cancelRun, declineToolCall, isRunning, messages, sendMessage, toolCallApprovals } = useChat({ agentId });
  const approvals = {
    decisions: toolCallApprovals,
    pending: new Set(messages.flatMap((message) => pendingApprovalIds(message.content.metadata))),
    approve: approveToolCall,
    decline: declineToolCall,
  };

  const composer = (
    <ChatComposer
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ message: value });
        clear();
      }}
    >
      <ChatComposerShell>
        <ChatComposerTextarea placeholder="Ask the agent..." />
        <ChatComposerToolbar>
          <ChatComposerTools>Mastra agent</ChatComposerTools>
          {isRunning ? (
            <Button type="button" size="xs" variant="quiet" onClick={cancelRun}>
              Stop
            </Button>
          ) : (
            <ChatComposerSubmit>Send</ChatComposerSubmit>
          )}
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );

  return (
    <ChatBlock composer={composer}>
      {messages.map((message) => (
        <MessageFactory
          key={message.id}
          message={message}
          roles={messageRoles}
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
          ToolInvocation={(part) => renderToolInvocation(part, approvals)}
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
