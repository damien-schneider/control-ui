"use client";

import { InfoIcon, RadiusIcon, SaveIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

const triggerClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-card px-3 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border transition hover:bg-foreground/5";

export function PrimitiveTooltipExample() {
  return (
    <TooltipProvider delay={0}>
      <div className="flex flex-wrap items-center justify-center gap-4 p-8">
        <Tooltip defaultOpen>
          <TooltipTrigger render={<button type="button" className={triggerClass} />}>
            <InfoIcon className="size-4" />
            Details
          </TooltipTrigger>
          <TooltipContent side="top">Agent run metadata</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className={triggerClass} aria-label="Save changes">
              <SaveIcon className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Save changes</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<button type="button" className={triggerClass} />}>
            <RadiusIcon className="size-4" />
            No arrow
          </TooltipTrigger>
          <TooltipContent arrow={false} side="bottom">
            Uses the normal radius
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
