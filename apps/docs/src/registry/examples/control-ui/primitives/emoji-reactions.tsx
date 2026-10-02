"use client";

import { SmilePlusIcon } from "lucide-react";
import { useState } from "react";
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageReaction,
  ChatMessageReactions,
} from "@/components/control-ui/chat-message";
import { Button } from "@/components/control-ui/ui/button";
import { EmojiPickerPopover } from "../team-chat/message";

export function EmojiReactionsExample() {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const toggleReaction = (emoji: string) => setSelectedEmoji((selected) => (selected === emoji ? null : emoji));

  return (
    <ChatMessage from="participant" layout="flat" className="w-full max-w-sm">
      <ChatMessageBody>
        <ChatMessageHeader>
          <ChatMessageAuthor>Maya</ChatMessageAuthor>
        </ChatMessageHeader>
        <ChatMessageContent>The new project is ready to share.</ChatMessageContent>
        <ChatMessageReactions>
          {selectedEmoji ? (
            <ChatMessageReaction
              emoji={selectedEmoji}
              count={1}
              pressed
              label={`${selectedEmoji}, your reaction`}
              onPressedChange={() => toggleReaction(selectedEmoji)}
            />
          ) : null}
          <EmojiPickerPopover
            onPick={toggleReaction}
            trigger={
              <Button variant="ghost" size="xs" iconOnly aria-label="React to Maya’s message">
                <SmilePlusIcon aria-hidden="true" />
              </Button>
            }
          />
        </ChatMessageReactions>
      </ChatMessageBody>
    </ChatMessage>
  );
}
