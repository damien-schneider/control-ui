"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { BadgeProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
type BadgeColor = NonNullable<BadgeProps["color"]>;

const defaultColorByVariant: Record<BadgeVariant, BadgeColor> = {
  default: "neutral",
  secondary: "neutral",
  destructive: "red",
  outline: "neutral",
};

const badgeVariant = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-[var(--radius-control)] border font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring,oklch(from_var(--foreground)_l_c_h_/_0.2))] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
      },
      size: {
        sm: "h-4 px-1.5 py-0 text-micro",
        md: "px-2 py-0.5 text-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export function Badge({ variant = "default", size = "md", color, render, className, children, ...props }: BadgeProps) {
  const resolvedColor = color ?? defaultColorByVariant[variant];

  return useRender({
    defaultTagName: "span",
    render,
    props: {
      ...props,
      "data-control-ui": "badge",
      "data-slot": "root",
      "data-variant": variant,
      "data-size": size,
      "data-color": resolvedColor,
      className: cn(badgeVariant({ variant, size }), skinSlot("badge", "root", { variant, size, color: resolvedColor }), className),
      children,
    },
  });
}
