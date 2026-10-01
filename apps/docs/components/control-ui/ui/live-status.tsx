import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";

export type LiveStatusProps = Omit<ComponentProps<"span">, "role" | "children"> & { message: string };

export function LiveStatus({ message, className, ...props }: LiveStatusProps) {
  return (
    <span
      {...props}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-ui="live-status"
      data-slot="root"
      className={cn("sr-only", className)}
    >
      {message}
    </span>
  );
}
