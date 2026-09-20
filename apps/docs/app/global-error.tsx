"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/control-ui/ui/empty";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className="bg-background">
      <body>
        <main>
          <Empty className="min-h-svh">
            <EmptyHeader>
              <EmptyMedia>
                <HugeiconsIcon aria-hidden icon={AlertCircleIcon} strokeWidth={1.7} />
              </EmptyMedia>
              <h1 className="text-balance text-heading-3 text-foreground">Control UI could not start</h1>
              <EmptyDescription className="text-pretty">
                The documentation shell failed to render. Retrying usually clears it.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row flex-wrap justify-center">
              <Button variant="solid" tone="primary" onClick={reset}>
                Try again
              </Button>
              <ButtonLink href="/get-started" variant="surface">
                Back to the guides
              </ButtonLink>
            </EmptyContent>
            {error.digest ? <p className="font-mono text-caption text-muted-foreground">Reference {error.digest}</p> : null}
          </Empty>
        </main>
      </body>
    </html>
  );
}
