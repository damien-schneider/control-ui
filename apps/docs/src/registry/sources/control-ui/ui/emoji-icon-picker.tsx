"use client";

import type { ComponentProps } from "react";
import { EmojiPicker } from "@/components/control-ui/ui/emoji-picker";
import { IconPicker } from "@/components/control-ui/ui/icon-picker";
import { PopoverViewport } from "@/components/control-ui/ui/popover";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";

export function EmojiIconPicker({ children, defaultValue = "emoji", ...props }: ComponentProps<typeof Tabs<"emoji" | "icons">>) {
  return (
    <Tabs data-control-ui="emoji-icon-picker" data-control-family="tabs" data-slot="root" defaultValue={defaultValue} {...props}>
      <PopoverViewport>{children}</PopoverViewport>
    </Tabs>
  );
}

export function EmojiIconPickerTabs({
  emojiLabel = "Emoji",
  iconsLabel = "Icons",
  ...props
}: Omit<ComponentProps<typeof TabsList>, "children"> & { emojiLabel?: string; iconsLabel?: string }) {
  return (
    <TabsList size="xs" className="mx-2 mt-2" aria-label="Choose emoji or icon" {...props}>
      <TabsTab value="emoji">{emojiLabel}</TabsTab>
      <TabsTab value="icons">{iconsLabel}</TabsTab>
    </TabsList>
  );
}

export function EmojiIconPickerEmoji(props: ComponentProps<typeof EmojiPicker>) {
  return (
    <TabsPanel value="emoji" data-slide={undefined} className="mt-0">
      <EmojiPicker {...props} />
    </TabsPanel>
  );
}

export function EmojiIconPickerIcons(props: ComponentProps<typeof IconPicker>) {
  return (
    <TabsPanel value="icons" data-slide={undefined} className="mt-0">
      <IconPicker {...props} />
    </TabsPanel>
  );
}
