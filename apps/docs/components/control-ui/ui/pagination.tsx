import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import type { PaginationLinkProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Links are control-shaped by hand rather than importing Button, so pagination installs alone.
export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    // the <nav> already carries role; label names landmark
    <nav
      aria-label="pagination"
      data-control-ui="pagination"
      data-slot="root"
      className={cn("mx-auto flex w-full justify-center", skinSlot("pagination", "root", {}), className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-control-ui="pagination" data-slot="content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

export function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-control-ui="pagination" data-slot="item" className={className} {...props} />;
}

const paginationLinkChrome =
  "inline-flex h-[var(--control-h-sm)] min-w-[var(--control-h-sm)] cursor-pointer select-none items-center justify-center gap-1 whitespace-nowrap rounded-[var(--radius-control)] px-2.5 text-sm font-medium outline-none transition duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring,oklch(from_var(--foreground)_l_c_h_/_0.2))] aria-disabled:pointer-events-none aria-disabled:opacity-45 [&>svg]:size-4 [&>svg]:shrink-0";

export function PaginationLink({ isActive = false, className, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-control-ui="pagination"
      data-slot="link"
      data-control="true"
      data-active={isActive ? "true" : undefined}
      className={cn(
        paginationLinkChrome,
        isActive ? "bg-card/72 text-foreground shadow-sm ring-1 ring-inset ring-border" : "text-foreground hover:bg-foreground/6",
        skinSlot("pagination", "link", { active: isActive }),
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={cn("gap-1 pr-2.5 pl-2", className)} {...props}>
      <ChevronLeft />
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" className={cn("gap-1 pr-2 pl-2.5", className)} {...props}>
      <span>Next</span>
      <ChevronRight />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="pagination"
      data-slot="ellipsis"
      className={cn(
        "flex h-[var(--control-h-sm)] min-w-[var(--control-h-sm)] items-center justify-center text-muted-foreground [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  );
}
