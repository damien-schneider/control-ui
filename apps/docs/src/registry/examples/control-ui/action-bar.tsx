"use client";

import { useState } from "react";
import { ActionBarCopy, ActionBarEdit } from "@/components/control-ui/action-bar";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageEditable, ChatMessageRow } from "@/components/control-ui/chat-message";

export function ActionBarExample() {
  const [message, setMessage] = useState("Summarize the latest deployment notes.");

  return (
    <ChatTurn from="user" className="mx-auto max-w-xl">
      <ChatMessage from="user" density="compact">
        <ChatMessageRow>
          <ChatMessageBody>
            <ChatMessageEditable value={message} onSave={setMessage}>
              <ActionBarCopy />
              <ActionBarEdit />
            </ChatMessageEditable>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </ChatTurn>
  );
}
