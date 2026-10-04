"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/control-ui/ui/empty";
import { Heading, Text } from "@/components/control-ui/ui/typography";
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
              <Heading level={1} size="heading-3">
                Control UI could not start
              </Heading>
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
            {error.digest ? (
              <Text as="p" size="caption" tone="muted" className="font-mono">
                Reference {error.digest}
              </Text>
            ) : null}
          </Empty>
        </main>
      </body>
    </html>
  );
}
