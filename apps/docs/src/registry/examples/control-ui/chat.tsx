"use client";

import { MastraReactProvider, MessageFactory, type MessageRoleRendererProps, type MessageRoleRenderers, useChat } from "@mastra/react";
import { type ReactNode, useState } from "react";

import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";
import { ChatBlock } from "@/components/control-ui/blocks/chat";
import {
  ChatInput,
  ChatInputAccent,
  ChatInputShell,
  ChatInputSubmit,
  ChatInputToolbar,
  ChatInputTools,
} from "@/components/control-ui/chat-input";
import { ChatInputEditor } from "@/components/control-ui/chat-input-editor";
import { mentionExtension } from "@/components/control-ui/chat-input-editor/extensions/mention";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { ChatThought, ChatTurn } from "@/components/control-ui/chat-scene";
import type { ChatInputSubmitPayload, ChatState, TriggerConfig, TriggerMenuItemData } from "@/components/control-ui/contracts";
import {
  InlineAttachment,
  InlineAttachmentContent,
  InlineAttachmentMedia,
  InlineAttachmentTitle,
} from "@/components/control-ui/inline-attachment";
import {
  MarkdownBlock,
  MarkdownBlockContent,
  MarkdownBlockCopy,
  MarkdownBlockHeader,
  MarkdownBlockTitle,
} from "@/components/control-ui/markdown-block";
import { Button } from "@/components/control-ui/ui/button";
import { CHAT_PREVIEW_AGENT_ID } from "@/mastra/chat-preview-contract";
import { assistantLead, noteMarkdown, userPrompt } from "../shared";

// "/" runs a command (no pill); "@" inserts a mention pill the mention extension serializes on submit.
const slashCommands: TriggerMenuItemData[] = [
  { id: "summarize", label: "summarize", description: "Condense the thread", icon: "✦" },
  { id: "translate", label: "translate", description: "To another language", icon: "🌐" },
  { id: "rewrite", label: "rewrite", description: "Improve the tone", icon: "✎" },
];

const mentionSources: TriggerMenuItemData[] = [
  { id: "notion", label: "Notion", kind: "connector", description: "Connector", icon: "◈", keywords: ["docs", "wiki"] },
  { id: "sam", label: "Sam", kind: "user", description: "Teammate", icon: "🧑" },
  { id: "spec", label: "spec.md", kind: "file", description: "File", icon: "📄", keywords: ["doc"] },
];

const composerTriggers: TriggerConfig[] = [
  { char: "/", items: slashCommands, insert: "none" },
  { char: "@", items: mentionSources },
];

const editorExtensions = [mentionExtension({ triggers: composerTriggers, side: "top" })];
const responseCopy = `${assistantLead}\n\n${noteMarkdown}`;

export function ChatExample() {
  return (
    <MastraReactProvider apiPrefix="/api/mastra">
      <MastraChatPreview />
    </MastraReactProvider>
  );
}

function renderMastraTurn(from: "user" | "assistant", children: ReactNode, state: ChatState = "idle") {
  return (
    <ChatTurn from={from} aria-live={from === "assistant" ? "polite" : undefined}>
      <ChatMessage from={from} density="compact" state={state}>
        <ChatMessageRow className="py-0">
          <ChatMessageBody className={from === "assistant" ? "max-w-full flex-1" : undefined}>
            <ChatMessageContent className={from === "assistant" ? "overflow-visible text-sm leading-7" : "text-sm leading-6"}>
              {children}
            </ChatMessageContent>
          </ChatMessageBody>
        </ChatMessageRow>
      </ChatMessage>
    </ChatTurn>
  );
}

function mastraMessageRoles(streamingMessageId: string | undefined): MessageRoleRenderers {
  return {
    User: ({ children }: MessageRoleRendererProps) => renderMastraTurn("user", children),
    Assistant: ({ children, message }: MessageRoleRendererProps) =>
      renderMastraTurn("assistant", children, message.id === streamingMessageId ? "streaming" : "idle"),
    System: () => null,
    Signal: ({ children }: MessageRoleRendererProps) => renderMastraTurn("assistant", children),
  };
}

function PreviewConversation({ onEdit }: { onEdit: (value: string) => void }) {
  return (
    <>
      <ChatTurn from="user">
        <div className="flex w-[min(70%,24rem)] flex-col items-end gap-2">
          <InlineAttachment name="handwritten-note.jpeg">
            <InlineAttachmentMedia />
            <InlineAttachmentContent>
              <InlineAttachmentTitle />
            </InlineAttachmentContent>
          </InlineAttachment>
          <ChatMessage from="user" density="compact">
            <ChatMessageRow className="py-0">
              <ChatMessageBody className="max-w-full">
                <ChatMessageContent className="text-sm leading-6">{userPrompt}</ChatMessageContent>
              </ChatMessageBody>
            </ChatMessageRow>
          </ChatMessage>
        </div>
        <ActionBar align="end" label="Your message actions" copyValue={userPrompt} editValue={userPrompt} onEdit={onEdit}>
          <ActionBarCopy />
          <ActionBarEdit />
        </ActionBar>
      </ChatTurn>

      <ChatTurn from="assistant">
        <ChatThought />
        <ChatMessage from="assistant" density="compact">
          <ChatMessageRow className="py-0">
            <ChatMessageBody className="max-w-full flex-1">
              <ChatMessageContent className="overflow-visible text-sm leading-7">
                <p>{assistantLead}</p>
                <MarkdownBlock code={noteMarkdown}>
                  <MarkdownBlockHeader>
                    <MarkdownBlockTitle />
                    <MarkdownBlockCopy />
                  </MarkdownBlockHeader>
                  <MarkdownBlockContent />
                </MarkdownBlock>
              </ChatMessageContent>
            </ChatMessageBody>
          </ChatMessageRow>
        </ChatMessage>
        <ActionBar label="Response actions" copyValue={responseCopy}>
          <ActionBarCopy />
          <ActionBarItem>Share</ActionBarItem>
          <ActionBarItem>Switch model</ActionBarItem>
          <ActionBarItem>More</ActionBarItem>
        </ActionBar>
      </ChatTurn>
    </>
  );
}

function MastraChatPreview() {
  const [inputValue, setInputValue] = useState("");
  const { cancelRun, isRunning, messages, sendMessage } = useChat({ agentId: CHAT_PREVIEW_AGENT_ID });
  const latestMessage = messages.at(-1);
  const streamingMessageId = isRunning && latestMessage?.role === "assistant" ? latestMessage.id : undefined;
  const messageRoles = mastraMessageRoles(streamingMessageId);

  async function submitMessage({ value, clear }: ChatInputSubmitPayload) {
    clear();
    await sendMessage({ message: value });
  }

  return (
    <div className="p-4">
      <ChatBlock
        className="border shadow-soft"
        composer={
          <ChatInput
            density="compact"
            state={isRunning ? "submitting" : "idle"}
            value={inputValue}
            onValueChange={setInputValue}
            onSubmit={submitMessage}
          >
            <ChatInputShell>
              <ChatInputAccent />
              <ChatInputEditor placeholder="Ask the assistant… type / or @" extensions={editorExtensions} />
              <ChatInputToolbar>
                <ChatInputTools>
                  <span>Attach</span>
                  <span>Mastra mock</span>
                </ChatInputTools>
                {isRunning ? (
                  <Button type="button" size="xs" variant="quiet" onClick={cancelRun}>
                    Stop
                  </Button>
                ) : (
                  <ChatInputSubmit>Send</ChatInputSubmit>
                )}
              </ChatInputToolbar>
            </ChatInputShell>
          </ChatInput>
        }
      >
        <PreviewConversation onEdit={setInputValue} />
        {messages.map((message) => (
          <MessageFactory
            key={message.id}
            message={message}
            roles={messageRoles}
            Text={({ text }) => <span>{text}</span>}
            fallback={(part) => <span>Unsupported preview part: {part.type}</span>}
          />
        ))}
      </ChatBlock>
    </div>
  );
}
