import { Loader2 } from "lucide-react";
import type { SpinnerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

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
      data-slot="root"
      className={cn("inline-flex text-muted-foreground", skinSlot("spinner", "root", {}), className)}
      {...props}
    >
      <Loader2 aria-hidden="true" className={cn("animate-spin", spinnerSize[size])} />
      <span className="sr-only">Loading</span>
    </span>
  );
}
