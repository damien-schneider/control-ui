"use client";

import { useState } from "react";

import { Radio, RadioGroup, RadioGroupItem } from "@/components/control-ui/ui/radio-group";
import { Text } from "@/components/control-ui/ui/typography";

const plans = [
  { value: "starter", label: "Starter", detail: "1 project, community support" },
  { value: "pro", label: "Pro", detail: "Unlimited projects, priority support" },
  { value: "team", label: "Team", detail: "SSO, audit log, seats" },
];

export function PrimitiveRadioGroupExample() {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup value={plan} onValueChange={setPlan} aria-label="Billing plan" className="w-full max-w-xs">
      {plans.map((option) => (
        <RadioGroupItem key={option.value} htmlFor={`plan-${option.value}`}>
          <Radio id={`plan-${option.value}`} value={option.value} aria-label={option.label} />
          <span className="flex flex-col">
            <Text weight="medium" tone="foreground">
              {option.label}
            </Text>
            <Text size="caption" tone="muted">
              {option.detail}
            </Text>
          </span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
