"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { BadgeKnobStyle } from "@/components/control-ui/knob-contracts/badge-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export const badgeVariants = ["default", "secondary", "destructive", "outline"] as const;

export type BadgeVariant = (typeof badgeVariants)[number];

export const badgeSizes = ["sm", "md"] as const;

export type BadgeSize = (typeof badgeSizes)[number];

export const BADGE_COLORS = ["neutral", "red", "orange", "yellow", "green", "blue", "purple", "pink"] as const;

export type BadgeColor = (typeof BADGE_COLORS)[number];

export type BadgeProps = Omit<ComponentProps<"span">, "style"> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  render?: RenderProp<ComponentProps<"span">>;
  style?: CSSProperties & BadgeKnobStyle;
};

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
