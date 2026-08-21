import type { ComponentProps, CSSProperties } from "react";
import type { SkeletonKnobStyle } from "@/components/control-ui/knob-contracts/skeleton-knobs";

export function Skeleton({ className, ...props }: Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & SkeletonKnobStyle }) {
  return <div data-control-ui="skeleton" data-control-family="skeleton" data-slot="root" className={className} {...props} />;
}
