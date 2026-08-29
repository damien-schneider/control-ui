import type { ComponentProps, CSSProperties } from "react";

import type { KbdKnobStyle } from "@/components/control-ui/knob-contracts/kbd-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type KbdProps = Omit<ComponentProps<"kbd">, "style"> & { style?: CSSProperties & KbdKnobStyle };

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-control-ui="kbd"
      data-control-family="kbd"
      data-slot="root"
      className={cn("inline-flex select-none items-center justify-center", className)}
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
      className={cn("inline-flex items-center", className)}
      {...props}
    />
  );
}
