"use client";

import { CircleAlert, CircleCheck, Info, Rocket, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/control-ui/ui/alert";

export function PrimitiveAlertExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert>
        <Rocket />
        <AlertTitle>Deployment queued</AlertTitle>
        <AlertDescription>Your changes are building and will be live in a few minutes.</AlertDescription>
      </Alert>
      <Alert tone="info">
        <Info />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Builds pause on Sunday from 02:00 to 02:30 UTC.</AlertDescription>
      </Alert>
      <Alert tone="success">
        <CircleCheck />
        <AlertTitle>Domain verified</AlertTitle>
        <AlertDescription>acme.dev now points to your production deployment.</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <TriangleAlert />
        <AlertTitle>Usage at 90%</AlertTitle>
        <AlertDescription>You have 1,200 build minutes left this month.</AlertDescription>
      </Alert>
      <Alert tone="danger">
        <CircleAlert />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>We couldn't charge your card. Update your billing details to continue.</AlertDescription>
      </Alert>
    </div>
  );
}
