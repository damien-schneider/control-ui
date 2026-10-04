"use client";

import { CornerDownRightIcon } from "lucide-react";
import { type ComponentProps, lazy, type ReactNode, Suspense, useState } from "react";
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
import type { MarkdownEditorStatus } from "@/components/control-ui/markdown-editor";
import type { MarkdownEditorMention } from "@/components/control-ui/markdown-editor/suggestions";
import type { MarkdownImageUploader } from "@/components/control-ui/markdown-editor/uploads";
import { Button } from "@/components/control-ui/ui/button";
import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";
import { Markdown } from "@/components/control-ui/ui/markdown";
import { Text } from "@/components/control-ui/ui/typography";

const DiscussionMarkdownInput = lazy(() => import("./discussion-markdown-input"));

export type DiscussionComposerProps = Omit<ComponentProps<typeof ChatComposer>, "submitKey" | "children"> & {
  label: string;
  placeholder?: string;
  submitLabel?: ReactNode;
  secondaryAction?: ReactNode;
  hint?: ReactNode;
  autoFocus?: boolean;
  format?: "plain" | "markdown";
  onUploadImage?: MarkdownImageUploader;
  mentions?: readonly MarkdownEditorMention[];
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
  format = "plain",
  onUploadImage,
  mentions,
  onSubmit,
  ...props
}: DiscussionComposerProps) {
  const [draft, setDraft] = useState(props.defaultValue ?? "");
  const value = props.value ?? draft;
  const [status, setStatus] = useState<MarkdownEditorStatus>({ isEmpty: false, hasPendingUploads: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blocked = format === "markdown" && (status.isEmpty || status.hasPendingUploads);
  return (
    <ChatComposer
      submitKey="mod-enter"
      {...props}
      value={value}
      onValueChange={(next) => {
        setDraft(next);
        props.onValueChange?.(next);
      }}
      state={submitting ? "submitting" : props.state}
      onSubmit={async (payload) => {
        if (blocked || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
          await onSubmit?.({ ...payload, value: format === "markdown" ? value : payload.value });
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Couldn't post your comment. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <ChatComposerShell>
        {format === "markdown" ? (
          <Suspense fallback={<ChatComposerTextarea aria-label={label} placeholder={placeholder} disabled />}>
            <DiscussionMarkdownInput
              label={label}
              placeholder={placeholder}
              autoFocus={autoFocus}
              onUploadImage={onUploadImage}
              mentions={mentions}
              onStatusChange={setStatus}
              blocked={blocked}
            />
          </Suspense>
        ) : (
          <ChatComposerTextarea
            aria-label={label}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-keyshortcuts="Meta+Enter Control+Enter"
          />
        )}
        {error ? (
          <Text as="p" role="alert" className="px-3">
            {error}
          </Text>
        ) : null}
        <ChatComposerToolbar>
          <Text size="caption" tone="muted" className="flex min-w-0 items-center gap-1.5">
            {hint}
          </Text>
          <span className="flex items-center gap-2">
            {secondaryAction}
            <ChatComposerSubmit disabled={blocked || submitting}>{submitLabel}</ChatComposerSubmit>
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
  children?: ReactNode;
  markdown?: string;
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
  markdown,
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
          <ChatMessageContent>{markdown !== undefined ? <Markdown content={markdown} mode="static" /> : children}</ChatMessageContent>
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
