"use client";

import { useChat } from "@mastra/react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";

export function Example({ agentId }: { agentId: string }) {
  const { isRunning, sendMessage } = useChat({ agentId });

  return (
    <ChatComposer
      state={isRunning ? "submitting" : "idle"}
      onSubmit={async ({ value, clear }) => {
        await sendMessage({ message: value });
        clear();
      }}
    >
      <ChatComposerShell>
        <ChatComposerTextarea placeholder="Ask anything..." />
        <ChatComposerToolbar>
          <ChatComposerTools>Mastra agent</ChatComposerTools>
          <ChatComposerSubmit>Send</ChatComposerSubmit>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );
}
