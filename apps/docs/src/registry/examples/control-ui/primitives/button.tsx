"use client";

import { ArrowUpRightIcon, CheckIcon, DownloadIcon, MonitorIcon, PlayIcon, PlusIcon, SmartphoneIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Text size="caption" weight="medium" tone="muted">
        {label}
      </Text>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function PrimitiveButtonExample() {
  return (
    <div className="flex w-full flex-col gap-5 p-2">
      <Row label="Variant">
        <Button variant="solid">Solid</Button>
        <Button variant="surface">Surface</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="quiet">Quiet</Button>
        <Button variant="dashed">
          <PlusIcon />
          Dashed
        </Button>
        <Button variant="link">Link</Button>
      </Row>
      <Row label="Over media">
        <div className="relative w-72 max-w-full">
          <img
            src="/dynamic-notification/sequoia-sunrise.png"
            alt="Sequoia grove at sunrise"
            className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
          />
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
            <Button variant="scrim">
              <PlayIcon />
              Play
            </Button>
            <Button variant="scrim" iconOnly aria-label="Download photo">
              <DownloadIcon />
            </Button>
          </div>
        </div>
      </Row>
      <Row label="Tone">
        <Button variant="solid" tone="primary">
          Primary
        </Button>
        <Button variant="solid" tone="danger">
          Danger
        </Button>
        <Button variant="ghost" tone="primary">
          Primary
        </Button>
        <Button variant="ghost" tone="danger">
          Danger
        </Button>
      </Row>
      <Row label="Size">
        <Button variant="surface" size="xs">
          Extra small
        </Button>
        <Button variant="surface" size="sm">
          Small
        </Button>
        <Button variant="surface" size="md">
          Medium
        </Button>
        <Button variant="surface" size="lg">
          Large
        </Button>
      </Row>
      <Row label="Icon only">
        <Button variant="surface" size="xs" iconOnly aria-label="Extra small icon button">
          <PlusIcon className="size-3" />
        </Button>
        <Button variant="surface" size="sm" iconOnly aria-label="Small icon button">
          <PlusIcon className="size-3.5" />
        </Button>
        <Button variant="surface" size="md" iconOnly aria-label="Medium icon button">
          <PlusIcon className="size-4" />
        </Button>
        <Button variant="surface" size="lg" iconOnly aria-label="Large icon button">
          <PlusIcon className="size-4" />
        </Button>
      </Row>
      <Row label="State">
        <Button variant="quiet" active>
          Active
        </Button>
        <Button variant="solid" disabled>
          Disabled
        </Button>
        <Button variant="surface">
          <CheckIcon className="size-3.5" />
          With icon
        </Button>
      </Row>
      <Row label="Tile">
        <Button variant="surface" layout="tile">
          <MonitorIcon className="size-4" />
          Desktop
        </Button>
        <Button variant="surface" layout="tile" active>
          <SmartphoneIcon className="size-4" />
          Mobile
        </Button>
      </Row>
      <Row label="Link">
        <ButtonLink href="#preview" variant="ghost">
          Render as link
          <ArrowUpRightIcon className="size-3.5" />
        </ButtonLink>
      </Row>
    </div>
  );
}
