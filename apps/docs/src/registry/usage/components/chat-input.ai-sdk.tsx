"use client";

import { useChat } from "@ai-sdk/react";

import {
  ChatInput,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";

export function Example() {
  const { sendMessage, status } = useChat();
  const isRunning = status === "submitted" || status === "streaming";

  return (
    <ChatInput
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ text: value });
        clear();
      }}
    >
      <ChatInputShell>
        <ChatInputTextarea placeholder="Ask anything..." />
        <ChatInputToolbar>
          <ChatInputTools>AI SDK</ChatInputTools>
          <ChatInputSubmit>Send</ChatInputSubmit>
        </ChatInputToolbar>
      </ChatInputShell>
    </ChatInput>
  );
}
