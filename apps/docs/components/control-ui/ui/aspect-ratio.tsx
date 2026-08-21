import type { ComponentProps } from "react";

export type AspectRatioProps = ComponentProps<"div"> & { ratio?: number };

const DEFAULT_ASPECT_RATIO = 16 / 9;

// native CSS aspect-ratio, no Radix; rounding and clipping stay caller's to add
export function AspectRatio({ ratio = DEFAULT_ASPECT_RATIO, className, style, ...props }: AspectRatioProps) {
  return <div data-control-ui="aspect-ratio" data-slot="root" style={{ aspectRatio: ratio, ...style }} className={className} {...props} />;
}
