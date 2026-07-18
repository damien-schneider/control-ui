"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

import {
  DynamicNotification,
  DynamicNotificationContent,
  DynamicNotificationIndicator,
  DynamicNotificationIsland,
  DynamicNotificationMessage,
  DynamicNotificationPill,
  DynamicNotificationReply,
  DynamicNotificationReplyInput,
  DynamicNotificationReplySubmit,
} from "@/components/control-ui/dynamic-notification";

function latestAssistantText(messages: UIMessage[]) {
  const message = messages.findLast((entry) => entry.role === "assistant");
  return message?.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("") ?? "No reply yet";
}

export function Example() {
  const { messages, sendMessage, status } = useChat();
  const isRunning = status === "submitted" || status === "streaming";

  return (
    <DynamicNotification
      variant="surface"
      loading={isRunning}
      onReply={async ({ value, clear }) => {
        await sendMessage({ text: value });
        clear();
      }}
    >
      <DynamicNotificationIsland>
        <DynamicNotificationPill>
          <DynamicNotificationIndicator />
          Assistant
        </DynamicNotificationPill>
        <DynamicNotificationContent>
          <DynamicNotificationMessage>{latestAssistantText(messages)}</DynamicNotificationMessage>
          <DynamicNotificationReply>
            <DynamicNotificationReplyInput placeholder="Answer…" />
            <DynamicNotificationReplySubmit />
          </DynamicNotificationReply>
        </DynamicNotificationContent>
      </DynamicNotificationIsland>
    </DynamicNotification>
  );
}
