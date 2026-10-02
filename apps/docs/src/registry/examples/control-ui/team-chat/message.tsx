"use client";

import type { Emoji } from "frimousse";
import { MessageSquareTextIcon, MoreHorizontalIcon, SmilePlusIcon } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import { ActionBar, ActionBarItem } from "@/components/control-ui/action-bar";
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageContent,
  ChatMessageFooter,
  ChatMessageHeader,
  ChatMessageReaction,
  ChatMessageReactions,
  ChatMessageReplySummary,
  ChatMessageRow,
  ChatMessageTime,
} from "@/components/control-ui/chat-message";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "@/components/control-ui/ui/avatar";
import { Button } from "@/components/control-ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import {
  EmojiPicker,
  EmojiPickerCategories,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerReactions,
  EmojiPickerRecent,
  EmojiPickerSearch,
} from "@/components/control-ui/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger, PopoverViewport } from "@/components/control-ui/ui/popover";
import { commonReactions, rememberEmoji } from "../primitives/emoji-picker-data";
import { formatMessageTime, people, type TeamMessage, type TeamPerson, viewerId } from "./data";

export function EmojiPickerPopover({ trigger, onPick }: { trigger: ReactElement; onPick: (emoji: string) => void }) {
  const [view, setView] = useState<"closed" | "quick" | "all">("closed");
  const [recentEmoji, setRecentEmoji] = useState<Emoji[]>([]);
  const focusSearch = typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches;
  const selectEmoji = (emoji: Emoji) => {
    onPick(emoji.emoji);
    setRecentEmoji((recent) => rememberEmoji(recent, emoji));
    setView("closed");
  };

  return (
    <Popover open={view !== "closed"} onOpenChange={(open) => setView(open ? "quick" : "closed")}>
      <PopoverTrigger render={trigger} />
      <PopoverContent padding="none" className="w-fit max-w-[calc(100vw-1rem)]" align="end">
        <PopoverViewport>
          {view === "all" ? (
            <EmojiPicker onEmojiSelect={selectEmoji}>
              <EmojiPickerSearch autoFocus={focusSearch} />
              <EmojiPickerCategories />
              <EmojiPickerRecent emojis={recentEmoji} />
              <EmojiPickerContent />
              <EmojiPickerFooter />
            </EmojiPicker>
          ) : (
            <div className="p-2">
              <EmojiPickerReactions emojis={commonReactions} onEmojiSelect={selectEmoji} />
              <Button variant="ghost" className="mt-1 w-full" onClick={() => setView("all")}>
                <SmilePlusIcon aria-hidden="true" />
                More emoji
              </Button>
            </div>
          )}
        </PopoverViewport>
      </PopoverContent>
    </Popover>
  );
}

export function PersonAvatar({ person, className }: { person: TeamPerson; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback>{person.initials}</AvatarFallback>
      <AvatarBadge status={person.status} label={person.status} />
    </Avatar>
  );
}

function reactionLabel(emoji: string, userIds: string[]) {
  const names = userIds.map((id) => (id === viewerId ? "you" : people[id].name));
  return `${emoji} from ${names.join(", ")}`;
}

function lastReplyLabel(replies: TeamMessage[]) {
  const lastReply = replies.at(-1);
  return lastReply ? `Last reply ${formatMessageTime(lastReply.sentAt).short}` : "";
}

export type TeamChatMessageProps = {
  message: TeamMessage;
  continuation: boolean;
  onToggleReaction: (emoji: string) => void;
  onOpenThread?: (opener: HTMLElement) => void;
  onDelete?: () => void;
};

export function TeamChatMessage({ message, continuation, onToggleReaction, onOpenThread, onDelete }: TeamChatMessageProps) {
  const author = people[message.authorId];
  const isOwn = message.authorId === viewerId;
  const time = formatMessageTime(message.sentAt);
  const repliers = [...new Set(message.replies.map((reply) => reply.authorId))].map((id) => people[id]);

  return (
    <ChatMessage
      from={isOwn ? "user" : "participant"}
      layout="flat"
      continuation={continuation}
      authorLabel={`${author.name}, ${time.full}`}
    >
      <ChatMessageRow>
        <ChatMessageAvatar>
          {continuation ? (
            <ChatMessageTime dateTime={message.sentAt} title={time.full}>
              {time.short}
            </ChatMessageTime>
          ) : (
            <PersonAvatar person={author} className="size-full" />
          )}
        </ChatMessageAvatar>
        <ChatMessageBody>
          {continuation ? null : (
            <ChatMessageHeader>
              <ChatMessageAuthor>{author.name}</ChatMessageAuthor>
              <ChatMessageTime dateTime={message.sentAt} title={time.full}>
                {time.short}
              </ChatMessageTime>
            </ChatMessageHeader>
          )}
          <ChatMessageContent className="whitespace-pre-wrap">{message.text}</ChatMessageContent>
          {message.edited ? <ChatMessageFooter>(edited)</ChatMessageFooter> : null}
          {message.reactions.length > 0 ? (
            <ChatMessageReactions>
              {message.reactions.map((reaction) => (
                <ChatMessageReaction
                  key={reaction.emoji}
                  emoji={reaction.emoji}
                  count={reaction.userIds.length}
                  pressed={reaction.userIds.includes(viewerId)}
                  label={reactionLabel(reaction.emoji, reaction.userIds)}
                  onPressedChange={() => onToggleReaction(reaction.emoji)}
                />
              ))}
              <EmojiPickerPopover
                onPick={onToggleReaction}
                trigger={
                  <Button variant="ghost" size="xs" iconOnly className="rounded-full" aria-label="Add reaction">
                    <SmilePlusIcon aria-hidden="true" />
                  </Button>
                }
              />
            </ChatMessageReactions>
          ) : null}
          {onOpenThread && message.replies.length > 0 ? (
            <ChatMessageReplySummary onClick={(event) => onOpenThread(event.currentTarget)}>
              <AvatarGroup aria-hidden="true" className="-space-x-1.5">
                {repliers.map((person) => (
                  <Avatar key={person.id} className="size-5 text-[0.5625rem]">
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="font-medium text-foreground">
                {message.replies.length} {message.replies.length === 1 ? "reply" : "replies"}
              </span>
              <span>{lastReplyLabel(message.replies)}</span>
            </ChatMessageReplySummary>
          ) : null}
        </ChatMessageBody>
        <ChatMessageActions>
          <ActionBar label={`Actions for ${author.name}'s message`}>
            <EmojiPickerPopover
              onPick={onToggleReaction}
              trigger={<ActionBarItem variant="ghost" icon={<SmilePlusIcon />} aria-label="Add reaction" />}
            />
            {onOpenThread ? (
              <ActionBarItem
                variant="ghost"
                icon={<MessageSquareTextIcon />}
                aria-label="Reply in thread"
                onClick={(event) => onOpenThread(event.currentTarget)}
              />
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger render={<ActionBarItem variant="ghost" icon={<MoreHorizontalIcon />} aria-label="More actions" />} />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(message.text)}>Copy text</DropdownMenuItem>
                {isOwn && onDelete ? <DropdownMenuItem onClick={onDelete}>Delete message</DropdownMenuItem> : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </ActionBar>
        </ChatMessageActions>
      </ChatMessageRow>
    </ChatMessage>
  );
}
