"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/control-ui/ui/empty";

export default function DocsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia>
          <HugeiconsIcon aria-hidden icon={AlertCircleIcon} strokeWidth={1.7} />
        </EmptyMedia>
        <h1 className="text-balance text-heading-3 text-foreground">This page stopped loading</h1>
        <EmptyDescription className="text-pretty">
          Something failed while rendering the documentation. Retrying usually clears it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center">
        <Button variant="solid" tone="primary" onClick={reset}>
          Try again
        </Button>
        <ButtonLink render={<Link href="/get-started" />} variant="surface">
          Back to the guides
        </ButtonLink>
      </EmptyContent>
      {error.digest ? <p className="font-mono text-caption text-muted-foreground">Reference {error.digest}</p> : null}
    </Empty>
  );
}
