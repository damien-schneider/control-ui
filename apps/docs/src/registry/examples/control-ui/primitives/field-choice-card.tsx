"use client";

import { useState } from "react";

import { Field, FieldContent, FieldDescription, FieldItem, FieldLabel, FieldTitle } from "@/components/control-ui/ui/field";
import { Radio, RadioGroup } from "@/components/control-ui/ui/radio-group";

const workflows = [
  {
    value: "generated",
    title: "Generated notes",
    description: "Drafts release notes from merged commits and pull requests, then waits for your review.",
  },
  { value: "imported", title: "Imported releases", description: "Imports releases published by your CI tooling." },
  { value: "manual", title: "Manual", description: "You write every release note yourself." },
  { value: "scheduled", title: "Scheduled", description: "Available on the Team plan.", disabled: true },
];

export function PrimitiveFieldChoiceCardExample() {
  const [workflow, setWorkflow] = useState("generated");

  return (
    <Field className="w-full max-w-xl">
      <RadioGroup value={workflow} onValueChange={setWorkflow} aria-label="Release workflow" className="grid sm:grid-cols-2">
        {workflows.map((option) => (
          <FieldItem key={option.value} disabled={option.disabled}>
            <FieldLabel variant="card">
              <Radio value={option.value} />
              <FieldContent>
                <FieldTitle>{option.title}</FieldTitle>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
            </FieldLabel>
          </FieldItem>
        ))}
      </RadioGroup>
    </Field>
  );
}
