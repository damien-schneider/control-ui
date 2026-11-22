"use client";

import { ArrowUp } from "lucide-react";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import {
  ChatLayout,
  ChatLayoutActions,
  ChatLayoutHeader,
  ChatLayoutTitle,
  ChatThread,
  ChatTurn,
} from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import {
  ChatWorkspace,
  ChatWorkspaceCollapsible,
  ChatWorkspaceDockToggle,
  ChatWorkspaceExpandToggle,
  ChatWorkspaceInset,
  ChatWorkspaceMain,
  ChatWorkspacePanel,
  ChatWorkspaceResizeHandle,
} from "@/components/control-ui/chat-workspace";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

const sections = [
  "A workspace keeps the conversation next to the thing it is about.",
  "Floating, the chat is a small island over the bottom of the page: collapse it to just the composer when you want the room.",
  "Pinned, it becomes a column at the side that you can drag wider or narrower, or resize from the keyboard with the arrow keys.",
  "Switching between the two never remounts the chat, so a half-written message and the scroll position in the transcript stay put.",
  "When the space is too narrow for a column, the chat keeps floating and the pin button steps aside.",
];

const turns = [
  { id: "ask", from: "user" as const, text: "Summarise what changed in this draft." },
  { id: "answer", from: "assistant" as const, text: "You tightened the intro and moved the examples after the rules." },
];

export function ChatWorkspaceExample() {
  return (
    <ChatWorkspace className="h-[36rem] w-full">
      <ChatWorkspaceMain>
        <ScrollArea aria-label="Document" className="h-full">
          <article className="mx-auto flex max-w-prose flex-col gap-4 p-8">
            {sections.map((section) => (
              <p key={section}>{section}</p>
            ))}
            <ChatWorkspaceInset />
          </article>
        </ScrollArea>
      </ChatWorkspaceMain>
      <ChatWorkspacePanel>
        <ChatLayout chrome="embedded">
          <ChatLayoutHeader>
            <ChatWorkspaceExpandToggle />
            <ChatLayoutTitle>Draft review</ChatLayoutTitle>
            <ChatLayoutActions>
              <ChatWorkspaceDockToggle />
            </ChatLayoutActions>
          </ChatLayoutHeader>
          <ChatWorkspaceCollapsible>
            <ChatThread>
              {turns.map((turn) => (
                <ChatTurn key={turn.id} from={turn.from}>
                  <ChatMessage from={turn.from} density="compact">
                    <ChatMessageRow>
                      <ChatMessageBody>
                        <ChatMessageContent>{turn.text}</ChatMessageContent>
                      </ChatMessageBody>
                    </ChatMessageRow>
                  </ChatMessage>
                </ChatTurn>
              ))}
            </ChatThread>
          </ChatWorkspaceCollapsible>
          <ChatComposer density="compact" onSubmit={({ clear }) => clear()}>
            <ChatComposerShell>
              <ChatComposerTextarea aria-label="Message" placeholder="Ask about this draft…" />
              <ChatComposerToolbar>
                <ChatComposerSubmit size="sm" iconOnly aria-label="Send message">
                  <ArrowUp />
                </ChatComposerSubmit>
              </ChatComposerToolbar>
            </ChatComposerShell>
          </ChatComposer>
        </ChatLayout>
        <ChatWorkspaceResizeHandle />
      </ChatWorkspacePanel>
    </ChatWorkspace>
  );
}
