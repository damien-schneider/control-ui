import { cva } from "class-variance-authority";
import type { AlertDescriptionProps, AlertProps, AlertTitleProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Plain semantic alert (no Base UI): grid layout, has-[>svg] switches on a leading icon column.
// `destructive` only re-tints via --destructive, no structural change.
const alertVariant = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-[var(--radius-lg)] border bg-card px-4 py-3 text-sm text-card-foreground has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive/50 text-destructive-text *:data-[slot=alert-description]:text-destructive-text/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-control-ui="alert"
      data-slot="root"
      data-surface="panel"
      data-variant={variant}
      className={cn(alertVariant({ variant }), skinSlot("alert", "root", { variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <div
      data-control-ui="alert"
      data-slot="title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-control-ui="alert"
      data-slot="description"
      className={cn("col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}
