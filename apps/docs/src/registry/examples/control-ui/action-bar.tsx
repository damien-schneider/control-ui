"use client";

import { useRef, useState } from "react";
import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Textarea } from "@/components/control-ui/ui/textarea";

export function ActionBarExample() {
  const [message, setMessage] = useState("Summarize the latest deployment notes.");
  const [draft, setDraft] = useState(message);
  const [isEditing, setIsEditing] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  function startEditing(value: string) {
    setDraft(value);
    setIsEditing(true);
  }

  function closeEditor() {
    setIsEditing(false);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }

  return (
    <ChatTurn from="user" className="mx-auto max-w-xl">
      {isEditing ? (
        <form
          className="w-full"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            setMessage(draft.trim());
            closeEditor();
          }}
        >
          <Textarea
            aria-label="Edit message"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            className="min-h-20"
            autoFocus
          />
          <ActionBar align="end" label="Edit actions">
            <ActionBarItem type="submit" disabled={!draft.trim()}>
              Save
            </ActionBarItem>
            <ActionBarItem type="button" onClick={closeEditor}>
              Cancel
            </ActionBarItem>
          </ActionBar>
        </form>
      ) : (
        <>
          <ChatMessage from="user" density="compact">
            <ChatMessageRow>
              <ChatMessageBody>
                <ChatMessageContent>{message}</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
          <ActionBar align="end" label="Your message actions" copyValue={message} editValue={message} onEdit={startEditing}>
            <ActionBarCopy />
            <ActionBarEdit ref={editButtonRef} />
          </ActionBar>
        </>
      )}
    </ChatTurn>
  );
}
