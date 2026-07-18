import type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Plain semantic card (no Base UI). Header is a grid; has-data-[slot=card-action] pins CardAction to top-right without title/description knowing it's there.
export function Card({ variant = "default", className, ...props }: CardProps) {
  return (
    <div
      data-control-ui="card"
      data-slot="root"
      data-surface="panel"
      data-variant={variant}
      className={cn(
        "flex flex-col gap-6 rounded-[var(--radius-lg)] border bg-card py-6 text-card-foreground shadow-sm",
        variant === "sectioned" &&
          "gap-0 py-0 shadow-pop [&>[data-slot=header]]:border-b [&>[data-slot=header]]:border-border/70 [&>[data-slot=header]]:px-6 [&>[data-slot=header]]:py-5 [&>[data-slot=content]]:px-6 [&>[data-slot=content]]:py-6",
        skinSlot("card", "root", { variant }),
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-control-ui="card"
      data-slot="header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <div data-control-ui="card" data-slot="title" className={cn("font-semibold leading-none", className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <div data-control-ui="card" data-slot="description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-control-ui="card"
      data-slot="action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div data-control-ui="card" data-slot="content" className={cn("px-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div data-control-ui="card" data-slot="footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />;
}
