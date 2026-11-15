"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";

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
        <ol className="flex flex-col gap-2 p-4">
          {changelog.map((line, index) => (
            <Text as="li" key={line} tone="muted" className="flex gap-2">
              <Text tone="muted" numeric className="shrink-0">
                {String(index + 1).padStart(2, "0")}
              </Text>
              {line}
            </Text>
          ))}
        </ol>
      </ScrollArea>
      <ScrollArea lockAxis="y" scrollbarGutter="stable" viewportProps={{ "aria-label": "Horizontal roadmap" }}>
        <ol aria-label="Roadmap columns" className="flex w-max gap-4">
          {["Backlog", "Planned", "In progress", "Done"].map((status) => (
            <li key={status} className="w-48 shrink-0">
              <Card size="sm">
                <CardContent>
                  <Button className="w-full justify-start" variant="surface">
                    {status}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <Text as="p" size="label" tone="muted">
        scrollbarGutter="stable" reserves room for the scrollbar so it never covers content. Put flex or grid on a child container: the
        viewport contains an internal content wrapper. lockAxis="y" prevents vertical scrolling.
      </Text>
    </div>
  );
}

export function ScrollAreaGutterExample() {
  const [overflow, setOverflow] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Toggle pressed={overflow} onPressedChange={setOverflow}>
        Overflow content
      </Toggle>
      <ScrollArea aria-label="Stable scrollbar gutter" className="h-48" scrollbarVisibility="always" scrollbarGutter="stable" mask={false}>
        <div className={overflow ? "h-96 w-[36rem] p-4" : "p-4"}>
          <Text as="p" tone="muted">
            The scrollbar tracks keep their space when content fits.
          </Text>
        </div>
      </ScrollArea>
    </div>
  );
}
