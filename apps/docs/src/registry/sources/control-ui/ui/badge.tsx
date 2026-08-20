"use client";

import { useRender } from "@base-ui/react/use-render";
import type { BadgeProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
type BadgeColor = NonNullable<BadgeProps["color"]>;

const defaultColorByVariant: Record<BadgeVariant, BadgeColor> = {
  default: "neutral",
  secondary: "neutral",
  destructive: "red",
  outline: "neutral",
};

export function Badge({ variant = "default", size = "md", color, render, className, children, ...props }: BadgeProps) {
  const resolvedColor = color ?? defaultColorByVariant[variant];

  return useRender({
    defaultTagName: "span",
    render,
    props: {
      ...props,
      "data-control-ui": "badge",
      "data-control-family": "badge",
      "data-slot": "root",
      "data-variant": variant,
      "data-size": size,
      "data-color": resolvedColor,
      className: cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
        size === "sm" ? "h-4 px-1.5 py-0" : "px-2 py-0.5",
        className,
      ),
      children,
    },
  });
}
