import type { ComponentProps, CSSProperties } from "react";
import type { LabelKnobStyle } from "@/components/control-ui/knob-contracts/label-knobs";

export type LabelProps = Omit<ComponentProps<"label">, "style"> & { style?: CSSProperties & LabelKnobStyle };

export function Label({ htmlFor, children, ...props }: LabelProps) {
  return (
    <label {...props} htmlFor={htmlFor} data-control-ui="label" data-control-family="label" data-slot="root">
      {children}
    </label>
  );
}
