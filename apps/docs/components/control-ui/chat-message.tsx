"use client";

import type { ComponentProps, CSSProperties, JSX } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";

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
import { LiveStatus } from "@/components/control-ui/ui/live-status";

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

export type ChatMessageEditableProps = Omit<ChatMessagePartProps<"div">, "onError"> & {
  value: string;
  /** Persist the text in the host. Reject to keep the draft open for retry. */
  onSave: (value: string) => void | Promise<void>;
  onSaveError?: (error: unknown) => void;
  editorLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  savingLabel?: string;
  saveErrorLabel?: string;
};

function useMessageEditor({ value, onSave, onSaveError }: Pick<ChatMessageEditableProps, "value" | "onSave" | "onSaveError">) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [originalValue, setOriginalValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const savingRef = useRef(false);
  const errorId = useId();

  useLayoutEffect(() => {
    if (editing) {
      const input = inputRef.current;
      input?.focus({ preventScroll: true });
      input?.setSelectionRange(input.value.length, input.value.length);
    } else if (triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
      triggerRef.current = null;
    }
  }, [editing]);

  function startEditing() {
    if (savingRef.current) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDraft(value);
    setOriginalValue(value);
    setFailed(false);
    setEditing(true);
  }

  function cancelEditing() {
    if (savingRef.current) return;
    setFailed(false);
    setEditing(false);
  }

  async function save() {
    if (!editing || savingRef.current || !draft.trim()) return;
    if (draft === value) {
      cancelEditing();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFailed(false);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (error) {
      setFailed(true);
      onSaveError?.(error);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return {
    editing,
    draft,
    setDraft,
    saving,
    failed,
    inputRef,
    errorId,
    startEditing,
    cancelEditing,
    save,
    displayValue: editing ? originalValue : value,
  };
}

/** Plain-text editing in the message surface. Children replace the default Copy/Edit actions. */
export function ChatMessageEditable({
  value,
  onSave,
  onSaveError,
  editorLabel = "Edit message",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  savingLabel = "Saving…",
  saveErrorLabel = "Couldn't save your message. Try again.",
  children,
  className,
  ...props
}: ChatMessageEditableProps) {
  const message = useChatMessageContext();
  const { editing, draft, setDraft, saving, failed, inputRef, errorId, startEditing, cancelEditing, save, displayValue } = useMessageEditor(
    { value, onSave, onSaveError },
  );

  return (
    <div
      {...props}
      data-control-ui="chat-message"
      data-control-family="chat-message"
      data-slot="editable"
      data-editing={editing ? "" : undefined}
      className={cn("min-w-0", className)}
    >
      <ChatMessageContent data-editable="">
        <span data-control-ui="chat-message" data-control-family="chat-message" data-slot="edit-value" aria-hidden={editing}>
          {displayValue || "\u200b"}
        </span>
        <span data-control-ui="chat-message" data-control-family="chat-message" data-slot="edit-sizer" aria-hidden="true">
          {`${draft}\u200b`}
        </span>
        <textarea
          ref={inputRef}
          data-control-ui="chat-message"
          data-control-family="chat-message"
          data-slot="edit-input"
          aria-keyshortcuts="Control+Enter Meta+Enter Escape"
          aria-label={editorLabel}
          aria-describedby={failed ? errorId : undefined}
          aria-hidden={!editing}
          aria-busy={saving}
          tabIndex={editing ? 0 : -1}
          readOnly={!editing || saving}
          value={editing ? draft : value}
          rows={1}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              cancelEditing();
            } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void save();
            }
          }}
        />
      </ChatMessageContent>
      <div data-control-ui="chat-message" data-control-family="chat-message" data-slot="edit-toolbars">
        <div
          data-control-ui="chat-message"
          data-control-family="chat-message"
          data-slot="edit-toolbar"
          data-active={!editing ? "" : undefined}
          inert={editing}
          aria-hidden={editing}
        >
          <ActionBar align={message.isEndAligned ? "end" : "start"} copyValue={value} onEdit={startEditing}>
            {children ?? (
              <>
                <ActionBarCopy />
                <ActionBarEdit />
              </>
            )}
          </ActionBar>
        </div>
        <div
          data-control-ui="chat-message"
          data-control-family="chat-message"
          data-slot="edit-toolbar"
          data-active={editing ? "" : undefined}
          inert={!editing}
          aria-hidden={!editing}
        >
          <ActionBar align={message.isEndAligned ? "end" : "start"} label="Edit actions" aria-busy={saving}>
            <ActionBarItem type="button" disabled={saving || !draft.trim()} onClick={() => void save()}>
              {saveLabel}
            </ActionBarItem>
            <ActionBarItem type="button" disabled={saving} onClick={cancelEditing}>
              {cancelLabel}
            </ActionBarItem>
          </ActionBar>
        </div>
      </div>
      <LiveStatus message={saving ? savingLabel : ""} />
      <span
        id={errorId}
        role="alert"
        data-control-ui="chat-message"
        data-control-family="chat-message"
        data-slot="edit-error"
        hidden={!failed}
      >
        {failed ? saveErrorLabel : ""}
      </span>
    </div>
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
