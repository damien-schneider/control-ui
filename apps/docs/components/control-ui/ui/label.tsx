import type { ComponentProps, CSSProperties } from "react";
import type { LabelKnobStyle } from "@/components/control-ui/knob-contracts/label-knobs";

export type LabelProps = Omit<ComponentProps<"label">, "style"> & { style?: CSSProperties & LabelKnobStyle };

// renders real <label> when htmlFor is set, else a <span> for group captions
export function Label({ className, htmlFor, children, ...props }: LabelProps) {
  const classes = className;

  if (htmlFor) {
    return (
      <label data-control-ui="label" data-control-family="label" data-slot="root" htmlFor={htmlFor} className={classes} {...props}>
        {children}
      </label>
    );
  }

  return (
    <span data-control-ui="label" data-control-family="label" data-slot="root" className={classes} {...props}>
      {children}
    </span>
  );
}
