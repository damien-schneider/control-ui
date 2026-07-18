import { Loader2 } from "lucide-react";
import type { SpinnerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Loader, not expressive motion: NOT gated by motion kill-switch (--duration-*) — spins even under reduced motion.
// role="status" + visually-hidden "Loading" give it accessible name; size walks control ramp (xs..lg).
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
