import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type { ComponentProps, CSSProperties } from "react";
import type { SeparatorKnobStyle } from "@/components/control-ui/knob-contracts/separator-knobs";
import { cn } from "@/components/control-ui/lib/cn";

// axis comes straight from prop, never data-attribute, so no skin can break it
export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: Omit<ComponentProps<typeof SeparatorPrimitive>, "style"> & { style?: CSSProperties & SeparatorKnobStyle }) {
  return (
    <SeparatorPrimitive
      data-control-ui="separator"
      data-control-family="separator"
      data-slot="root"
      orientation={orientation}
      className={cn("shrink-0", orientation === "vertical" ? "h-full w-px" : "h-px w-full", className)}
      {...props}
    />
  );
}
