"use client";

import { ArchiveIcon, ListFilterIcon, TagIcon } from "lucide-react";
import { useRef } from "react";
import {
  RichTooltip,
  RichTooltipClose,
  RichTooltipContent,
  RichTooltipDescription,
  RichTooltipHeader,
  RichTooltipTitle,
} from "@/components/control-ui/ui/rich-tooltip";
import { Toolbar, ToolbarButton } from "@/components/control-ui/ui/toolbar";

export function PrimitiveRichTooltipInPanelExample() {
  const panelRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      ref={panelRef}
      className="relative grid h-48 w-full max-w-sm content-start justify-items-start overflow-hidden rounded-[var(--radius-panel)] border border-border bg-background p-3"
    >
      <Toolbar aria-label="Inbox">
        <ToolbarButton ref={filterRef} iconOnly aria-label="Filter">
          <ListFilterIcon />
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Label">
          <TagIcon />
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Archive">
          <ArchiveIcon />
        </ToolbarButton>
      </Toolbar>

      <RichTooltip>
        <RichTooltipContent
          container={panelRef}
          anchor={filterRef}
          side="bottom"
          align="start"
          scrollAnchorIntoView={false}
          initialFocus={false}
          className="w-72"
        >
          <RichTooltipHeader>
            <RichTooltipTitle>Filter by label</RichTooltipTitle>
            <RichTooltipClose />
          </RichTooltipHeader>
          <RichTooltipDescription>Narrow the inbox to one label, or combine several.</RichTooltipDescription>
        </RichTooltipContent>
      </RichTooltip>
    </div>
  );
}
