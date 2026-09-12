"use client";

import { useState } from "react";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { Button } from "@/components/control-ui/ui/button";

const views = ["Overview", "Activity", "Members", "Archived"];

function TrackHighlightDemo({ indicator }: { indicator: "hover" | "slide" }) {
  const [selectedView, setSelectedView] = useState("Overview");

  return (
    <fieldset className="min-w-0 max-w-full rounded-(--radius-panel) border border-border p-3">
      <legend className="px-1 text-caption text-muted-foreground">
        {indicator === "hover" ? "Hover and focus" : "Selection and preview"}
      </legend>
      <div data-track={indicator} className={`relative isolate flex ${indicator === "slide" ? "w-56 max-w-full flex-col" : "flex-wrap"}`}>
        {views.map((view) => (
          <Button
            key={view}
            data-track-item=""
            active={selectedView === view}
            aria-pressed={selectedView === view}
            disabled={view === "Archived"}
            onClick={() => setSelectedView(view)}
          >
            {view}
          </Button>
        ))}
        <TrackHighlight />
      </div>
    </fieldset>
  );
}

export function PrimitiveTrackHighlightExample() {
  return <TrackHighlightDemo indicator="hover" />;
}

export function PrimitiveTrackHighlightSelectionExample() {
  return <TrackHighlightDemo indicator="slide" />;
}
