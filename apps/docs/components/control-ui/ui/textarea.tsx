import type { ComponentProps, CSSProperties } from "react";
import type { FieldKnobStyle } from "@/components/control-ui/knob-contracts/field-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TextareaProps = Omit<ComponentProps<"textarea">, "style"> & { style?: CSSProperties & FieldKnobStyle };

// `field-sizing-content` auto-grows it, so there is no ResizeObserver and no JS measuring.
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-control-ui="textarea"
      data-field-kind="textarea"
      data-slot="root"
      data-control-family="field"
      data-control="true"
      className={cn("field-sizing-content w-full min-w-0 resize-none", className)}
      {...props}
    />
  );
}
