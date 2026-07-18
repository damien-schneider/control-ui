import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/components/control-ui/lib/cn";

export function GuideVisual({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("mt-5 overflow-hidden rounded-xl border border-border/80 bg-card/45 text-foreground", className)}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-border/70 border-b px-4 py-3">
        <span className="font-medium text-label">{title}</span>
        {description ? <span className="text-caption text-muted-foreground">{description}</span> : null}
      </figcaption>
      <div className="p-4 sm:p-5">{children}</div>
    </figure>
  );
}

export function FlowArrow({ direction = "right", className }: { direction?: "down" | "right"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center text-muted-foreground/70",
        direction === "down" ? "h-6 w-full" : "h-full min-h-6 w-6",
        className,
      )}
    >
      {direction === "down" ? "↓" : "→"}
    </span>
  );
}

export function DiagramNode({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-background/80 px-3 py-2.5 text-label leading-5 transition-[border-color,background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background",
        className,
      )}
      {...props}
    />
  );
}
