import type { ComponentProps, CSSProperties } from "react";
import type { ResizeHandleKnobStyle } from "@/components/control-ui/knob-contracts/resize-handle-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export const resizeHandleDirections = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

export type ResizeHandleDirection = (typeof resizeHandleDirections)[number];

export type ResizeHandleProps = Omit<ComponentProps<"button">, "style"> & {
  direction: ResizeHandleDirection;
  style?: CSSProperties & ResizeHandleKnobStyle;
};

export function ResizeHandle({ direction, className, ...props }: ResizeHandleProps) {
  return (
    <button
      type="button"
      data-control-ui="resize-handle"
      data-control-family="resize-handle"
      data-slot="root"
      data-direction={direction}
      className={cn("absolute touch-none", className)}
      {...props}
    />
  );
}
