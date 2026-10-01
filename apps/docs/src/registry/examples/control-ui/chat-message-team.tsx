"use client";

import { useId, useState } from "react";
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageReaction,
  ChatMessageReactions,
  ChatMessageReplies,
  ChatMessageReplySummary,
  ChatMessageRow,
  ChatMessageTime,
} from "@/components/control-ui/chat-message";

const othersWhoReacted = ["Léo Martin", "Inès Diallo"];

const replies = [
  {
    id: "leo",
    initials: "LM",
    name: "Léo Martin",
    time: "4:10 PM",
    dateTime: "2026-09-30T16:10:00Z",
    text: "Could it include the invoice ID?",
  },
  { id: "ines", initials: "ID", name: "Inès Diallo", time: "4:12 PM", dateTime: "2026-09-30T16:12:00Z", text: "Finance needs that too." },
];

export function ChatMessageTeamExample() {
  const [viewerReacted, setViewerReacted] = useState(false);
  const reactors = viewerReacted ? [...othersWhoReacted, "you"] : othersWhoReacted;
  const [repliesOpen, setRepliesOpen] = useState(false);
  const repliesId = useId();

  return (
    <div className="w-full">
      <ChatMessage from="participant" layout="flat" authorLabel="Maya Chen, 4:02 PM">
        <ChatMessageRow>
          <ChatMessageAvatar>MC</ChatMessageAvatar>
          <ChatMessageBody>
            <ChatMessageHeader>
              <ChatMessageAuthor>Maya Chen</ChatMessageAuthor>
              <ChatMessageTime dateTime="2026-09-30T16:02:00Z">4:02 PM</ChatMessageTime>
            </ChatMessageHeader>
            <ChatMessageContent>The billing export is live for every workspace.</ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
      <ChatMessage from="participant" layout="flat" continuation authorLabel="Maya Chen, 4:03 PM">
        <ChatMessageRow>
          <ChatMessageAvatar>
            <ChatMessageTime dateTime="2026-09-30T16:03:00Z">4:03</ChatMessageTime>
          </ChatMessageAvatar>
          <ChatMessageBody>
            <ChatMessageContent>CSV and JSON both work. Tell me if a column is missing.</ChatMessageContent>
            <ChatMessageReactions>
              <ChatMessageReaction
                emoji="🎉"
                count={reactors.length}
                pressed={viewerReacted}
                onPressedChange={setViewerReacted}
                label={`🎉 from ${reactors.join(", ")}`}
              />
            </ChatMessageReactions>
            <ChatMessageReplySummary aria-expanded={repliesOpen} aria-controls={repliesId} onClick={() => setRepliesOpen((open) => !open)}>
              {repliesOpen ? "Hide replies" : `${replies.length} replies`}
            </ChatMessageReplySummary>
            <ChatMessageReplies id={repliesId} hidden={!repliesOpen}>
              {replies.map((reply) => (
                <ChatMessage key={reply.id} from="participant" layout="flat" authorLabel={`${reply.name}, ${reply.time}`}>
                  <ChatMessageRow>
                    <ChatMessageAvatar>{reply.initials}</ChatMessageAvatar>
                    <ChatMessageBody>
                      <ChatMessageHeader>
                        <ChatMessageAuthor>{reply.name}</ChatMessageAuthor>
                        <ChatMessageTime dateTime={reply.dateTime}>{reply.time}</ChatMessageTime>
                      </ChatMessageHeader>
                      <ChatMessageContent>{reply.text}</ChatMessageContent>
                    </ChatMessageBody>
                  </ChatMessageRow>
                </ChatMessage>
              ))}
            </ChatMessageReplies>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
      <ChatMessage from="user" layout="flat" authorLabel="You, 4:05 PM">
        <ChatMessageRow>
          <ChatMessageAvatar>DS</ChatMessageAvatar>
          <ChatMessageBody>
            <ChatMessageHeader>
              <ChatMessageAuthor>You</ChatMessageAuthor>
              <ChatMessageTime dateTime="2026-09-30T16:05:00Z">4:05 PM</ChatMessageTime>
            </ChatMessageHeader>
            <ChatMessageContent>Works on our side. Thanks!</ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </div>
  );
}
