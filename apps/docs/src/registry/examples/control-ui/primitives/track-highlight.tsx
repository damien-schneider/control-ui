"use client";

import { useState } from "react";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { Button } from "@/components/control-ui/ui/button";
import { FieldLegend, FieldSet } from "@/components/control-ui/ui/field";

const views = ["Overview", "Activity", "Members", "Archived"];

function TrackHighlightDemo({ indicator }: { indicator: "hover" | "slide" }) {
  const [selectedView, setSelectedView] = useState("Overview");

  return (
    <FieldSet className="max-w-full gap-3">
      <FieldLegend>{indicator === "hover" ? "Hover and focus" : "Selection and preview"}</FieldLegend>
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
    </FieldSet>
  );
}

export function PrimitiveTrackHighlightExample() {
  return <TrackHighlightDemo indicator="hover" />;
}

export function PrimitiveTrackHighlightSelectionExample() {
  return <TrackHighlightDemo indicator="slide" />;
}
