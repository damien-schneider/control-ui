"use client";

import type { ChatMessagePartProps } from "@/components/control-ui/chat-message";
import { useChatMessageContext } from "@/components/control-ui/hooks/use-chat-message";
import { cn } from "@/components/control-ui/lib/cn";

export type ChatMessageReactionsProps = ChatMessagePartProps<"div">;

export function ChatMessageReactions({ className, "aria-label": ariaLabel = "Reactions", ...props }: ChatMessageReactionsProps) {
  const message = useChatMessageContext();

  return (
    // biome-ignore lint/a11y/useSemanticElements: A reaction strip groups toggle buttons, not form fields.
    <div
      role="group"
      aria-label={ariaLabel}
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="reactions"
      data-layout={message.layout}
      data-role={message.from}
      className={cn("flex flex-wrap items-center", className)}
      {...props}
    />
  );
}

type ChatMessageReactionChip = {
  emoji: string;
  count: number;
  pressed?: boolean;
  label?: string;
};

export type ChatMessageReactionProps =
  | (Omit<ChatMessagePartProps<"button">, "children" | "onClick"> &
      ChatMessageReactionChip & { onPressedChange: (pressed: boolean) => void })
  | (Omit<ChatMessagePartProps<"span">, "children"> &
      ChatMessageReactionChip & {
        /** Omitted for viewers who can see reactions but not add them: the chip renders as static text. */
        onPressedChange?: undefined;
      });

function reactionAttributes(pressed: boolean, className: string | undefined) {
  return {
    "data-control-ui": "chat-message",
    "data-control-family": "chat-message",
    "data-slot": "reaction",
    "data-pressed": pressed ? "" : undefined,
    className: cn("inline-flex items-center", className),
  };
}

function ReactionChipContent({ emoji, count, label }: Required<Omit<ChatMessageReactionChip, "pressed">>) {
  return (
    <>
      <span aria-hidden="true" data-control-ui="chat-message" data-control-family="chat-message" data-slot="reaction-emoji">
        {emoji}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {count}
      </span>
      <span className="sr-only">{label}</span>
    </>
  );
}

export function ChatMessageReaction(props: ChatMessageReactionProps) {
  const chip = <ReactionChipContent emoji={props.emoji} count={props.count} label={props.label ?? `${props.emoji} ${props.count}`} />;

  if (props.onPressedChange === undefined) {
    const { emoji, count, pressed = false, label, onPressedChange, className, ...spanProps } = props;
    return (
      <span {...reactionAttributes(pressed, className)} {...spanProps}>
        {chip}
      </span>
    );
  }

  const { emoji, count, pressed = false, label, onPressedChange, className, ...buttonProps } = props;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      {...reactionAttributes(pressed, className)}
      {...buttonProps}
    >
      {chip}
    </button>
  );
}

export type ChatMessageReplySummaryProps = ChatMessagePartProps<"button">;

export function ChatMessageReplySummary({ className, type = "button", ...props }: ChatMessageReplySummaryProps) {
  return (
    <button
      type={type}
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="reply-summary"
      className={cn("inline-flex max-w-full items-center self-start text-start", className)}
      {...props}
    />
  );
}

export type ChatMessageRepliesProps = ChatMessagePartProps<"div">;

/** Replies shown in place, nested under the message they answer, as in comment discussions. */
export function ChatMessageReplies({ className, ...props }: ChatMessageRepliesProps) {
  return (
    <div
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="replies"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export type ChatTypingIndicatorProps = ChatMessagePartProps<"div">;

/** A polite status region that stays mounted; pass children only while someone is typing so the change is announced. */
export function ChatTypingIndicator({ className, children, ...props }: ChatTypingIndicatorProps) {
  const someoneIsTyping = children !== null && children !== undefined && children !== false && children !== "";

  return (
    <div
      role="status"
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="root"
      data-kind="typing"
      className={cn("flex min-w-0 items-center", className)}
      {...props}
    >
      {someoneIsTyping ? (
        <>
          <span
            aria-hidden="true"
            data-control-ui="chat-message"
            data-control-family="chat-message"
            data-slot="typing-dots"
            className="inline-flex items-center"
          >
            <span />
            <span />
            <span />
          </span>
          <span className="truncate">{children}</span>
        </>
      ) : null}
    </div>
  );
}
