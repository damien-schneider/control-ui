"use client";

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from "frimousse";
import { SearchIcon } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { EmojiPickerKnobStyle } from "@/components/control-ui/knob-contracts/emoji-picker-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Spinner } from "@/components/control-ui/ui/spinner";

type EmojiPickerStyle = { style?: CSSProperties & EmojiPickerKnobStyle };

export type EmojiPickerProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Root>, "style"> & EmojiPickerStyle;

export function EmojiPicker({ className, columns = 9, ...props }: EmojiPickerProps) {
  return (
    <EmojiPickerPrimitive.Root
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="root"
      columns={columns}
      className={cn("isolate flex h-72 w-fit flex-col", className)}
      {...props}
    />
  );
}

export type EmojiPickerSearchProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Search>, "style"> & EmojiPickerStyle;

export function EmojiPickerSearch({
  className,
  placeholder = "Search emoji…",
  "aria-label": ariaLabel = "Search emoji",
  ...props
}: EmojiPickerSearchProps) {
  return (
    <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="search" className="flex items-center">
      <SearchIcon aria-hidden="true" data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="search-icon" />
      <EmojiPickerPrimitive.Search
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="search-input"
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("min-w-0 flex-1 outline-none", className)}
        {...props}
      />
    </div>
  );
}

function EmojiPickerRow({ children, className, ...props }: EmojiPickerListRowProps) {
  return (
    <div
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="row"
      className={cn("scroll-my-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function EmojiPickerEmoji({ emoji, className, ...props }: EmojiPickerListEmojiProps) {
  return (
    <button
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="emoji"
      data-active={emoji.isActive ? "" : undefined}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({ category, className, ...props }: EmojiPickerListCategoryHeaderProps) {
  return (
    <div data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="category-header" className={className} {...props}>
      {category.label}
    </div>
  );
}

export type EmojiPickerContentProps = Omit<ComponentProps<typeof EmojiPickerPrimitive.Viewport>, "style"> & EmojiPickerStyle;

export function EmojiPickerContent({ className, ...props }: EmojiPickerContentProps) {
  return (
    <EmojiPickerPrimitive.Viewport
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="content"
      className={cn("relative flex-1 outline-none", className)}
      {...props}
    >
      <EmojiPickerPrimitive.Loading
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="loading"
        className="absolute inset-0 flex items-center justify-center"
      >
        <Spinner label="Loading emoji" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="empty"
        className="absolute inset-0 flex items-center justify-center"
      >
        No emoji found.
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        data-control-ui="emoji-picker"
        data-control-family="emoji-picker"
        data-slot="list"
        className="select-none"
        components={{ Row: EmojiPickerRow, Emoji: EmojiPickerEmoji, CategoryHeader: EmojiPickerCategoryHeader }}
      />
    </EmojiPickerPrimitive.Viewport>
  );
}

export type EmojiPickerFooterProps = Omit<ComponentProps<"div">, "style" | "children"> & EmojiPickerStyle & { placeholder?: string };

export function EmojiPickerFooter({ className, placeholder = "Pick an emoji…", ...props }: EmojiPickerFooterProps) {
  return (
    <div
      data-control-ui="emoji-picker"
      data-control-family="emoji-picker"
      data-slot="footer"
      className={cn("flex min-w-0 items-center", className)}
      {...props}
    >
      <EmojiPickerPrimitive.ActiveEmoji>
        {({ emoji }) =>
          emoji ? (
            <>
              <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-emoji" className="flex-none">
                {emoji.emoji}
              </span>
              <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-label" className="truncate">
                {emoji.label}
              </span>
            </>
          ) : (
            <span data-control-ui="emoji-picker" data-control-family="emoji-picker" data-slot="footer-placeholder" className="truncate">
              {placeholder}
            </span>
          )
        }
      </EmojiPickerPrimitive.ActiveEmoji>
    </div>
  );
}
