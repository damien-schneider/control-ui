"use client";

import type { Emoji } from "frimousse";
import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  EmojiIconPicker,
  EmojiIconPickerEmoji,
  EmojiIconPickerIcons,
  EmojiIconPickerTabs,
  EmojiPickerCategories,
  EmojiPickerContent,
  EmojiPickerRecent,
  EmojiPickerSearch,
} from "@/components/control-ui/ui/emoji-picker";
import { IconPickerColors, IconPickerContent, IconPickerSearch } from "@/components/control-ui/ui/icon-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/control-ui/ui/popover";
import { Text } from "@/components/control-ui/ui/typography";
import { initialRecentEmoji, rememberEmoji } from "./emoji-picker-data";
import { pickerColors, pickerIcons } from "./picker-data";

type ItemSymbol = { kind: "emoji"; emoji: Emoji } | { kind: "icon"; value: string; color: string };

export function PrimitiveEmojiIconPickerExample() {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState<ItemSymbol>({ kind: "emoji", emoji: { emoji: "📁", label: "File folder" } });
  const [recentEmoji, setRecentEmoji] = useState<Emoji[]>(initialRecentEmoji);
  const [colorValue, setColorValue] = useState("default");
  const color = pickerColors.find((swatch) => swatch.value === colorValue);
  if (!color) throw new Error(`Unknown icon color: ${colorValue}`);
  const selectedIcon = symbol.kind === "icon" ? pickerIcons.find((icon) => icon.value === symbol.value) : undefined;
  const selectEmoji = (emoji: Emoji) => {
    setSymbol({ kind: "emoji", emoji });
    setRecentEmoji((recent) => rememberEmoji(recent, emoji));
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="surface" aria-label="Choose item emoji or icon" />}>
          <span
            className="flex size-5 items-center justify-center [&_svg]:size-5"
            style={{ color: symbol.kind === "icon" ? symbol.color : undefined }}
            aria-hidden="true"
          >
            {symbol.kind === "emoji" ? symbol.emoji.emoji : selectedIcon?.icon}
          </span>
          Project notes
        </PopoverTrigger>
        <PopoverContent padding="none" className="w-fit max-w-[calc(100vw-1rem)]" align="start">
          <EmojiIconPicker>
            <EmojiIconPickerTabs />
            <EmojiIconPickerEmoji onEmojiSelect={selectEmoji}>
              <EmojiPickerSearch />
              <EmojiPickerCategories />
              <EmojiPickerRecent emojis={recentEmoji} />
              <EmojiPickerContent />
            </EmojiIconPickerEmoji>
            <EmojiIconPickerIcons
              items={pickerIcons}
              value={symbol.kind === "icon" ? symbol.value : undefined}
              style={{ "--cui-icon-picker-foreground": color.color }}
              onValueChange={(value) => {
                setSymbol({ kind: "icon", value, color: color.color });
                setOpen(false);
              }}
            >
              <IconPickerSearch />
              <IconPickerColors colors={pickerColors} value={colorValue} onValueChange={setColorValue} />
              <IconPickerContent />
            </EmojiIconPickerIcons>
          </EmojiIconPicker>
        </PopoverContent>
      </Popover>
      <Text tone="muted" aria-live="polite">
        {symbol.kind === "emoji" ? symbol.emoji.label : selectedIcon?.label}
      </Text>
    </div>
  );
}
