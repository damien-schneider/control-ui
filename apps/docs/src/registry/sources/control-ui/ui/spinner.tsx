import { Loader2 } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { SpinnerKnobStyle } from "@/components/control-ui/knob-contracts/spinner-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type SpinnerProps = Omit<
  ComponentProps<"span"> & {
    size?: ControlSize;
  },
  "style"
> & { style?: CSSProperties & SpinnerKnobStyle };

// Deliberately outside motion kill-switch — loader must keep turning under reduced motion.
export function Spinner({ size = "sm", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      data-control-ui="spinner"
      data-control-family="spinner"
      data-slot="root"
      className={cn("inline-flex", className)}
      {...props}
    >
      <Loader2 aria-hidden="true" data-control-ui="spinner" data-control-family="spinner" data-slot="indicator" data-size={size} />
      <span className="sr-only">Loading</span>
    </span>
  );
}
