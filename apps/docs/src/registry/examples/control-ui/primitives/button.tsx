"use client";

import { ArrowUpRightIcon, CheckIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/control-ui/ui/button";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
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
      <Row label="Render prop">
        <Button
          render={
            <a href="#preview">
              Render as link
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          }
          nativeButton={false}
          variant="ghost"
        />
      </Row>
    </div>
  );
}
