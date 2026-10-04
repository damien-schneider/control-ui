"use client";

import { Separator } from "@/components/control-ui/ui/separator";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveSeparatorExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Text as="p" size="label" weight="medium" tone="foreground">
          Research assistant
        </Text>
        <Text as="p" size="caption" tone="muted">
          Summarises sources and drafts answers.
        </Text>
      </div>
      <Separator />
      <Text as="div" size="label" tone="muted" className="flex h-5 items-center gap-3">
        <span>Runs</span>
        <Separator orientation="vertical" />
        <span>Tools</span>
        <Separator orientation="vertical" />
        <span>Settings</span>
      </Text>
    </div>
  );
}
