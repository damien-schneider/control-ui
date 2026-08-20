import type { TextareaProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

// `field-sizing-content` auto-grows it, so there is no ResizeObserver and no JS measuring.
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-control-ui="textarea"
      data-field-kind="textarea"
      data-slot="root"
      data-control-family="field"
      data-control="true"
      className={cn("field-sizing-content min-h-16 max-h-64 w-full min-w-0 resize-none px-3 py-2", className)}
      {...props}
    />
  );
}
