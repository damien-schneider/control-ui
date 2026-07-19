"use client";

import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import type { RenderProp } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// Plain semantic breadcrumb (no positioner), themed via --muted-foreground/--foreground.
export function Breadcrumb({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-control-ui="breadcrumb"
      data-slot="root"
      className={cn(skinSlot("breadcrumb", "root", {}), className)}
      {...props}
    />
  );
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      data-control-ui="breadcrumb"
      data-slot="list"
      className={cn("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5", className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-control-ui="breadcrumb" data-slot="item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export function BreadcrumbLink({
  render,
  className,
  children,
  ...props
}: ComponentProps<"a"> & {
  render?: RenderProp<ComponentProps<"a">>;
}) {
  return useRender({
    defaultTagName: "a",
    render,
    props: {
      ...props,
      "data-control-ui": "breadcrumb",
      "data-slot": "link",
      className: cn("transition-colors hover:text-foreground", className),
      children,
    },
  });
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-control-ui="breadcrumb"
      data-slot="page"
      aria-current="page"
      className={cn("font-normal text-foreground", skinSlot("breadcrumb", "page", {}), className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-control-ui="breadcrumb"
      data-slot="separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-control-ui="breadcrumb"
      data-slot="ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
