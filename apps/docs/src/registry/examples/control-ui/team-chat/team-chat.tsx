"use client";

import { SmilePlusIcon, UsersIcon, XIcon } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { TeamChatBlock } from "@/components/control-ui/blocks/team-chat";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
  useChatComposerContext,
} from "@/components/control-ui/chat-composer";
import {
  ChatLayout,
  ChatLayoutActions,
  ChatLayoutDescription,
  ChatLayoutHeader,
  ChatLayoutTitle,
  ChatThread,
  ChatThreadScrollButton,
} from "@/components/control-ui/chat-layout";
import { ChatTypingIndicator } from "@/components/control-ui/chat-message";
import type { ChatComposerSubmitPayload } from "@/components/control-ui/hooks/use-chat-composer";
import { TranscriptDivider } from "@/components/control-ui/transcript-divider";
import { Button } from "@/components/control-ui/ui/button";
import { SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { channels, continuesPrevious, groupByDay, people, supportMessages, type TeamMessage, toggleReaction, viewerId } from "./data";
import { EmojiPickerPopover, TeamChatMessage } from "./message";
import { TeamChatSidebar } from "./sidebar";

function ComposerEmojiButton() {
  const composer = useChatComposerContext();
  return (
    <EmojiPickerPopover
      onPick={composer.insertText}
      trigger={
        <Button type="button" variant="ghost" size="xs" iconOnly aria-label="Insert emoji">
          <SmilePlusIcon aria-hidden="true" />
        </Button>
      }
    />
  );
}

function MessageComposer({ placeholder, autoFocus, onSend }: { placeholder: string; autoFocus?: boolean; onSend: (text: string) => void }) {
  const [draft, setDraft] = useState("");

  function sendMessage({ value, clear }: ChatComposerSubmitPayload) {
    onSend(value);
    clear();
  }

  return (
    <ChatComposer density="compact" value={draft} onValueChange={setDraft} onSubmit={sendMessage}>
      <ChatComposerShell>
        <ChatComposerTextarea aria-label={placeholder} placeholder={placeholder} autoFocus={autoFocus} />
        <ChatComposerToolbar>
          <ChatComposerTools>
            <ComposerEmojiButton />
          </ChatComposerTools>
          <ChatComposerSubmit>Send</ChatComposerSubmit>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );
}

function newMessage(text: string): TeamMessage {
  return { id: crypto.randomUUID(), authorId: viewerId, sentAt: new Date().toISOString(), text, reactions: [], replies: [] };
}

function updateMessage(messages: TeamMessage[], id: string, update: (message: TeamMessage) => TeamMessage): TeamMessage[] {
  return messages.map((message) => {
    if (message.id === id) return update(message);
    if (message.replies.some((reply) => reply.id === id)) return { ...message, replies: updateMessage(message.replies, id, update) };
    return message;
  });
}

function removeMessage(messages: TeamMessage[], id: string): TeamMessage[] {
  return messages
    .filter((message) => message.id !== id)
    .map((message) => (message.replies.length > 0 ? { ...message, replies: removeMessage(message.replies, id) } : message));
}

function conversationHeading(conversationId: string) {
  const channel = channels.find((candidate) => candidate.id === conversationId);
  if (channel) return { title: `#${channel.name}`, description: channel.topic, placeholder: `Message #${channel.name}` };
  const person = people[conversationId];
  return { title: person.name, description: `Direct message · ${person.status}`, placeholder: `Message ${person.name}` };
}

export function TeamChatExample() {
  const [activeId, setActiveId] = useState("support");
  const [conversations, setConversations] = useState<Record<string, TeamMessage[]>>({ support: supportMessages });
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const threadOpener = useRef<HTMLElement | null>(null);
  const messages = conversations[activeId] ?? [];
  const heading = conversationHeading(activeId);
  const threadParent = messages.find((message) => message.id === openThreadId);

  function setMessages(update: (current: TeamMessage[]) => TeamMessage[]) {
    setConversations((current) => ({ ...current, [activeId]: update(current[activeId] ?? []) }));
  }

  function openConversation(conversationId: string) {
    setActiveId(conversationId);
    setOpenThreadId(null);
  }

  function reactTo(id: string, emoji: string) {
    setMessages((current) =>
      updateMessage(current, id, (message) => ({ ...message, reactions: toggleReaction(message.reactions, emoji, viewerId) })),
    );
  }

  function openThread(id: string, opener: HTMLElement) {
    threadOpener.current = opener;
    setOpenThreadId(id);
  }

  function closeThread() {
    flushSync(() => setOpenThreadId(null));
    threadOpener.current?.focus();
  }

  function renderMessages(list: TeamMessage[], options: { inThread: boolean }) {
    return list.map((message, index) => (
      <TeamChatMessage
        key={message.id}
        message={message}
        continuation={continuesPrevious(list[index - 1], message)}
        onToggleReaction={(emoji) => reactTo(message.id, emoji)}
        onOpenThread={options.inThread ? undefined : (opener) => openThread(message.id, opener)}
        onDelete={() => setMessages((current) => removeMessage(current, message.id))}
      />
    ));
  }

  const thread = threadParent ? (
    <ChatLayout key={threadParent.id} chrome="embedded" className="h-full">
      <ChatLayoutHeader>
        <ChatLayoutTitle render={(props) => <h3 {...props} />}>Thread</ChatLayoutTitle>
        <ChatLayoutDescription>{heading.title}</ChatLayoutDescription>
        <ChatLayoutActions>
          <Button variant="ghost" size="xs" iconOnly aria-label="Close thread" onClick={closeThread}>
            <XIcon aria-hidden="true" />
          </Button>
        </ChatLayoutActions>
      </ChatLayoutHeader>
      <ChatThread
        composer={
          <MessageComposer
            placeholder="Reply…"
            autoFocus
            onSend={(text) =>
              setMessages((current) =>
                updateMessage(current, threadParent.id, (message) => ({ ...message, replies: [...message.replies, newMessage(text)] })),
              )
            }
          />
        }
      >
        {renderMessages([threadParent], { inThread: true })}
        <TranscriptDivider>
          {threadParent.replies.length} {threadParent.replies.length === 1 ? "reply" : "replies"}
        </TranscriptDivider>
        {renderMessages(threadParent.replies, { inThread: true })}
      </ChatThread>
    </ChatLayout>
  ) : null;

  return (
    <div className="h-[min(720px,80vh)] min-h-150 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background">
      <TeamChatBlock
        layout="contained"
        sidebar={<TeamChatSidebar activeId={activeId} onSelect={openConversation} />}
        thread={thread}
        threadLabel="Thread replies"
      >
        <ChatLayout key={activeId} chrome="embedded" className="h-full">
          <ChatLayoutHeader>
            <SidebarTrigger className="lg:hidden" />
            <ChatLayoutTitle render={(props) => <h2 {...props} />}>{heading.title}</ChatLayoutTitle>
            <ChatLayoutDescription>{heading.description}</ChatLayoutDescription>
            <ChatLayoutActions>
              <Button variant="ghost" size="xs" aria-label={`${Object.keys(people).length} members`}>
                <UsersIcon aria-hidden="true" />
                {Object.keys(people).length}
              </Button>
            </ChatLayoutActions>
          </ChatLayoutHeader>
          <ChatThread
            composer={
              <>
                <ChatThreadScrollButton />
                <MessageComposer
                  placeholder={heading.placeholder}
                  onSend={(text) => setMessages((current) => [...current, newMessage(text)])}
                />
              </>
            }
          >
            {groupByDay(messages).map((day) => (
              <Fragment key={day.label}>
                <TranscriptDivider>{day.label}</TranscriptDivider>
                {renderMessages(day.messages, { inThread: false })}
              </Fragment>
            ))}
            <ChatTypingIndicator>{activeId === "support" ? `${people.leo.name} is typing…` : null}</ChatTypingIndicator>
          </ChatThread>
        </ChatLayout>
      </TeamChatBlock>
    </div>
  );
}
