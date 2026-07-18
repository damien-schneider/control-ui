"use client";

import type { MastraDBMessage } from "@mastra/core/agent/message-list";
import { useChat } from "@mastra/react";

import {
  DynamicNotification,
  DynamicNotificationContent,
  DynamicNotificationGlass,
  DynamicNotificationIndicator,
  DynamicNotificationIsland,
  DynamicNotificationMessage,
  DynamicNotificationPill,
  DynamicNotificationReply,
  DynamicNotificationReplyInput,
  DynamicNotificationReplySubmit,
} from "@/components/control-ui/dynamic-notification";

function latestAssistantText(messages: MastraDBMessage[]) {
  const message = messages.findLast((entry) => entry.role === "assistant");
  return message?.content.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("") ?? "No reply yet";
}

export function Example({ agentId }: { agentId: string }) {
  const { isRunning, messages, sendMessage } = useChat({ agentId });

  return (
    <DynamicNotification
      variant="glass"
      loading={isRunning}
      onReply={async ({ value, clear }) => {
        await sendMessage({ message: value });
        clear();
      }}
    >
      <DynamicNotificationIsland>
        <DynamicNotificationGlass />
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
