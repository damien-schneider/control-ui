"use client";

import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function PrimitiveToggleExample() {
  const [pinned, setPinned] = useState(false);
  const [format, setFormat] = useState<string[]>(["bold"]);
  const [view, setView] = useState<string[]>(["grid"]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Row label="Single toggle">
        <Toggle pressed={pinned} onPressedChange={setPinned}>
          {pinned ? "Pinned" : "Pin"}
        </Toggle>
      </Row>

      <Row label="Multi-select group">
        <ToggleGroup multiple value={format} onValueChange={setFormat}>
          <Toggle value="bold" aria-label="Bold">
            <BoldIcon className="size-3.5" />
          </Toggle>
          <Toggle value="italic" aria-label="Italic">
            <ItalicIcon className="size-3.5" />
          </Toggle>
          <Toggle value="underline" aria-label="Underline">
            <UnderlineIcon className="size-3.5" />
          </Toggle>
        </ToggleGroup>
      </Row>

      <Row label="Single-select group">
        <ToggleGroup value={view} onValueChange={setView}>
          <Toggle value="grid">Grid</Toggle>
          <Toggle value="list">List</Toggle>
          <Toggle value="board">Board</Toggle>
        </ToggleGroup>
      </Row>

      <Row label="Disabled">
        <Toggle pressed disabled>
          Locked
        </Toggle>
      </Row>
    </div>
  );
}
