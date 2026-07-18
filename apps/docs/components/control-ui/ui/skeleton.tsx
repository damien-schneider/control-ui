import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinPaint, skinSlot } from "@/components/control-ui/skin";

// Token-driven `shimmer` sweep instead of flat pulse — reads as "streaming in", follows theme colours/radius/motion tempo.
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="skeleton"
      data-slot="root"
      className={cn("rounded-md", skinPaint("skeleton", "shimmer", {}) ?? "shimmer", skinSlot("skeleton", "root", {}), className)}
      {...props}
    />
  );
}
