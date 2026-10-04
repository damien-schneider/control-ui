import { FileNotFoundIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/control-ui/ui/empty";
import { Heading } from "@/components/control-ui/ui/typography";

export default function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyMedia>
          <HugeiconsIcon aria-hidden icon={FileNotFoundIcon} strokeWidth={1.7} />
        </EmptyMedia>
        <Heading level={1} size="heading-3">
          We couldn’t find that page
        </Heading>
        <EmptyDescription className="text-pretty">
          The URL may be outdated, or the page moved while the library was reorganised.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center">
        <ButtonLink render={<Link href="/get-started" />} variant="solid" tone="primary">
          Start with the guides
        </ButtonLink>
        <ButtonLink render={<Link href="/primitives" />} variant="surface">
          Browse components
        </ButtonLink>
      </EmptyContent>
    </Empty>
  );
}
