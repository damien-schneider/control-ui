import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";

import type { PaginationKnobStyle } from "@/components/control-ui/knob-contracts/pagination-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type PaginationEllipsisProps = Omit<ComponentProps<"span">, "style" | "children"> & {
  label?: string;
  style?: CSSProperties & PaginationKnobStyle;
};

export type PaginationLinkProps = Omit<
  ComponentProps<"a"> & {
    isActive?: boolean;
    disabled?: boolean;
  },
  "style"
> & { style?: CSSProperties & PaginationKnobStyle };

// Links are control-shaped by hand rather than importing Button, so pagination installs alone.
export function Pagination({ className, ...props }: ComponentProps<"nav"> & { style?: CSSProperties & PaginationKnobStyle }) {
  return (
    <nav
      aria-label="Pagination"
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
  "inline-flex h-control-sm min-w-control-sm cursor-pointer select-none items-center justify-center whitespace-nowrap aria-disabled:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0";

export function PaginationLink({ isActive = false, disabled = false, href, className, ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="link"
      data-control="true"
      data-active={isActive ? "true" : undefined}
      role={disabled ? "link" : undefined}
      aria-disabled={disabled || undefined}
      className={cn(paginationLinkChrome, className)}
      {...props}
      href={disabled ? undefined : href}
    />
  );
}

export function PaginationPrevious({ className, children = "Previous", ...props }: PaginationLinkProps) {
  return (
    <PaginationLink className={className} {...props}>
      <ChevronLeft aria-hidden="true" data-icon-dir="inline" />
      <span>{children}</span>
    </PaginationLink>
  );
}

export function PaginationNext({ className, children = "Next", ...props }: PaginationLinkProps) {
  return (
    <PaginationLink className={className} {...props}>
      <span>{children}</span>
      <ChevronRight aria-hidden="true" data-icon-dir="inline" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ label = "More pages", className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      data-control-ui="pagination"
      data-control-family="pagination"
      data-slot="ellipsis"
      className={cn("flex h-control-sm min-w-control-sm items-center justify-center [&>svg]:size-4", className)}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
