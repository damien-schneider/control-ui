"use client";

import type { ComponentProps } from "react";
import { createContext, useContext } from "react";

import type { ChatMessageProps } from "@/components/control-ui/contracts";
import { useChatMessage } from "@/components/control-ui/hooks/use-chat-message";
import { cn } from "@/components/control-ui/lib/cn";
import { skinPaint, skinSlot } from "@/components/control-ui/skin";

type ChatMessageContextValue = ReturnType<typeof useChatMessage>;

const ChatMessageContext = createContext<ChatMessageContextValue | null>(null);

function useChatMessageContext() {
  const context = useContext(ChatMessageContext);
  if (!context) throw new Error("ChatMessage compound components must be rendered inside <ChatMessage>.");
  return context;
}

export function ChatMessage({
  from,
  state = "idle",
  density = "comfortable",
  tone = "neutral",
  className,
  children,
  ...props
}: ChatMessageProps) {
  const message = useChatMessage({ from, state, density, tone });

  return (
    <ChatMessageContext.Provider value={message}>
      {/* fx anchor candidate: "chat-message:stream-layer" — anchors are added on demand (see /architecture#extension-contract);
          persistent-state fx (streaming glow, tone washes) need no anchor: style the emitted data-state/data-tone in CSS. */}
      <article
        data-control-ui="chat-message"
        data-slot="root"
        data-role={from}
        data-state={state}
        data-density={density}
        data-tone={tone}
        className={cn("w-full", skinSlot("chat-message", "root", { role: from, state, density, tone }), className)}
        {...props}
      >
        {children}
      </article>
    </ChatMessageContext.Provider>
  );
}

export type ChatMessageRowProps = ComponentProps<"div">;

export function ChatMessageRow({ className, children, ...props }: ChatMessageRowProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-slot="row"
      className={cn(
        "group flex w-full gap-2",
        message.isUser ? "justify-end" : "justify-start",
        message.isCompact ? "py-1" : "py-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type ChatMessageAvatarProps = ComponentProps<"div">;

export function ChatMessageAvatar({ className, ...props }: ChatMessageAvatarProps) {
  return (
    <div
      data-control-ui="chat-message"
      data-slot="avatar"
      className={cn(
        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-meta text-muted-foreground",
        skinSlot("chat-message", "avatar", {}),
        className,
      )}
      {...props}
    />
  );
}

export type ChatMessageBodyProps = ComponentProps<"div">;

export function ChatMessageBody({ className, ...props }: ChatMessageBodyProps) {
  const message = useChatMessageContext();

  return <div className={cn("min-w-0", message.isUser ? "max-w-[76%]" : "max-w-[80%] flex-1", className)} {...props} />;
}

export type ChatMessageHeaderProps = ComponentProps<"div">;

export function ChatMessageHeader({ className, ...props }: ChatMessageHeaderProps) {
  return <div className={cn("mb-1 flex items-center gap-2 px-1 text-meta text-muted-foreground", className)} {...props} />;
}

export type ChatMessageContentProps = ComponentProps<"div">;

export function ChatMessageContent({ className, ...props }: ChatMessageContentProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-slot="content"
      data-role={message.from}
      className={cn(
        "text-body leading-5",
        message.isUser &&
          "rounded-field rounded-se-lg bg-primary px-[var(--padding-x)] py-[var(--padding-y)] text-primary-foreground shadow-sm",
        // Streaming assistant reply: shimmer-text sweep IS the "generating" indicator (replaces caret dot, which it'd hide anyway); settles to --foreground when done.
        // Pack can swap streaming paint via chat-message-streaming slot.
        message.isAssistant && (message.isStreaming ? (skinPaint("chat-message", "streaming", {}) ?? "shimmer-text") : "text-foreground"),
        skinSlot("chat-message", "content", { role: message.from }),
        className,
      )}
      {...props}
    />
  );
}

export type ChatMessageActionsProps = ComponentProps<"div">;

export function ChatMessageActions({ className, ...props }: ChatMessageActionsProps) {
  return <div className={cn("mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", className)} {...props} />;
}
