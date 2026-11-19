"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import type { ChatComposerSubmitPayload } from "@/components/control-ui/hooks/use-chat-composer";
import { ModelSwitcher } from "@/components/control-ui/model-switcher";

const models = [{ value: "claude-sonnet-4-5" }, { value: "gpt-5" }, { value: "gemini-2.5-pro" }];

const thinkingLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ChatComposerExample() {
  const [model, setModel] = useState("claude-sonnet-4-5");
  const [thinking, setThinking] = useState("medium");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  function submitPrompt({ value, clear }: ChatComposerSubmitPayload) {
    setSubmittedPrompt(value);
    clear();
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col gap-6">
      {submittedPrompt ? (
        <ChatMessage from="user" density="compact">
          <ChatMessageRow>
            <ChatMessageBody>
              <ChatMessageContent>{submittedPrompt}</ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
      ) : null}
      <ChatComposer density="compact" onSubmit={submitPrompt}>
        <ChatComposerShell>
          <ChatComposerTextarea placeholder="Ask anything…" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <ModelSwitcher
                models={models}
                value={model}
                onValueChange={setModel}
                thinking={{ levels: thinkingLevels, value: thinking, onValueChange: setThinking }}
                size="xs"
                variant="ghost"
              />
            </ChatComposerTools>
            <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
              <ArrowUp />
            </ChatComposerSubmit>
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>
    </div>
  );
}
