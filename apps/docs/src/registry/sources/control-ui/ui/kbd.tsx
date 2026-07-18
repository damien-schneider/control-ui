import type { ComponentProps } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Refined skin slot: keyboard key chip sharing --radius-control w/ buttons/fields (⌘K hint matches corner). Pure markup, no dep.
// KbdGroup lays out a chord (⌘+K) with hairline separators.
export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-control-ui="kbd"
      data-slot="root"
      className={cn(
        "inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-[var(--radius-control)] px-1.5 font-sans text-micro font-medium text-muted-foreground ring-1 ring-inset ring-border bg-card/60 shadow-sm",
        skinSlot("kbd", "root", {}),
        className,
      )}
      {...props}
    />
  );
}

export function KbdGroup({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-control-ui="kbd"
      data-slot="group"
      className={cn("inline-flex items-center gap-1", skinSlot("kbd", "group", {}), className)}
      {...props}
    />
  );
}
