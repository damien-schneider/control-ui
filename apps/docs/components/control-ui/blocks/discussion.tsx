"use client";

import { CornerDownRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
} from "@/components/control-ui/chat-composer";
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageFooter,
  ChatMessageHeader,
  ChatMessageReplies,
  ChatMessageRow,
  ChatMessageTime,
} from "@/components/control-ui/chat-message";
import { Button } from "@/components/control-ui/ui/button";
import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";

export type DiscussionComposerProps = Omit<ComponentProps<typeof ChatComposer>, "submitKey" | "children"> & {
  label: string;
  placeholder?: string;
  submitLabel?: ReactNode;
  secondaryAction?: ReactNode;
  hint?: ReactNode;
  autoFocus?: boolean;
};

export function DiscussionComposer({
  label,
  placeholder,
  submitLabel = "Post",
  secondaryAction,
  hint = (
    <>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
      <span>to post</span>
    </>
  ),
  autoFocus,
  ...props
}: DiscussionComposerProps) {
  return (
    <ChatComposer submitKey="mod-enter" {...props}>
      <ChatComposerShell>
        <ChatComposerTextarea
          aria-label={label}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-keyshortcuts="Meta+Enter Control+Enter"
        />
        <ChatComposerToolbar>
          <span className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">{hint}</span>
          <span className="flex items-center gap-2">
            {secondaryAction}
            <ChatComposerSubmit>{submitLabel}</ChatComposerSubmit>
          </span>
        </ChatComposerToolbar>
      </ChatComposerShell>
    </ChatComposer>
  );
}

export type DiscussionCommentProps = Omit<ComponentProps<typeof ChatMessage>, "from" | "layout" | "authorLabel" | "children"> & {
  author: string;
  avatar?: ReactNode;
  sentAt: string;
  timeLabel: ReactNode;
  edited?: boolean;
  children: ReactNode;
  actions?: ReactNode;
  onReply?: () => void;
  replyLabel?: ReactNode;
  replies?: ReactNode;
  replyComposer?: ReactNode;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function DiscussionComment({
  author,
  avatar,
  sentAt,
  timeLabel,
  edited = false,
  children,
  actions,
  onReply,
  replyLabel = "Reply",
  replies,
  replyComposer,
  ...props
}: DiscussionCommentProps) {
  const hasReplies = Boolean(replies) || Boolean(replyComposer);

  return (
    <ChatMessage from="participant" layout="flat" authorLabel={author} {...props}>
      <ChatMessageRow>
        <ChatMessageAvatar>{avatar ?? <span aria-hidden="true">{initials(author)}</span>}</ChatMessageAvatar>
        <ChatMessageBody>
          <ChatMessageHeader>
            <ChatMessageAuthor>{author}</ChatMessageAuthor>
            <ChatMessageTime dateTime={sentAt}>{timeLabel}</ChatMessageTime>
            {edited ? <span>(edited)</span> : null}
          </ChatMessageHeader>
          <ChatMessageContent>{children}</ChatMessageContent>
          {onReply ? (
            <ChatMessageFooter>
              <Button variant="ghost" size="xs" onClick={onReply} className="-ms-2">
                <CornerDownRightIcon aria-hidden="true" />
                {replyLabel}
              </Button>
            </ChatMessageFooter>
          ) : null}
          {hasReplies ? (
            <ChatMessageReplies>
              {replies}
              {replyComposer}
            </ChatMessageReplies>
          ) : null}
        </ChatMessageBody>
        {actions ? <ChatMessageActions>{actions}</ChatMessageActions> : null}
      </ChatMessageRow>
    </ChatMessage>
  );
}
