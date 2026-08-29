import type { ComponentProps, CSSProperties } from "react";
import type { CardKnobStyle } from "@/components/control-ui/knob-contracts/card-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type CardVariant = "default" | "sectioned";

export type CardProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & CardKnobStyle } & { variant?: CardVariant };

export type CardHeaderProps = ComponentProps<"div"> & { style?: CSSProperties & CardKnobStyle };

export type CardTitleProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & CardKnobStyle };

export type CardDescriptionProps = ComponentProps<"div"> & { style?: CSSProperties & CardKnobStyle };

export type CardActionProps = ComponentProps<"div"> & { style?: CSSProperties & CardKnobStyle };

export type CardContentProps = ComponentProps<"div"> & { style?: CSSProperties & CardKnobStyle };

export type CardFooterProps = ComponentProps<"div"> & { style?: CSSProperties & CardKnobStyle };

export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      data-control-ui="card"
      data-control-family="card"
      data-slot="root"
      data-surface="panel"
      data-variant={variant}
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-control-ui="card"
      data-control-family="card"
      data-slot="header"
      className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <div data-control-ui="card" data-control-family="card" data-slot="title" className={className} {...props} />;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <div data-control-ui="card" data-control-family="card" data-slot="description" className={className} {...props} />;
}

export function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-control-ui="card"
      data-control-family="card"
      data-slot="action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div data-control-ui="card" data-control-family="card" data-slot="content" className={className} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-control-ui="card"
      data-control-family="card"
      data-slot="footer"
      className={cn("flex items-center [.border-t]:pt-6", className)}
      {...props}
    />
  );
}
