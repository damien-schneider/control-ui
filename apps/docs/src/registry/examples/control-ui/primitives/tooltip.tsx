"use client";

import { InfoIcon, RadiusIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/control-ui/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export function PrimitiveTooltipExample() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-4 p-8">
        <Tooltip>
          <TooltipTrigger render={<Button variant="surface" />}>
            <InfoIcon className="size-4" />
            Details
          </TooltipTrigger>
          <TooltipContent side="top">Agent run metadata</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="surface" iconOnly aria-label="Save changes" />}>
            <SaveIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="right">Save changes</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="surface" />}>
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
