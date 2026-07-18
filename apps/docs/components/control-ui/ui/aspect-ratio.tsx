import type { AspectRatioProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

const DEFAULT_ASPECT_RATIO = 16 / 9;

// Pure-CSS ratio box (no Radix): sets native `aspect-ratio` from `ratio` prop; rounding/clipping is caller's/skin's to add.
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
