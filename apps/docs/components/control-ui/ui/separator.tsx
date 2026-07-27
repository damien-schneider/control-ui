import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// axis comes straight from prop, never data-attribute, so no skin can break it
export function Separator({ className, orientation = "horizontal", ...props }: ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      data-control-ui="separator"
      data-slot="root"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        skinSlot("separator", "root", {}),
        className,
      )}
      {...props}
    />
  );
}
