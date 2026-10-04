"use client";

import { ChevronRightIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveCollapsibleExample() {
  return (
    <Collapsible defaultOpen className="w-full max-w-sm">
      <CollapsibleTrigger>
        <ChevronRightIcon />
        Reasoning steps
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text as="div" tone="muted" className="mt-1 space-y-1.5 px-3 py-1">
          <p>Parsed the request and grouped the constraints.</p>
          <p>Checked each candidate against the contract.</p>
          <p>Kept the smallest change that satisfied all of them.</p>
        </Text>
      </CollapsibleContent>
    </Collapsible>
  );
}
