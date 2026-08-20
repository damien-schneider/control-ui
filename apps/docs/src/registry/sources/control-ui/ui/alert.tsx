import type { AlertDescriptionProps, AlertProps, AlertTitleProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="root"
      data-surface="panel"
      data-variant={variant}
      className={cn(
        "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 px-4 py-3 has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <div
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="title"
      className={cn("col-start-2 line-clamp-1 min-h-4", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="description"
      className={cn("col-start-2 grid justify-items-start gap-1", className)}
      {...props}
    />
  );
}
