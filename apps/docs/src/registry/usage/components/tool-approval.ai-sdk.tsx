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
import { Code, CodeContent } from "@/components/control-ui/ui/code";

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
            <Code overflow="wrap">
              <CodeContent code={JSON.stringify(part.input, null, 2)} lang="json" />
            </Code>
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
