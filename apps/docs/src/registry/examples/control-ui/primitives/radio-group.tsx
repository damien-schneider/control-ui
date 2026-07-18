"use client";

import { useState } from "react";

import { Radio, RadioGroup } from "@/components/control-ui/ui/radio-group";

export function PrimitiveRadioGroupExample() {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup value={plan} onValueChange={setPlan} aria-label="Billing plan" className="w-full max-w-xs">
      <label
        htmlFor="plan-starter"
        className="flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Radio id="plan-starter" value="starter" className="mt-0.5" aria-label="Starter" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Starter</span>
          <span className="text-meta text-muted-foreground">1 project, community support</span>
        </span>
      </label>
      <label
        htmlFor="plan-pro"
        className="flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Radio id="plan-pro" value="pro" className="mt-0.5" aria-label="Pro" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Pro</span>
          <span className="text-meta text-muted-foreground">Unlimited projects, priority support</span>
        </span>
      </label>
      <label
        htmlFor="plan-team"
        className="flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-md)] p-2 text-[13px] transition-colors hover:bg-foreground/4 has-[[data-checked]]:bg-foreground/4"
      >
        <Radio id="plan-team" value="team" className="mt-0.5" aria-label="Team" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">Team</span>
          <span className="text-meta text-muted-foreground">SSO, audit log, seats</span>
        </span>
      </label>
    </RadioGroup>
  );
}
