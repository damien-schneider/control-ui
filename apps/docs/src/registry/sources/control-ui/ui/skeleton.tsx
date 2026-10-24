import type { ComponentProps, CSSProperties } from "react";
import type { SkeletonKnobStyle } from "@/components/control-ui/knob-contracts/skeleton-knobs";

export const skeletonVariants = ["shimmer", "pulse", "none"] as const;

export type SkeletonVariant = (typeof skeletonVariants)[number];

export const skeletonShapes = ["default", "circle", "panel"] as const;

export type SkeletonShape = (typeof skeletonShapes)[number];

export type SkeletonProps = Omit<ComponentProps<"div">, "style"> & {
  style?: CSSProperties & SkeletonKnobStyle;
  variant?: SkeletonVariant;
  shape?: SkeletonShape;
};

export function Skeleton({ variant = "shimmer", shape = "default", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-control-ui="skeleton"
      data-control-family="skeleton"
      data-slot="root"
      data-variant={variant}
      data-shape={shape}
      className={className}
      {...props}
    />
  );
}
