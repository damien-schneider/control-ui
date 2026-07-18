"use client";

import { useChat } from "@mastra/react";

import {
  ChatInput,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";

export function Example({ agentId }: { agentId: string }) {
  const { isRunning, sendMessage } = useChat({ agentId });

  return (
    <ChatInput
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ message: value });
        clear();
      }}
    >
      <ChatInputShell>
        <ChatInputTextarea placeholder="Ask anything..." />
        <ChatInputToolbar>
          <ChatInputTools>Mastra agent</ChatInputTools>
          <ChatInputSubmit>Send</ChatInputSubmit>
        </ChatInputToolbar>
      </ChatInputShell>
    </ChatInput>
  );
}
