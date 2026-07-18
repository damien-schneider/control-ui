import type { LabelProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot: real <label> when htmlFor ties to a control; <span> fallback for group captions.
export function Label({ className, htmlFor, children, ...props }: LabelProps) {
  const classes = cn("text-meta font-medium text-muted-foreground", skinSlot("label", "root", {}), className);

  if (htmlFor) {
    return (
      <label data-control-ui="label" data-slot="root" htmlFor={htmlFor} className={classes} {...props}>
        {children}
      </label>
    );
  }

  return (
    <span data-control-ui="label" data-slot="root" className={classes} {...props}>
      {children}
    </span>
  );
}
