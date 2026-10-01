"use client";

import { Separator } from "@/components/control-ui/ui/separator";

export function PrimitiveSeparatorExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-label font-medium text-foreground">Research assistant</p>
        <p className="text-caption text-muted-foreground">Summarises sources and drafts answers.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-3 text-label text-muted-foreground">
        <span>Runs</span>
        <Separator orientation="vertical" />
        <span>Tools</span>
        <Separator orientation="vertical" />
        <span>Settings</span>
      </div>
    </div>
  );
}
