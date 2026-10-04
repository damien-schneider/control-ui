"use client";

import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveKbdExample() {
  return (
    <Text as="div" tone="muted" className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center gap-2">
        <span>Single key</span>
        <Kbd>Esc</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Command palette</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span>Send message</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>↵</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span>Inline hint</span>
        <Kbd variant="ghost">⌘K</Kbd>
      </div>
    </Text>
  );
}
