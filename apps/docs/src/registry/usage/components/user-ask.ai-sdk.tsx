"use client";

import { useChat } from "@ai-sdk/react";

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

export function Example({ toolCallId }: { toolCallId: string }) {
  const { addToolOutput } = useChat();

  return (
    <UserAsk
      autoFocus
      onComplete={(answers) => addToolOutput({ tool: "askUser", toolCallId, output: answers })}
      onDismiss={() => addToolOutput({ state: "output-error", tool: "askUser", toolCallId, errorText: "Dismissed" })}
    >
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
