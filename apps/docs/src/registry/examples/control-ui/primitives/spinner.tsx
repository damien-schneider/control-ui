"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";

export function PrimitiveSpinnerExample() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Button variant="solid" size="sm" disabled>
        <Spinner size="sm" className="text-primary-foreground" />
        Saving…
      </Button>
    </div>
  );
}
