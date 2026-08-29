import type { ComponentProps, CSSProperties } from "react";
import type { AlertKnobStyle } from "@/components/control-ui/knob-contracts/alert-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export const alertVariants = ["default", "destructive"] as const;

export type AlertVariant = (typeof alertVariants)[number];

export type AlertProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle } & { variant?: AlertVariant };

export type AlertTitleProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle };

export type AlertDescriptionProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & AlertKnobStyle };

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-control-ui="alert"
      data-control-family="alert"
      data-slot="root"
      data-surface="panel"
      data-variant={variant}
      className={cn("relative grid w-full grid-cols-[0_1fr] items-start has-[>svg]:grid-cols-[1rem_1fr] [&>svg]:size-4", className)}
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
      className={cn("col-start-2 line-clamp-1", className)}
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
      className={cn("col-start-2 grid justify-items-start", className)}
      {...props}
    />
  );
}
