"use client";

import { ChatGptIcon, ClaudeIcon, GoogleGeminiIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp, Brain } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";

const models = [
  { value: "claude", label: "Claude", icon: <HugeiconsIcon icon={ClaudeIcon} /> },
  { value: "gpt", label: "GPT", icon: <HugeiconsIcon icon={ChatGptIcon} /> },
  { value: "gemini", label: "Gemini", icon: <HugeiconsIcon icon={GoogleGeminiIcon} /> },
];

const thinkingLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ChatComposerExample() {
  const [model, setModel] = useState("claude");
  const [thinking, setThinking] = useState("medium");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  function submitPrompt({ value, clear }: ChatComposerSubmitPayload) {
    setSubmittedPrompt(value);
    clear();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {submittedPrompt ? (
        <ChatMessage from="user" density="compact" aria-live="polite">
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
              <ModelSwitcher models={models} value={model} onValueChange={setModel} size="xs" variant="ghost" />
              <Select value={thinking} onValueChange={setThinking}>
                <SelectTrigger size="xs" variant="ghost" aria-label="Thinking level">
                  <Brain className="size-3.5" aria-hidden="true" />
                  <SelectValue>{(value) => thinkingLevels.find((level) => level.value === value)?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {thinkingLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ChatComposerTools>
            <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
              <ArrowUp className="size-4" />
            </ChatComposerSubmit>
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>
    </div>
  );
}
