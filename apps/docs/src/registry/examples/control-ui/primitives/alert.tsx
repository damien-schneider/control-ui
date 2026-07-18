"use client";

import { CircleAlert, Rocket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/control-ui/ui/alert";

export function PrimitiveAlertExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert>
        <Rocket />
        <AlertTitle>Deployment queued</AlertTitle>
        <AlertDescription>Your changes are building and will be live in a few minutes.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>We couldn't charge your card. Update your billing details to continue.</AlertDescription>
      </Alert>
    </div>
  );
}
