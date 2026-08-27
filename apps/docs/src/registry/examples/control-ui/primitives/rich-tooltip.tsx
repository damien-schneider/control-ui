"use client";

import { BellIcon, GitPullRequestIcon, LayoutGridIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
  RichTooltip,
  RichTooltipClose,
  RichTooltipContent,
  RichTooltipDescription,
  RichTooltipFooter,
  RichTooltipHeader,
  RichTooltipMedia,
  RichTooltipNext,
  RichTooltipPrevious,
  RichTooltipProgress,
  RichTooltipTitle,
  RichTooltipTour,
} from "@/components/control-ui/ui/rich-tooltip";

const steps = ["activity", "pull-requests", "sites"] as const;

const railButtonClass =
  "flex size-9 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground ring-1 ring-inset ring-border transition hover:bg-foreground/5 [&_svg]:size-4";

export function PrimitiveRichTooltipExample() {
  const [step, setStep] = useState<string | null>(steps[0]);
  const activityRef = useRef<HTMLButtonElement>(null);
  const pullRequestsRef = useRef<HTMLButtonElement>(null);
  const sitesRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-center gap-3 rounded-[var(--radius-panel)] bg-card p-3 ring-1 ring-inset ring-border">
        <button ref={activityRef} type="button" aria-label="Activity" className={railButtonClass}>
          <BellIcon />
        </button>
        <button ref={pullRequestsRef} type="button" aria-label="Pull requests" className={railButtonClass}>
          <GitPullRequestIcon />
        </button>
        <button ref={sitesRef} type="button" aria-label="Sites" className={railButtonClass}>
          <LayoutGridIcon />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setStep(steps[0])}
        className="h-8 cursor-pointer rounded-[var(--radius-control)] px-3 text-sm text-muted-foreground ring-1 ring-inset ring-border transition hover:bg-foreground/5"
      >
        Replay the tour
      </button>

      <RichTooltipTour steps={steps} step={step} onStepChange={setStep}>
        <RichTooltip step="activity">
          <RichTooltipContent anchor={activityRef} side="bottom" align="start">
            <RichTooltipHeader>
              <RichTooltipTitle>View activity</RichTooltipTitle>
              <RichTooltipClose />
            </RichTooltipHeader>
            <RichTooltipDescription>See chats that are unread, active, or awaiting a response.</RichTooltipDescription>
            <RichTooltipFooter>
              <RichTooltipProgress />
              <div className="flex items-center gap-1">
                <RichTooltipPrevious />
                <RichTooltipNext />
              </div>
            </RichTooltipFooter>
          </RichTooltipContent>
        </RichTooltip>

        <RichTooltip step="pull-requests">
          <RichTooltipContent anchor={pullRequestsRef} side="bottom" align="center">
            <RichTooltipMedia>
              <div className="aspect-[16/7] bg-[linear-gradient(120deg,oklch(from_var(--primary-foreground)_l_c_h_/_0.35),transparent)]" />
            </RichTooltipMedia>
            <RichTooltipHeader>
              <RichTooltipTitle>Review pull requests</RichTooltipTitle>
              <RichTooltipClose />
            </RichTooltipHeader>
            <RichTooltipDescription>Every branch an agent opened lands here, grouped by repository.</RichTooltipDescription>
            <RichTooltipFooter>
              <RichTooltipProgress variant="dots" />
              <div className="flex items-center gap-1">
                <RichTooltipPrevious />
                <RichTooltipNext />
              </div>
            </RichTooltipFooter>
          </RichTooltipContent>
        </RichTooltip>

        <RichTooltip step="sites" tone="surface">
          <RichTooltipContent anchor={sitesRef} side="bottom" align="end">
            <RichTooltipHeader>
              <RichTooltipTitle>Preview sites</RichTooltipTitle>
              <RichTooltipClose />
            </RichTooltipHeader>
            <RichTooltipDescription>Each deployment gets a shareable URL that stays live until the branch closes.</RichTooltipDescription>
            <RichTooltipFooter>
              <RichTooltipProgress />
              <div className="flex items-center gap-1">
                <RichTooltipPrevious />
                <RichTooltipNext>Done</RichTooltipNext>
              </div>
            </RichTooltipFooter>
          </RichTooltipContent>
        </RichTooltip>
      </RichTooltipTour>
    </div>
  );
}
