"use client";

import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";

export function PrimitiveKbdExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 text-sm text-muted-foreground">
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
    </div>
  );
}
