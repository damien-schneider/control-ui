"use client";

import { useState } from "react";
import { TeamChatBlock } from "@/components/control-ui/blocks/team-chat";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import { ChatLayout, ChatLayoutDescription, ChatLayoutHeader, ChatLayoutTitle, ChatThread } from "@/components/control-ui/chat-layout";
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageRow,
  ChatMessageTime,
} from "@/components/control-ui/chat-message";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/control-ui/ui/sidebar";

type Message = { id: string; author: string; sentAt: string; text: string };

export default function TeamChatPage({ messages, onSend }: { messages: Message[]; onSend: (text: string) => Promise<void> }) {
  const [draft, setDraft] = useState("");

  return (
    <TeamChatBlock
      className="h-svh"
      sidebar={
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Channels</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>#support</SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      }
    >
      <ChatLayout chrome="embedded" className="h-full">
        <ChatLayoutHeader>
          <ChatLayoutTitle render={(props) => <h1 {...props} />}>#support</ChatLayoutTitle>
          <ChatLayoutDescription>Customer conversations</ChatLayoutDescription>
        </ChatLayoutHeader>
        <ChatThread
          composer={
            <ChatComposer
              value={draft}
              onValueChange={setDraft}
              onSubmit={async ({ value, clear }) => {
                await onSend(value);
                clear();
              }}
            >
              <ChatComposerShell>
                <ChatComposerTextarea placeholder="Message #support" />
                <ChatComposerToolbar>
                  <ChatComposerSubmit>Send</ChatComposerSubmit>
                </ChatComposerToolbar>
              </ChatComposerShell>
            </ChatComposer>
          }
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} from="participant" layout="flat" authorLabel={message.author}>
              <ChatMessageRow>
                <ChatMessageAvatar>{message.author.slice(0, 1)}</ChatMessageAvatar>
                <ChatMessageBody>
                  <ChatMessageHeader>
                    <ChatMessageAuthor>{message.author}</ChatMessageAuthor>
                    <ChatMessageTime dateTime={message.sentAt}>{new Date(message.sentAt).toLocaleTimeString()}</ChatMessageTime>
                  </ChatMessageHeader>
                  <ChatMessageContent>{message.text}</ChatMessageContent>
                </ChatMessageBody>
              </ChatMessageRow>
            </ChatMessage>
          ))}
        </ChatThread>
      </ChatLayout>
    </TeamChatBlock>
  );
}
