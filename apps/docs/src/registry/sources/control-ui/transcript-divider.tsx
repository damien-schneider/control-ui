import type { ComponentProps, CSSProperties } from "react";
import type { TranscriptDividerKnobStyle } from "@/components/control-ui/knob-contracts/transcript-divider-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type ChatTone = "neutral" | "success" | "warning" | "danger";

export type TranscriptDividerProps = Omit<ComponentProps<"div">, "style"> & {
  tone?: ChatTone;
  style?: CSSProperties & TranscriptDividerKnobStyle;
};

export function TranscriptDivider({ tone = "neutral", className, children, ...props }: TranscriptDividerProps) {
  return (
    <div
      data-control-ui="transcript-divider"
      data-control-family="transcript-divider"
      data-slot="root"
      data-tone={tone}
      className={cn("flex min-w-0 items-center before:flex-1 after:flex-1", className)}
      {...props}
    >
      {children != null ? <TranscriptDividerLabel>{children}</TranscriptDividerLabel> : null}
    </div>
  );
}

export type TranscriptDividerLabelProps = ComponentProps<"span"> & { style?: CSSProperties & TranscriptDividerKnobStyle };

export function TranscriptDividerLabel({ className, ...props }: TranscriptDividerLabelProps) {
  return (
    <span
      data-control-ui="transcript-divider"
      data-control-family="transcript-divider"
      data-slot="label"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  );
}
