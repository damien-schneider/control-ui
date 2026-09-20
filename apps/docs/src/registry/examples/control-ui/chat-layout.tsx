import { ArrowUp } from "lucide-react";
import { Fragment } from "react";

import { ActionBar, ActionBarCopy } from "@/components/control-ui/action-bar";
import { Activity, ActivityContent, ActivityIcon, ActivityTitle, ActivityTrigger } from "@/components/control-ui/activity";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import { ChatLayout, ChatThread, ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageHeader, ChatMessageRow } from "@/components/control-ui/chat-message";

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

function DockedComposer() {
  return (
    <ChatComposer density="compact">
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
  return (
    <ChatLayout className="h-80 min-h-0">
      <ChatThread composer={<DockedComposer />}>
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
      </ChatThread>
    </ChatLayout>
  );
}
