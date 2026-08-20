import { Loader2 } from "lucide-react";
import type { SpinnerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// Deliberately outside motion kill-switch — loader must keep turning under reduced motion.
const spinnerSize = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

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
      <Loader2
        aria-hidden="true"
        data-control-ui="spinner"
        data-control-family="spinner"
        data-slot="indicator"
        className={spinnerSize[size]}
      />
      <span className="sr-only">Loading</span>
    </span>
  );
}
