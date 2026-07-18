"use client";

import { ScrollArea } from "@/components/control-ui/ui/scroll-area";

const changelog = [
  "Streamed the first tokens back to the client.",
  "Resolved the tool call against the registry.",
  "Normalized the attachment into plain markdown.",
  "Grouped the reasoning steps by intent.",
  "Checked each candidate against the contract.",
  "Kept the smallest change that satisfied all of them.",
  "Re-ran the validator on the generated fixture.",
  "Mirrored the manifest into the public registry.",
  "Synced the installed fixture from the Control UI source.",
  "Measured the panel height for the open animation.",
  "Faded the scroll edges that actually clip content.",
  "Committed the result and moved to the next turn.",
];

export function PrimitiveScrollAreaExample() {
  return (
    <ScrollArea maxHeight="200px" className="w-full max-w-sm rounded-xl border bg-background">
      <ol className="flex flex-col gap-2 p-4 text-sm text-muted-foreground">
        {changelog.map((line, index) => (
          <li key={line} className="flex gap-2">
            <span className="shrink-0 tabular-nums text-foreground/40">{String(index + 1).padStart(2, "0")}</span>
            {line}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
