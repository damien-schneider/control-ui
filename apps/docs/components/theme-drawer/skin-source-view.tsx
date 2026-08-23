"use client";

import { SourceTabs } from "@/app/(features)/components/source";
import { Button } from "@/components/control-ui/ui/button";
import { Spinner } from "@/components/control-ui/ui/spinner";
import type { SkinSourceState } from "./skin-source";

export function SkinSourceView({ label, source, onRetry }: { label: string; source: SkinSourceState; onRetry: () => void }) {
  if (source.status === "ready") {
    return (
      <div className="pt-1">
        <SourceTabs files={source.files} />
      </div>
    );
  }

  if (source.status === "error") {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-label text-muted-foreground">The {label} source could not be loaded.</p>
        <Button variant="surface" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-label text-muted-foreground">
      <Spinner />
      Loading {label} source
    </div>
  );
}
