import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinPaint, skinSlot } from "@/components/control-ui/skin";

// sweep rather than flat pulse, so it reads as "streaming in"
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
