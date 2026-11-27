"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/control-ui/ui/badge";
import {
  RichTooltip,
  RichTooltipContent,
  RichTooltipDescription,
  RichTooltipFooter,
  RichTooltipHeader,
  RichTooltipNext,
  RichTooltipPrevious,
  RichTooltipProgress,
  RichTooltipTitle,
  RichTooltipTour,
} from "@/components/control-ui/ui/rich-tooltip";

const tourSteps = [
  { id: "channels", title: "Channels", body: "Group conversations by team or topic so nothing gets buried." },
  { id: "threads", title: "Thread replies", body: "Reply in a side thread without losing your place in the channel." },
  { id: "mentions", title: "Mentions", body: "Type @ to bring a teammate into the conversation." },
  { id: "shortcuts", title: "Shortcuts", body: "Press ⌘ K to jump to any channel or person." },
] as const;

type TourStepId = (typeof tourSteps)[number]["id"];

const tourStepIds = tourSteps.map((step) => step.id);

const OPENING_STEP: TourStepId = "threads";

const BLEED = 40;

const ARROW_CENTER = 35;

export function RichTooltipPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [stepId, setStepId] = useState<string>(OPENING_STEP);
  const index = Math.max(
    0,
    tourSteps.findIndex((candidate) => candidate.id === stepId),
  );
  const step = tourSteps[index];

  return (
    <div className="relative h-39 w-full">
      <div ref={containerRef} className="absolute top-0 overflow-clip" style={{ inset: `0 ${-BLEED}px ${-BLEED}px` }}>
        <span ref={anchorRef} aria-hidden="true" className="absolute top-0 h-px" style={{ left: BLEED, width: ARROW_CENTER * 2 }} />
      </div>
      <RichTooltipTour steps={tourStepIds} step={stepId} onStepChange={(next) => setStepId(next ?? OPENING_STEP)}>
        <RichTooltip step={stepId}>
          <RichTooltipContent
            container={containerRef}
            anchor={anchorRef}
            side="bottom"
            align="start"
            sideOffset={9}
            collisionPadding={{ top: 0, right: BLEED, bottom: BLEED, left: BLEED }}
            scrollAnchorIntoView={false}
            initialFocus={false}
            className="w-62.5"
          >
            <RichTooltipHeader className="justify-start">
              <Badge size="sm">New</Badge>
              <RichTooltipTitle>{step?.title}</RichTooltipTitle>
            </RichTooltipHeader>
            <RichTooltipDescription>{step?.body}</RichTooltipDescription>
            <RichTooltipFooter>
              <RichTooltipProgress>
                {index + 1} of {tourSteps.length}
              </RichTooltipProgress>
              <RichTooltipPrevious>Back</RichTooltipPrevious>
              <RichTooltipNext>Next</RichTooltipNext>
            </RichTooltipFooter>
          </RichTooltipContent>
        </RichTooltip>
      </RichTooltipTour>
    </div>
  );
}
