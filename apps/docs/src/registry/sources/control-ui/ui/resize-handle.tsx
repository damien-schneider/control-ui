import type { ComponentProps, CSSProperties } from "react";
import type { ResizeHandleKnobStyle } from "@/components/control-ui/knob-contracts/resize-handle-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export const resizeHandleDirections = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export type ResizeHandleDirection = (typeof resizeHandleDirections)[number];

export type ResizeHandleProps = Omit<ComponentProps<"button">, "style"> & {
  direction: ResizeHandleDirection;
  style?: CSSProperties & ResizeHandleKnobStyle;
};

const resizeHandleLabels = {
  n: "Resize top edge",
  ne: "Resize top-right corner",
  e: "Resize right edge",
  se: "Resize bottom-right corner",
  s: "Resize bottom edge",
  sw: "Resize bottom-left corner",
  w: "Resize left edge",
  nw: "Resize top-left corner",
} as const satisfies Record<ResizeHandleDirection, string>;

export function ResizeHandle({ direction, className, ...props }: ResizeHandleProps) {
  return (
    <button
      type="button"
      data-control-ui="resize-handle"
      data-control-family="resize-handle"
      data-slot="root"
      data-direction={direction}
      aria-label={resizeHandleLabels[direction]}
      className={cn("absolute touch-none", className)}
      {...props}
    />
  );
}
