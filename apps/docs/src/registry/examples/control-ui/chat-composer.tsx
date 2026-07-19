"use client";

import { useState } from "react";

import {
  ChatComposer,
  ChatComposerAccent,
  ChatComposerFooter,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";

const initialPrompt = "Summarize the latest deployment notes.";

export function ChatComposerExample() {
  const [submittedPrompt, setSubmittedPrompt] = useState(initialPrompt);

  function submitPrompt({ value, clear }: { value: string; clear: () => void }) {
    const nextValue = value.trim();
    if (!nextValue) return;

    setSubmittedPrompt(nextValue);
    clear();
  }

  return (
    <div className="flex h-[420px] flex-col justify-end p-5">
      <ChatComposer density="compact" onSubmit={submitPrompt}>
        <ChatComposerShell>
          <ChatComposerAccent />
          <ChatComposerTextarea placeholder="Ask the assistant..." />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <span>Preview model</span>
              <span>Local state</span>
            </ChatComposerTools>
            <ChatComposerSubmit>Send</ChatComposerSubmit>
          </ChatComposerToolbar>
          <ChatComposerFooter>Last submitted: {submittedPrompt}</ChatComposerFooter>
        </ChatComposerShell>
      </ChatComposer>
    </div>
  );
}
