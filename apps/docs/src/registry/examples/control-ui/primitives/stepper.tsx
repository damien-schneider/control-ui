"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
} from "@/components/control-ui/ui/stepper";

export function PrimitiveStepperExample() {
  return (
    <Stepper className="w-full max-w-2xl">
      <StepperList aria-label="Publish a project">
        <StepperItem step={0}>
          <StepperIndicator />
          <StepperTitle>Connect</StepperTitle>
          <StepperDescription>Link the repository.</StepperDescription>
          <StepperSeparator />
        </StepperItem>
        <StepperItem step={1}>
          <StepperIndicator />
          <StepperTitle>Configure</StepperTitle>
          <StepperDescription>Set the build options.</StepperDescription>
          <StepperSeparator />
        </StepperItem>
        <StepperItem step={2}>
          <StepperIndicator />
          <StepperTitle>Publish</StepperTitle>
          <StepperDescription>Deploy the project.</StepperDescription>
        </StepperItem>
      </StepperList>
    </Stepper>
  );
}
