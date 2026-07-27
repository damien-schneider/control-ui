import type { AspectRatioProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

const DEFAULT_ASPECT_RATIO = 16 / 9;

// native CSS aspect-ratio, no Radix; rounding and clipping stay caller's to add
export function AspectRatio({ ratio = DEFAULT_ASPECT_RATIO, className, style, ...props }: AspectRatioProps) {
  return (
    <div
      data-control-ui="aspect-ratio"
      data-slot="root"
      style={{ aspectRatio: ratio, ...style }}
      className={cn(skinSlot("aspect-ratio", "root", {}), className)}
      {...props}
    />
  );
}
