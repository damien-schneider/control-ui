"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";

import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";
import { ChatLayout, ChatThought, ChatThread, ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageHeader, ChatMessageRow } from "@/components/control-ui/chat-message";

export function ChatLayoutExample() {
  const [message, setMessage] = useState("Can this layout compose turns?");
  const [draft, setDraft] = useState(message);
  const [isEditing, setIsEditing] = useState(false);

  function startEditing(value: string) {
    setDraft(value);
    setIsEditing(true);
  }

  function saveEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(draft.trim() || message);
    setIsEditing(false);
  }

  return (
    <div className="p-4">
      <ChatLayout className="border shadow-soft">
        <ChatThread className="min-h-[260px]">
          <ChatTurn from="user">
            {isEditing ? (
              <form onSubmit={saveEdit} className="w-[min(70%,24rem)]">
                <textarea
                  aria-label="Edit message"
                  value={draft}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  className="min-h-20 w-full resize-none rounded-[18px] border bg-white/80 p-3 text-sm outline-none"
                />
                <ActionBar align="end" label="Edit actions" className="opacity-100">
                  <ActionBarItem type="submit">Save</ActionBarItem>
                  <ActionBarItem type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </ActionBarItem>
                </ActionBar>
              </form>
            ) : (
              <ChatMessage from="user" density="compact">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{message}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            )}
            <ActionBar align="end" label="Your message actions" copyValue={message} editValue={message} onEdit={startEditing}>
              <ActionBarCopy />
              <ActionBarEdit />
            </ActionBar>
          </ChatTurn>
          <ChatTurn from="assistant">
            <ChatThought />
            <ChatMessage from="assistant" density="compact">
              <ChatMessageRow>
                <ChatMessageBody>
                  <ChatMessageHeader>Assistant</ChatMessageHeader>
                  <ChatMessageContent>
                    Yes. The layout owns structure while message, action bar, and composer stay separate.
                  </ChatMessageContent>
                </ChatMessageBody>
              </ChatMessageRow>
            </ChatMessage>
          </ChatTurn>
        </ChatThread>
      </ChatLayout>
    </div>
  );
}
