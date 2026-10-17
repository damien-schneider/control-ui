"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import type { ToolApprovalState } from "@/components/control-ui/tool-approval";
import {
  ToolApproval,
  ToolApprovalApprove,
  ToolApprovalBody,
  ToolApprovalDeny,
  ToolApprovalDescription,
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

export function ToolApprovalExample() {
  const [state, setState] = useState<ToolApprovalState>("pending");

  return (
    <div className="mx-auto grid w-full max-w-md gap-3">
      <ToolApproval state={state} risk="medium" onApprove={() => setState("approved")} onDeny={() => setState("denied")}>
        <ToolApprovalBody>
          <ToolApprovalHeader>
            <ToolApprovalIcon>
              <Send />
            </ToolApprovalIcon>
            <ToolApprovalTitle>Post to #revenue</ToolApprovalTitle>
            <ToolApprovalRisk />
            <ToolApprovalStatus />
          </ToolApprovalHeader>
          <ToolApprovalDescription>The agent wants to share this week's churn summary with the finance channel.</ToolApprovalDescription>
          <ToolApprovalPreview>
            <ToolApprovalField label="Tool">slack.post</ToolApprovalField>
            <ToolApprovalField label="Channel">#revenue</ToolApprovalField>
            <ToolApprovalField label="Message">
              Churn rose 0.4 pt to 3.1% last week, driven by monthly Starter plans in EMEA.
            </ToolApprovalField>
          </ToolApprovalPreview>
        </ToolApprovalBody>
        <ToolApprovalFooter>
          <ToolApprovalDeny />
          <ToolApprovalApprove />
        </ToolApprovalFooter>
      </ToolApproval>
      {state === "pending" ? null : (
        <Button size="xs" variant="quiet" className="justify-self-center" onClick={() => setState("pending")}>
          Reset
        </Button>
      )}
    </div>
  );
}
