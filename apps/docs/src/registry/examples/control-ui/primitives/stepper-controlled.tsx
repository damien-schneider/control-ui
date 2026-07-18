"use client";

import { useState } from "react";

import { Button } from "@/components/control-ui/ui/button";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/control-ui/ui/stepper";

export function PrimitiveControlledStepperExample() {
  const [step, setStep] = useState(0);

  return (
    <Stepper value={step} onValueChange={setStep} orientation="vertical" contentMode="current" className="w-full max-w-xl">
      <StepperList aria-label="Create a project">
        <StepperItem step={0}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>Project details</StepperTitle>
            <StepperDescription>Name the project and choose its region.</StepperDescription>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
        <StepperItem step={1}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>Team access</StepperTitle>
            <StepperDescription>Choose who can collaborate.</StepperDescription>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
        <StepperItem step={2}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>Review</StepperTitle>
            <StepperDescription>Confirm the setup before publishing.</StepperDescription>
          </StepperTrigger>
        </StepperItem>
      </StepperList>

      <StepperContent step={0}>
        <p className="text-sm text-muted-foreground">Add the public details used to identify this project across the workspace.</p>
      </StepperContent>
      <StepperContent step={1}>
        <p className="text-sm text-muted-foreground">Invite collaborators and decide which team members can edit the project.</p>
      </StepperContent>
      <StepperContent step={2}>
        <p className="text-sm text-muted-foreground">Review the project configuration and publish when everything looks right.</p>
      </StepperContent>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="surface" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
          Back
        </Button>
        <Button variant="solid" tone="primary" disabled={step === 2} onClick={() => setStep((current) => Math.min(2, current + 1))}>
          Continue
        </Button>
      </div>
    </Stepper>
  );
}
