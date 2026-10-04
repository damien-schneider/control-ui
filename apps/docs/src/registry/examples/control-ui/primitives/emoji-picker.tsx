"use client";

import type { Emoji } from "frimousse";
import { SmilePlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  EmojiPicker,
  EmojiPickerCategories,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerRecent,
  EmojiPickerSearch,
} from "@/components/control-ui/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";
import { initialRecentEmoji, rememberEmoji } from "./emoji-picker-data";

export function PrimitiveEmojiPickerExample() {
  const [open, setOpen] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState<string | null>(null);
  const [recentEmoji, setRecentEmoji] = useState<Emoji[]>(initialRecentEmoji);

  return (
    <div className="flex items-center gap-3 text-body text-muted-foreground">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="surface" iconOnly aria-label="Add reaction" />}>
          <SmilePlusIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent padding="none" className="w-fit">
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              setPickedEmoji(emoji.emoji);
              setRecentEmoji((recent) => rememberEmoji(recent, emoji));
              setOpen(false);
            }}
          >
            <EmojiPickerSearch />
            <EmojiPickerCategories />
            <EmojiPickerRecent emojis={recentEmoji} />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>
      <span aria-live="polite">{pickedEmoji ? `Picked ${pickedEmoji}` : "No emoji picked yet"}</span>
    </div>
  );
}
