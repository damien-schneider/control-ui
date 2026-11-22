"use client";

import { useState } from "react";
import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarMeta } from "@/components/control-ui/action-bar";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import {
  ChatMessage,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageEditable,
  ChatMessageRow,
} from "@/components/control-ui/chat-message";

const answer = "The deploy shipped the new billing page; two migrations ran and nothing rolled back.";

export function ActionBarExample() {
  const [message, setMessage] = useState("Summarize the latest deployment notes.");

  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <ChatTurn from="user">
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
      <ChatTurn from="assistant">
        <ChatMessage from="assistant" density="compact">
          <ChatMessageContent>{answer}</ChatMessageContent>
        </ChatMessage>
        <ActionBar label="Response actions" copyValue={answer}>
          <ActionBarCopy />
          <ActionBarMeta>Sonnet 4.5 · High · 9s</ActionBarMeta>
        </ActionBar>
      </ChatTurn>
    </div>
  );
}
