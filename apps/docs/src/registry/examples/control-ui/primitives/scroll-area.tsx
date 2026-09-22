"use client";

import { Button } from "@/components/control-ui/ui/button";
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
    <div className="flex w-full max-w-sm flex-col gap-6">
      <ScrollArea maxHeight="200px">
        <ol className="flex flex-col gap-2 p-4 text-sm text-muted-foreground">
          {changelog.map((line, index) => (
            <li key={line} className="flex gap-2">
              <span className="shrink-0 tabular-nums text-foreground/40">{String(index + 1).padStart(2, "0")}</span>
              {line}
            </li>
          ))}
        </ol>
      </ScrollArea>
      <ScrollArea lockAxis="y" viewportClassName="pb-3" viewportProps={{ "aria-label": "Horizontal roadmap" }}>
        <ol aria-label="Roadmap columns" className="flex w-max gap-4">
          {["Backlog", "Planned", "In progress", "Done"].map((status) => (
            <li key={status} className="w-48 shrink-0 rounded-xl bg-muted p-4">
              <Button className="w-full justify-start" variant="surface">
                {status}
              </Button>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        viewportClassName controls viewport padding and scrolling. Put flex or grid on a child container: the viewport contains an internal
        content wrapper. lockAxis="y" prevents vertical scrolling.
      </p>
    </div>
  );
}
