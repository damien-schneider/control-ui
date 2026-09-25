"use client";

import { Button } from "@/components/control-ui/ui/button";
import { Input } from "@/components/control-ui/ui/input";
import { THEME_CONTRACT } from "@/src/registry/lib/theme-contract";
import { SpecimenGroup, TokenValueList } from "./specimen/specimen";

const FOCUS_RING_TOKENS = THEME_CONTRACT.filter((token) => token.name.startsWith("--focus-ring")).map((token) => token.name);

export function FocusFoundations() {
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Indicator">
        <div className="docs-panel grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div
            className="grid h-12 w-40 place-items-center rounded-[var(--radius-control)] bg-card text-label text-card-foreground ring-1 ring-inset ring-border"
            style={{
              outline: "var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring)",
              outlineOffset: "var(--focus-ring-offset)",
            }}
          >
            Focused
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Input aria-label="Tab into this field" placeholder="Tab into me" />
            </div>
            <Button variant="surface">Then me</Button>
          </div>
        </div>
      </SpecimenGroup>
      <SpecimenGroup title="Values">
        <TokenValueList names={FOCUS_RING_TOKENS} />
      </SpecimenGroup>
    </div>
  );
}
