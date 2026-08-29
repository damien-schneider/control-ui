import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";

import type { PaginationKnobStyle } from "@/components/control-ui/knob-contracts/pagination-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type PaginationEllipsisProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & PaginationKnobStyle };

export type PaginationLinkProps = Omit<
  ComponentProps<"a"> & {
    isActive?: boolean;
  },
  "style"
> & { style?: CSSProperties & PaginationKnobStyle };

// Links are control-shaped by hand rather than importing Button, so pagination installs alone.
export function Pagination({ className, ...props }: ComponentProps<"nav"> & { style?: CSSProperties & PaginationKnobStyle }) {
  return (
    // the <nav> already carries role; label names landmark
    <nav
      aria-label="pagination"
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="root"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul"> & { style?: CSSProperties & PaginationKnobStyle }) {
  return (
    <ul
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="content"
      className={cn("flex flex-row items-center", className)}
      {...props}
    />
  );
}

export function PaginationItem({ className, ...props }: ComponentProps<"li"> & { style?: CSSProperties & PaginationKnobStyle }) {
  return <li data-control-ui="pagination" data-control-family="pagination" data-slot="item" className={className} {...props} />;
}

const paginationLinkChrome =
  "inline-flex h-[var(--control-h-sm)] min-w-[var(--control-h-sm)] cursor-pointer select-none items-center justify-center whitespace-nowrap aria-disabled:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0";

export function PaginationLink({ isActive = false, className, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="link"
      data-control="true"
      data-active={isActive ? "true" : undefined}
      className={cn(paginationLinkChrome, className)}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" className={className} {...props}>
      <ChevronLeft />
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" className={className} {...props}>
      <span>Next</span>
      <ChevronRight />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden="true"
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="ellipsis"
      className={cn("flex h-[var(--control-h-sm)] min-w-[var(--control-h-sm)] items-center justify-center [&>svg]:size-4", className)}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  );
}
