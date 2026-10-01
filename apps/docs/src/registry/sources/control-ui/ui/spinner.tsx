import { Loader2 } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { ControlSize } from "@/components/control-ui/control-variants";
import type { SpinnerKnobStyle } from "@/components/control-ui/knob-contracts/spinner-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type SpinnerProps = Omit<
  ComponentProps<"span"> & {
    size?: ControlSize;
    label?: string;
  },
  "style" | "children"
> & { style?: CSSProperties & SpinnerKnobStyle };

export function Spinner({ size = "sm", label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      data-control-ui="spinner"
      data-control-family="spinner"
      data-slot="root"
      data-motion-essential=""
      className={cn("inline-flex", className)}
      {...props}
    >
      <Loader2 aria-hidden="true" data-control-ui="spinner" data-control-family="spinner" data-slot="indicator" data-size={size} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
