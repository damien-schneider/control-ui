"use client";

import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext, useEffect, useRef } from "react";

import type { ChatMessageProps } from "@/components/control-ui/hooks/use-chat-message";
import {
  chatAuthorLabels,
  chatMessageStatusLabels,
  chatMessageTransition,
  useChatMessage,
  useChatThreadAnnounce,
} from "@/components/control-ui/hooks/use-chat-message";
import type { ChatMessageKnobStyle } from "@/components/control-ui/knob-contracts/chat-message-knobs";
import { cn } from "@/components/control-ui/lib/cn";

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
  authorLabel = chatAuthorLabels[from],
  statusLabels,
  className,
  children,
  ...props
}: ChatMessageProps) {
  const message = useChatMessage({ from, state, density });
  const announce = useChatThreadAnnounce();
  const previousState = useRef(state);
  const pendingLabel = statusLabels?.pending ?? chatMessageStatusLabels.pending;
  const repliedLabel = statusLabels?.replied ?? chatMessageStatusLabels.replied;
  const errorLabel = statusLabels?.error ?? chatMessageStatusLabels.error;

  useEffect(() => {
    const previous = previousState.current;
    previousState.current = state;
    if (from === "user") return;
    const announcement = chatMessageTransition(previous, state, { pending: pendingLabel, replied: repliedLabel, error: errorLabel });
    if (announcement !== null) announce(announcement);
  }, [announce, from, state, pendingLabel, repliedLabel, errorLabel]);

  return (
    <ChatMessageContext.Provider value={message}>
      <article
        data-control-ui="chat-message"
        data-control-family="chat-message"
        data-slot="root"
        data-role={from}
        data-state={state}
        data-density={density}
        aria-label={authorLabel}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </article>
    </ChatMessageContext.Provider>
  );
}

export type ChatMessageRowProps = ComponentProps<"div"> & { style?: CSSProperties & ChatMessageKnobStyle };

export function ChatMessageRow({ className, children, ...props }: ChatMessageRowProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="row"
      className={cn("flex w-full", message.isUser ? "justify-end" : "justify-start", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type ChatMessageAvatarProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

export function ChatMessageAvatar({ className, ...props }: ChatMessageAvatarProps) {
  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="avatar"
      className={cn("flex shrink-0 items-center justify-center", className)}
      {...props}
    />
  );
}

export type ChatMessageBodyProps = ComponentProps<"div"> & { style?: CSSProperties & ChatMessageKnobStyle };

export function ChatMessageBody({ className, ...props }: ChatMessageBodyProps) {
  useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="body"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

export type ChatMessageHeaderProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

export function ChatMessageHeader({ className, ...props }: ChatMessageHeaderProps) {
  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="header"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

export type ChatMessageContentProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

export function ChatMessageContent({ className, ...props }: ChatMessageContentProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="content"
      data-role={message.from}
      data-streaming={message.isStreaming ? "" : undefined}
      className={cn(message.isUser && "px-[var(--padding-x)] py-[var(--padding-y)]", className)}
      {...props}
    />
  );
}

export type ChatMessagePendingProps = Omit<ComponentProps<"div">, "style" | "children"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

/** Visual only: the pending transition is announced by `ChatMessage` through the thread's status region. */
export function ChatMessagePending({ className, ...props }: ChatMessagePendingProps) {
  const message = useChatMessageContext();
  if (!message.isPending) return null;

  return (
    <div
      aria-hidden="true"
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="pending"
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <span />
      <span />
      <span />
    </div>
  );
}

export type ChatMessageActionsProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

export function ChatMessageActions({ className, ...props }: ChatMessageActionsProps) {
  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="actions"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}
