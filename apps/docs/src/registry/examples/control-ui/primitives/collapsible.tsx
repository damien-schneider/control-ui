"use client";

import { ChevronRightIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";

export function PrimitiveCollapsibleExample() {
  return (
    <Collapsible defaultOpen className="w-full max-w-sm">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-foreground/4">
        <ChevronRightIcon className="size-4 text-muted-foreground" />
        Reasoning steps
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 space-y-1.5 px-3 py-1 text-sm text-muted-foreground">
          <p>Parsed the request and grouped the constraints.</p>
          <p>Checked each candidate against the contract.</p>
          <p>Kept the smallest change that satisfied all of them.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
