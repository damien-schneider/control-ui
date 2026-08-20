import type { ComponentProps, CSSProperties } from "react";
import type { KbdProps } from "@/components/control-ui/contracts";
import type { KbdKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-control-ui="kbd"
      data-control-family="kbd"
      data-slot="root"
      className={cn("inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 px-1.5", className)}
      {...props}
    />
  );
}

export function KbdGroup({ className, ...props }: ComponentProps<"span"> & { style?: CSSProperties & KbdKnobStyle }) {
  return (
    <span
      data-control-ui="kbd"
      data-control-family="kbd"
      data-slot="group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}
