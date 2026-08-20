"use client";

import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/contracts";
import type { BreadcrumbKnobStyle } from "@/components/control-ui/knob-contracts";
import { cn } from "@/components/control-ui/lib/cn";

export function Breadcrumb({ className, ...props }: ComponentProps<"nav"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <nav
      aria-label="breadcrumb"
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="root"
      className={className}
      {...props}
    />
  );
}

export function BreadcrumbList({
  className,
  ...props
}: Omit<ComponentProps<"ol">, "style"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <ol
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="list"
      className={cn("flex flex-wrap items-center gap-1.5 break-words sm:gap-2.5", className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <li
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
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
      "data-control-family": "breadcrumb",
      "data-slot": "link",
      className: className,
      children,
    },
  });
}

export function BreadcrumbPage({
  className,
  ...props
}: Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <span
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="page"
      aria-current="page"
      className={className}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<"li"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <li
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
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

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span"> & { style?: CSSProperties & BreadcrumbKnobStyle }) {
  return (
    <span
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
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
