"use client";

import { ArrowDown } from "lucide-react";
import { Fragment } from "react";
import { ChatLayout, ChatThread, ChatTurn, useChatThread } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageHeader, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Button } from "@/components/control-ui/ui/button";

const exchanges = [
  {
    ask: "Why did last night's import job fail?",
    answer: "The warehouse rejected 412 rows: the order date column arrived as text instead of a timestamp.",
  },
  {
    ask: "Which upstream change caused that?",
    answer: "The billing export switched to a localized date format on Tuesday, so the parser no longer recognizes it.",
  },
  {
    ask: "Can we re-run only the rejected rows?",
    answer: "Yes. The rejected rows are saved with their batch id, so a replay touches nothing that already loaded.",
  },
  {
    ask: "How long will the replay take?",
    answer: "About four minutes for 412 rows, including validation against the current schema.",
  },
  {
    ask: "What stops this from happening again?",
    answer: "Pin the export to ISO 8601 dates and add a schema check that fails the job before any row is written.",
  },
];

function JumpToLatest() {
  const { atBottom, scrollToBottom } = useChatThread();

  return (
    <div className="flex justify-center pb-2">
      <Button variant="surface" size="xs" disabled={atBottom} focusableWhenDisabled onClick={() => scrollToBottom("smooth")}>
        {atBottom ? (
          "You are up to date"
        ) : (
          <>
            <ArrowDown aria-hidden="true" />
            Jump to latest reply
          </>
        )}
      </Button>
    </div>
  );
}

export function ChatThreadPositionExample() {
  return (
    <ChatLayout className="h-80 min-h-0">
      <ChatThread composer={<JumpToLatest />}>
        {exchanges.map(({ ask, answer }) => (
          <Fragment key={ask}>
            <ChatTurn from="user">
              <ChatMessage from="user" density="compact">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{ask}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            </ChatTurn>
            <ChatTurn from="assistant">
              <ChatMessage from="assistant" density="compact">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageHeader>Assistant</ChatMessageHeader>
                    <ChatMessageContent>{answer}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            </ChatTurn>
          </Fragment>
        ))}
      </ChatThread>
    </ChatLayout>
  );
}
