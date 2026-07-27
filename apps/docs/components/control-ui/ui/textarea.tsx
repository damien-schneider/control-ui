import type { TextareaProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// `field-sizing-content` auto-grows it, so there is no ResizeObserver and no JS measuring.
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-control-ui="textarea"
      data-slot="root"
      className={cn(
        "field-sizing-content min-h-16 max-h-64 w-full min-w-0 resize-none rounded-[var(--radius-control)] bg-card/72 px-3 py-2 text-body text-foreground shadow-sm ring-1 ring-inset ring-border outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:ring-2 data-[invalid]:ring-destructive",
        skinSlot("textarea", "root", {}),
        className,
      )}
      {...props}
    />
  );
}
