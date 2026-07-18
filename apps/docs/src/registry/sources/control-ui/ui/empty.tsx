import type { ComponentProps } from "react";
import type { EmptyProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot, plain markup (no Base UI): icon tile + title + muted copy + action area.
// Tracks DA via --muted-foreground/--foreground; drop in a card, list body, or full page.
export function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      data-control-ui="empty"
      data-slot="root"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-[var(--radius-lg)] p-6 text-center text-balance",
        skinSlot("empty", "root", {}),
        className,
      )}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="empty"
      data-slot="header"
      className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)}
      {...props}
    />
  );
}

// Icon tile: --radius-lg box, muted fill; glyph passed as children.
export function EmptyMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="empty"
      data-slot="media"
      className={cn(
        "mb-2 flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-muted text-muted-foreground [&>svg]:size-5 [&>svg]:shrink-0",
        skinSlot("empty", "media", {}),
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: ComponentProps<"div">) {
  return <div data-control-ui="empty" data-slot="title" className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p data-control-ui="empty" data-slot="description" className={cn("text-sm/relaxed text-muted-foreground", className)} {...props} />
  );
}

// Action area: buttons/links/compact form to recover from empty state.
export function EmptyContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="empty"
      data-slot="content"
      className={cn("flex w-full max-w-sm flex-col items-center justify-center gap-2 text-sm text-balance", className)}
      {...props}
    />
  );
}
