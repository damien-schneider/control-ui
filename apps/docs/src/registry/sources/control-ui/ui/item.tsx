"use client";

import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import type { ItemGroupProps, ItemProps, ItemSeparatorProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { useAsChildRender } from "@/components/control-ui/lib/use-as-child-render";
import { skinSlot } from "@/components/control-ui/skin";
import { Separator } from "@/components/control-ui/ui/separator";

// Refined skin slot, plain markup: horizontal list row (media+content+actions) on --radius-lg surface.
// `variant`: default(bare)/outline(ring)/muted(filled). `render` renders row AS link/button for a single focus/hover target.
const itemVariant = cva(
  "flex items-center gap-3 rounded-[var(--radius-lg)] p-3 text-sm outline-none transition duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-foreground/20 [&[href]]:cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        outline: "ring-1 ring-inset ring-border",
        muted: "bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function ItemGroup({ className, ...props }: ItemGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Item may render as a link or button, so a ul would require invalid wrappers.
    <div role="list" data-control-ui="item" data-slot="group" className={cn("group/item-group flex flex-col", className)} {...props} />
  );
}

export function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  return <Separator data-control-ui="item" data-slot="separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

export function Item({ variant = "default", asChild = false, render, className, children, ...props }: ItemProps) {
  return useAsChildRender({
    defaultTagName: "div",
    asChild,
    render,
    children,
    props: {
      ...props,
      "data-control-ui": "item",
      "data-slot": "root",
      "data-variant": variant,
      className: cn(itemVariant({ variant }), skinSlot("item", "root", { variant }), className),
    },
  });
}

// Leading media: an icon, avatar or thumbnail. Icons inherit --muted-foreground.
export function ItemMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="item"
      data-slot="media"
      className={cn(
        "flex shrink-0 items-center justify-center self-start text-muted-foreground [&>svg]:size-5 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function ItemContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-control-ui="item" data-slot="content" className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />;
}

export function ItemTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="item"
      data-slot="title"
      className={cn("flex w-fit items-center gap-2 text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  );
}

export function ItemDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-control-ui="item"
      data-slot="description"
      className={cn("line-clamp-2 text-sm/relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

// Trailing actions: buttons, a switch or a chevron. Sits at the row's end and never shrinks.
export function ItemActions({ className, ...props }: ComponentProps<"div">) {
  return <div data-control-ui="item" data-slot="actions" className={cn("flex shrink-0 items-center gap-1.5", className)} {...props} />;
}

export function ItemHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="item"
      data-slot="header"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function ItemFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="item"
      data-slot="footer"
      className={cn("flex basis-full items-center justify-between gap-2 text-meta text-muted-foreground", className)}
      {...props}
    />
  );
}
