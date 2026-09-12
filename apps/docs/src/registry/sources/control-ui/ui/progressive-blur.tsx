import type { ComponentProps, CSSProperties } from "react";
import type { ProgressiveBlurKnobStyle } from "@/components/control-ui/knob-contracts/progressive-blur-knobs";

export type ProgressiveBlurSide = "top" | "bottom" | "inline-start" | "inline-end";

export type ProgressiveBlurProps = Omit<ComponentProps<"div">, "children" | "dangerouslySetInnerHTML" | "style" | "tabIndex"> & {
  side?: ProgressiveBlurSide;
  visible?: boolean;
  style?: CSSProperties & ProgressiveBlurKnobStyle;
};

export function ProgressiveBlur({ side = "bottom", visible = true, ...props }: ProgressiveBlurProps) {
  return (
    <div
      {...props}
      data-control-ui="progressive-blur"
      data-control-family="progressive-blur"
      data-slot="root"
      data-side={side}
      data-visible={visible || undefined}
      aria-hidden="true"
    >
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
      <span data-control-ui="progressive-blur" data-control-family="progressive-blur" data-slot="layer" />
    </div>
  );
}
