"use client";

import { useRender } from "@base-ui/react/use-render";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent } from "react";

import type { RenderProp } from "@/components/control-ui/control-props";
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
    render?: RenderProp<ComponentProps<"a">>;
  },
  "style"
> & { style?: CSSProperties & PaginationKnobStyle };

export type PaginationProps = ComponentProps<"nav"> & { style?: CSSProperties & PaginationKnobStyle };
export type PaginationContentProps = ComponentProps<"ul"> & { style?: CSSProperties & PaginationKnobStyle };
export type PaginationItemProps = ComponentProps<"li"> & { style?: CSSProperties & PaginationKnobStyle };

// Links are control-shaped by hand rather than importing Button, so pagination installs alone.
export function Pagination({ className, ...props }: PaginationProps) {
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

export function PaginationContent({ className, ...props }: PaginationContentProps) {
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

export function PaginationItem({ className, ...props }: PaginationItemProps) {
  return <li data-control-ui="pagination" data-control-family="pagination" data-slot="item" className={className} {...props} />;
}

const paginationLinkChrome = "inline-flex select-none items-center justify-center whitespace-nowrap";

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export function PaginationLink({ isActive = false, disabled = false, render, href, onClick, className, ...props }: PaginationLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    props: {
      "aria-current": isActive ? "page" : undefined,
      "data-control-ui": "pagination",
      "data-control-family": "pagination",
      "data-slot": "link",
      "data-control": "true",
      "data-active": isActive ? "true" : undefined,
      role: disabled ? "link" : undefined,
      "aria-disabled": disabled || undefined,
      className: cn(paginationLinkChrome, className),
      ...props,
      href: disabled ? undefined : href,
      onClick: disabled ? preventNavigation : onClick,
    },
  });
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
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
