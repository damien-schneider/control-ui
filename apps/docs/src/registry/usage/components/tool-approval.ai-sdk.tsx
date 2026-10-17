"use client";

import { useChat } from "@ai-sdk/react";
import { type DynamicToolUIPart, getToolName, type ToolUIPart } from "ai";

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

export function Example({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const { addToolApprovalResponse } = useChat();
  const approval = part.approval;
  if (approval === undefined) return null;

  let state: ToolApprovalState = "pending";
  if (approval.approved === true) state = "approved";
  if (approval.approved === false) state = "denied";

  return (
    <ToolApproval
      autoFocus
      state={state}
      onApprove={() => addToolApprovalResponse({ id: approval.id, approved: true })}
      onDeny={() => addToolApprovalResponse({ id: approval.id, approved: false })}
    >
      <ToolApprovalBody>
        <ToolApprovalHeader>
          <ToolApprovalIcon />
          <ToolApprovalTitle>{`Run ${getToolName(part)}?`}</ToolApprovalTitle>
          <ToolApprovalRisk />
          <ToolApprovalStatus />
        </ToolApprovalHeader>
        <ToolApprovalPreview>
          <ToolApprovalField label="Input">
            <div className="whitespace-pre-wrap wrap-anywhere">{JSON.stringify(part.input, null, 2)}</div>
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
