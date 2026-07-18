"use client";

import { useState } from "react";

import {
  ChatInput,
  ChatInputAccent,
  ChatInputFooter,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputTextarea,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";

const initialPrompt = "Summarize the latest deployment notes.";

export function ChatInputExample() {
  const [submittedPrompt, setSubmittedPrompt] = useState(initialPrompt);

  function submitPrompt({ value, clear }: { value: string; clear: () => void }) {
    const nextValue = value.trim();
    if (!nextValue) return;

    setSubmittedPrompt(nextValue);
    clear();
  }

  return (
    <div className="flex h-[420px] flex-col justify-end p-5">
      <ChatInput density="compact" onSubmit={submitPrompt}>
        <ChatInputShell>
          <ChatInputAccent />
          <ChatInputTextarea placeholder="Ask the assistant..." />
          <ChatInputToolbar>
            <ChatInputTools>
              <span>Preview model</span>
              <span>Local state</span>
            </ChatInputTools>
            <ChatInputSubmit>Send</ChatInputSubmit>
          </ChatInputToolbar>
          <ChatInputFooter>Last submitted: {submittedPrompt}</ChatInputFooter>
        </ChatInputShell>
      </ChatInput>
    </div>
  );
}
