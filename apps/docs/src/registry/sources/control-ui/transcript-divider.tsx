import type { ComponentProps } from "react";

import type { TranscriptDividerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

export function TranscriptDivider({ tone = "neutral", className, children, ...props }: TranscriptDividerProps) {
  return (
    <div
      data-control-ui="transcript-divider"
      data-slot="root"
      data-tone={tone}
      className={cn(
        "my-2 flex min-w-0 items-center text-caption text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
        tone === "danger" && "text-destructive-text",
        skinSlot("transcript-divider", "root", { tone }),
        className,
      )}
      {...props}
    >
      {children != null ? <TranscriptDividerLabel>{children}</TranscriptDividerLabel> : null}
    </div>
  );
}

export type TranscriptDividerLabelProps = ComponentProps<"span">;

export function TranscriptDividerLabel({ className, ...props }: TranscriptDividerLabelProps) {
  return (
    <span
      data-control-ui="transcript-divider"
      data-slot="label"
      className={cn("min-w-0 truncate px-2", skinSlot("transcript-divider", "label", {}), className)}
      {...props}
    />
  );
}
