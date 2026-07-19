"use client";

import { useChat } from "@ai-sdk/react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";

export function Example() {
  const { sendMessage, status } = useChat();
  const isRunning = status === "submitted" || status === "streaming";

  return (
    <ChatComposer
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ text: value });
        clear();
      }}
    >
      <ChatComposerShell>
        <ChatComposerTextarea placeholder="Ask anything..." />
        <ChatComposerToolbar>
          <ChatComposerTools>AI SDK</ChatComposerTools>
          <ChatComposerSubmit>Send</ChatComposerSubmit>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );
}
