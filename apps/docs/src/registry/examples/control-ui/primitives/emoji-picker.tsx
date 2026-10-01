"use client";

import { SmilePlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch } from "@/components/control-ui/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";

export function PrimitiveEmojiPickerExample() {
  const [open, setOpen] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="surface" iconOnly aria-label="Add reaction" />}>
          <SmilePlusIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent padding="none" className="w-fit">
          <EmojiPicker
            onEmojiSelect={({ emoji }) => {
              setPickedEmoji(emoji);
              setOpen(false);
            }}
          >
            <EmojiPickerSearch />
            <EmojiPickerContent />
            <EmojiPickerFooter />
          </EmojiPicker>
        </PopoverContent>
      </Popover>
      <span aria-live="polite">{pickedEmoji ? `Picked ${pickedEmoji}` : "No emoji picked yet"}</span>
    </div>
  );
}
