"use client";

import type { ComponentProps, CSSProperties, JSX } from "react";
import { useEffect, useRef } from "react";

import type { ChatMessageProps } from "@/components/control-ui/hooks/use-chat-message";
import {
  ChatMessageStateProvider,
  chatAuthorLabels,
  chatMessageStatusLabels,
  chatMessageTransition,
  useChatMessage,
  useChatMessageContext,
  useChatThreadAnnounce,
} from "@/components/control-ui/hooks/use-chat-message";
import type { ChatMessageKnobStyle } from "@/components/control-ui/knob-contracts/chat-message-knobs";
import { cn } from "@/components/control-ui/lib/cn";

// biome-ignore lint/performance/noBarrelFile: Preserve the chat message install-facing API.
export {
  ChatMessageReaction,
  type ChatMessageReactionProps,
  ChatMessageReactions,
  type ChatMessageReactionsProps,
  ChatMessageReplies,
  type ChatMessageRepliesProps,
  ChatMessageReplySummary,
  type ChatMessageReplySummaryProps,
  ChatTypingIndicator,
  type ChatTypingIndicatorProps,
} from "@/components/control-ui/chat-message/social";

export type ChatMessagePartProps<Element extends keyof JSX.IntrinsicElements> = Omit<ComponentProps<Element>, "style"> & {
  style?: CSSProperties & ChatMessageKnobStyle;
};

export function ChatMessage({
  from,
  state = "idle",
  density = "comfortable",
  layout = "bubble",
  continuation = false,
  authorLabel = chatAuthorLabels[from],
  statusLabels,
  className,
  children,
  ...props
}: ChatMessageProps) {
  const message = useChatMessage({ from, state, density, layout, continuation });
  const announce = useChatThreadAnnounce();
  const previousState = useRef(state);
  const pendingLabel = statusLabels?.pending ?? chatMessageStatusLabels.pending;
  const repliedLabel = statusLabels?.replied ?? chatMessageStatusLabels.replied;
  const errorLabel = statusLabels?.error ?? chatMessageStatusLabels.error;

  useEffect(() => {
    const previous = previousState.current;
    previousState.current = state;
    if (from === "user" || from === "participant") return;
    const announcement = chatMessageTransition(previous, state, { pending: pendingLabel, replied: repliedLabel, error: errorLabel });
    if (announcement !== null) announce(announcement);
  }, [announce, from, state, pendingLabel, repliedLabel, errorLabel]);

  return (
    <ChatMessageStateProvider value={message}>
      <article
        data-control-ui="chat-message"
        data-control-family="chat-message"
        data-slot="root"
        data-role={from}
        data-state={state}
        data-density={density}
        data-layout={layout}
        data-continuation={continuation ? "" : undefined}
        aria-label={authorLabel}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </article>
    </ChatMessageStateProvider>
  );
}

export type ChatMessageRowProps = ChatMessagePartProps<"div">;

export function ChatMessageRow({ className, children, ...props }: ChatMessageRowProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="row"
      data-layout={message.layout}
      data-density={message.density}
      data-continuation={message.continuation ? "" : undefined}
      className={cn("relative flex w-full", message.isEndAligned ? "justify-end" : "justify-start", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type ChatMessageAvatarProps = ChatMessagePartProps<"div">;

export function ChatMessageAvatar({ className, ...props }: ChatMessageAvatarProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="avatar"
      data-layout={message.layout}
      data-continuation={message.continuation ? "" : undefined}
      className={cn("flex shrink-0 items-center justify-center", className)}
      {...props}
    />
  );
}

export type ChatMessageBodyProps = ChatMessagePartProps<"div">;

export function ChatMessageBody({ className, ...props }: ChatMessageBodyProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="body"
      data-layout={message.layout}
      data-role={message.from}
      className={cn("flex min-w-0 flex-col", className)}
      {...props}
    />
  );
}

export type ChatMessageHeaderProps = ChatMessagePartProps<"div">;

export function ChatMessageHeader({ className, ...props }: ChatMessageHeaderProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="header"
      data-layout={message.layout}
      data-role={message.from}
      data-state={message.state}
      className={cn("flex min-w-0 flex-wrap items-baseline", className)}
      {...props}
    />
  );
}

export type ChatMessageAuthorProps = ChatMessagePartProps<"span">;

export function ChatMessageAuthor({ className, ...props }: ChatMessageAuthorProps) {
  const message = useChatMessageContext();

  return (
    <span
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="author"
      data-layout={message.layout}
      className={cn("truncate", className)}
      {...props}
    />
  );
}

export type ChatMessageTimeProps = ChatMessagePartProps<"time"> & {
  dateTime: string;
};

export function ChatMessageTime({ className, ...props }: ChatMessageTimeProps) {
  return (
    <time
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="time"
      className={cn("whitespace-nowrap tabular-nums", className)}
      {...props}
    />
  );
}

export type ChatMessageContentProps = ChatMessagePartProps<"div">;

export function ChatMessageContent({ className, ...props }: ChatMessageContentProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="content"
      data-role={message.from}
      data-streaming={message.isStreaming ? "" : undefined}
      className={cn(message.isBubble && "px-[var(--padding-x)] py-[var(--padding-y)]", className)}
      {...props}
    />
  );
}

export type ChatMessagePendingProps = Omit<ChatMessagePartProps<"div">, "children">;

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

export type ChatMessageFooterProps = ChatMessagePartProps<"div">;

export function ChatMessageFooter({ className, ...props }: ChatMessageFooterProps) {
  const message = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="footer"
      data-layout={message.layout}
      data-role={message.from}
      data-state={message.state}
      className={cn("flex flex-wrap items-center", className)}
      {...props}
    />
  );
}

export type ChatMessageActionsProps = ChatMessagePartProps<"div">;

export function ChatMessageActions({ className, children, ...props }: ChatMessageActionsProps) {
  const { layout } = useChatMessageContext();

  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="actions"
      data-layout={layout}
      className={cn("flex items-center", className)}
      {...props}
    >
      {layout === "flat" ? (
        <div
          aria-hidden="true"
          data-control-ui="chat-message"
          data-control-family="popup"
          data-popup-kind="toolbar"
          data-popup-part="surface"
          data-popup-static=""
          data-surface="floating"
          data-slot="actions-surface"
          className="pointer-events-none absolute inset-0 -z-1"
        />
      ) : null}
      {children}
    </div>
  );
}
