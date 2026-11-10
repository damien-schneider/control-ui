"use client";

import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { BreadcrumbKnobStyle } from "@/components/control-ui/knob-contracts/breadcrumb-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type BreadcrumbProps = ComponentProps<"nav"> & { style?: CSSProperties & BreadcrumbKnobStyle };
export type BreadcrumbListProps = Omit<ComponentProps<"ol">, "style"> & { style?: CSSProperties & BreadcrumbKnobStyle };
export type BreadcrumbItemProps = ComponentProps<"li"> & { style?: CSSProperties & BreadcrumbKnobStyle };
export type BreadcrumbLinkProps = Omit<ComponentProps<"a">, "style"> & {
  render?: RenderProp<ComponentProps<"a">>;
  style?: CSSProperties & BreadcrumbKnobStyle;
};
export type BreadcrumbPageProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & BreadcrumbKnobStyle };
export type BreadcrumbSeparatorProps = ComponentProps<"li"> & { style?: CSSProperties & BreadcrumbKnobStyle };
export type BreadcrumbEllipsisProps = Omit<ComponentProps<"span">, "children"> & {
  label?: string;
  style?: CSSProperties & BreadcrumbKnobStyle;
};

export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="root"
      className={className}
      {...props}
    />
  );
}

export function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="list"
      className={cn("flex flex-wrap items-center break-words", className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="item"
      className={cn("inline-flex items-center", className)}
      {...props}
    />
  );
}

export function BreadcrumbLink({ render, className, children, ...props }: BreadcrumbLinkProps) {
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

export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
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

export function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="separator"
      role="presentation"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children ?? <ChevronRight data-icon-dir="inline" />}
    </li>
  );
}

export function BreadcrumbEllipsis({ label = "Show hidden breadcrumbs", className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      data-control-ui="breadcrumb"
      data-control-family="breadcrumb"
      data-slot="ellipsis"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
