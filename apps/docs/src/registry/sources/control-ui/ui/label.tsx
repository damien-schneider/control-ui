import type { LabelProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// renders real <label> when htmlFor is set, else a <span> for group captions
export function Label({ className, htmlFor, children, ...props }: LabelProps) {
  const classes = cn("text-caption font-medium text-muted-foreground", skinSlot("label", "root", {}), className);

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
