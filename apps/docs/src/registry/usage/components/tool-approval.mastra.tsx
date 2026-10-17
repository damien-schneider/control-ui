"use client";

import { useChat } from "@mastra/react";

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

export function Example({ agentId, toolCallId, toolName, args }: { agentId: string; toolCallId: string; toolName: string; args: unknown }) {
  const { approveToolCall, declineToolCall, toolCallApprovals } = useChat({ agentId });
  const decision = toolCallApprovals[toolCallId]?.status;

  let state: ToolApprovalState = "pending";
  if (decision === "approved") state = "approved";
  if (decision === "declined") state = "denied";

  return (
    <ToolApproval autoFocus state={state} onApprove={() => approveToolCall(toolCallId)} onDeny={() => declineToolCall(toolCallId)}>
      <ToolApprovalBody>
        <ToolApprovalHeader>
          <ToolApprovalIcon />
          <ToolApprovalTitle>{`Run ${toolName}?`}</ToolApprovalTitle>
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
  );
}
