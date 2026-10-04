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
        <div className="mt-1 space-y-1.5 px-3 py-1">
          <Text as="p" tone="muted">
            Parsed the request and grouped the constraints.
          </Text>
          <Text as="p" tone="muted">
            Checked each candidate against the contract.
          </Text>
          <Text as="p" tone="muted">
            Kept the smallest change that satisfied all of them.
          </Text>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
