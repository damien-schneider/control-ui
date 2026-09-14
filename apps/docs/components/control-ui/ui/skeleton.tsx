import type { ComponentProps, CSSProperties } from "react";
import type { SkeletonKnobStyle } from "@/components/control-ui/knob-contracts/skeleton-knobs";

export const skeletonVariants = ["shimmer", "pulse", "none"] as const;

export type SkeletonVariant = (typeof skeletonVariants)[number];

export type SkeletonProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & SkeletonKnobStyle;
  variant?: SkeletonVariant;
};

export function Skeleton({ variant = "shimmer", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-control-ui="skeleton"
      data-control-family="skeleton"
      data-slot="root"
      data-variant={variant}
      className={className}
      {...props}
    />
  );
}
