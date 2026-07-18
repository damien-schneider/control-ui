"use client";

import { useChat } from "@mastra/react";

import {
  UserAsk,
  UserAskDismiss,
  UserAskFooter,
  UserAskHeader,
  UserAskOption,
  UserAskOptionInput,
  UserAskOptionLabel,
  UserAskQuestion,
  UserAskSubmit,
  UserAskTitle,
} from "@/components/control-ui/user-ask";

export function Example({ agentId, toolCallId }: { agentId: string; toolCallId: string }) {
  const { approveToolCall, declineToolCall } = useChat({ agentId });

  return (
    <UserAsk autoFocus onComplete={(answers) => approveToolCall(toolCallId, answers)} onDismiss={() => declineToolCall(toolCallId)}>
      <UserAskHeader>
        <UserAskTitle />
      </UserAskHeader>
      <UserAskQuestion id="scope" title="What should this run focus on?" defaultValue="fix">
        <UserAskOption value="fix" recommended>
          <UserAskOptionLabel>Tiny repo fix</UserAskOptionLabel>
        </UserAskOption>
        <UserAskOption value="polish">
          <UserAskOptionLabel>UI polish</UserAskOptionLabel>
        </UserAskOption>
        <UserAskOptionInput label="Something else" />
      </UserAskQuestion>
      <UserAskFooter>
        <UserAskDismiss />
        <UserAskSubmit />
      </UserAskFooter>
    </UserAsk>
  );
}
