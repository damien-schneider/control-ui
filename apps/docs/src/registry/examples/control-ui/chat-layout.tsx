"use client";

import { ArrowUp } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

import { ActionBar, ActionBarCopy } from "@/components/control-ui/action-bar";
import { Activity, ActivityContent, ActivityIcon, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import { ChatLayout, ChatThread, ChatThreadScrollButton, ChatTurn } from "@/components/control-ui/chat-layout";
import {
  ChatMessage,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessagePending,
  ChatMessageRow,
} from "@/components/control-ui/chat-message";
import type { ChatState } from "@/components/control-ui/hooks/use-chat-message";

const question = "Can the conversation scroll beneath the composer?";

const followUps = [
  {
    ask: "Does the dock stay put while I scroll back?",
    answer: "Yes. The dock is sticky inside the thread, so it never leaves the viewport.",
  },
  {
    ask: "What happens when the thread is shorter than the panel?",
    answer: "The thread stretches to full height and the dock rests against the bottom edge.",
  },
  {
    ask: "Can the dock hold something other than a composer?",
    answer: "It takes any node, so an approval bar or a banner docks the same way.",
  },
];

const reply = "Auto-scroll keeps the newest words in view, and the button appears the moment you read back through the thread.";

type StreamedTurn = { id: number; question: string; answer: string; state: ChatState };

type StreamedReplies = { turns: StreamedTurn[]; send: (question: string) => void };

function useStreamedReplies(): StreamedReplies {
  const [turns, setTurns] = useState<StreamedTurn[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextId = useRef(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function send(prompt: string) {
    const id = nextId.current++;
    setTurns((previous) => [...previous, { id, question: prompt, answer: "", state: "pending" }]);
    const words = reply.split(" ");
    words.forEach((word, step) => {
      timers.current.push(
        setTimeout(
          () =>
            setTurns((previous) =>
              previous.map((turn) =>
                turn.id === id
                  ? { ...turn, answer: `${turn.answer} ${word}`.trim(), state: step === words.length - 1 ? "idle" : "streaming" }
                  : turn,
              ),
            ),
          600 + step * 90,
        ),
      );
    });
  }

  return { turns, send };
}

function DockedComposer({ onSend }: { onSend: (question: string) => void }) {
  return (
    <ChatComposer
      density="compact"
      onSubmit={({ value, clear }) => {
        onSend(value);
        clear();
      }}
    >
      <ChatComposerShell>
        <ChatComposerTextarea placeholder="Ask anything…" />
        <ChatComposerToolbar>
          <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
            <ArrowUp className="size-4" />
          </ChatComposerSubmit>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );
}

export function ChatLayoutExample() {
  const { turns, send } = useStreamedReplies();

  return (
    <ChatLayout className="h-80 min-h-0">
      <ChatThread
        composer={
          <>
            <ChatThreadScrollButton />
            <DockedComposer onSend={send} />
          </>
        }
      >
        <ChatTurn from="user">
          <ChatMessage from="user" density="compact">
            <ChatMessageRow>
              <ChatMessageBody>
                <ChatMessageContent>{question}</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
          <ActionBar align="end" label="Your message actions" copyValue={question}>
            <ActionBarCopy />
          </ActionBar>
        </ChatTurn>
        <ChatTurn from="assistant">
          <Activity kind="reasoning" state="success">
            <ActivityTrigger>
              <ActivityIcon />
              <ActivityTitle>Thought for 2 seconds</ActivityTitle>
            </ActivityTrigger>
            <ActivityContent>Keep each turn in the conversation and let the composer stay within the scroll area.</ActivityContent>
          </Activity>
          <ChatMessage from="assistant" density="compact">
            <ChatMessageRow>
              <ChatMessageBody>
                <ChatMessageHeader>Assistant</ChatMessageHeader>
                <ChatMessageContent>Yes. The composer stays at the bottom while earlier messages scroll behind it.</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        </ChatTurn>
        {followUps.map(({ ask, answer }) => (
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
        {turns.map((turn) => (
          <Fragment key={turn.id}>
            <ChatTurn from="user">
              <ChatMessage from="user" density="compact">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{turn.question}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            </ChatTurn>
            <ChatTurn from="assistant">
              <ChatMessage from="assistant" density="compact" state={turn.state}>
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageHeader>Assistant</ChatMessageHeader>
                    <ChatMessagePending />
                    {turn.answer === "" ? null : <ChatMessageContent>{turn.answer}</ChatMessageContent>}
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
