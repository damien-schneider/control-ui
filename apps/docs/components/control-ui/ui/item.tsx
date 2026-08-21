"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties } from "react";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { ItemKnobStyle } from "@/components/control-ui/knob-contracts/item-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Separator } from "@/components/control-ui/ui/separator";

export const itemVariants = ["default", "outline", "muted"] as const;

export type ItemVariant = (typeof itemVariants)[number];

export type ItemProps = Omit<
  ComponentProps<"div"> & {
    variant?: ItemVariant;
    render?: RenderProp<ComponentProps<"div">>;
  },
  "style"
> & { style?: CSSProperties & ItemKnobStyle };

export type ItemDescriptionProps = Omit<ComponentProps<"p">, "style"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemFooterProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemMediaProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemTitleProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemGroupProps = ComponentProps<"div"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemSeparatorProps = ComponentProps<"div">;

export function ItemGroup({ className, ...props }: ItemGroupProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Item may render as a link or button, so a ul would require invalid wrappers.
    <div
      role="list"
      data-control-ui="item"
      data-control-family="item"
      data-slot="group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  );
}

export function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  return <Separator data-control-ui="item" data-slot="separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

export function Item({ variant = "default", render, className, children, ...props }: ItemProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "item",
      "data-control-family": "item",
      "data-slot": "root",
      "data-variant": variant,
      className: cn("flex items-center gap-3 p-3 [&[href]]:cursor-pointer", className),
      children,
    },
  });
}

export function ItemMedia({ className, ...props }: ItemMediaProps) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="media"
      className={cn("flex shrink-0 items-center justify-center self-start [&>svg]:size-5 [&>svg]:shrink-0", className)}
      {...props}
    />
  );
}

export function ItemContent({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & ItemKnobStyle }) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="content"
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

export function ItemTitle({ className, ...props }: ItemTitleProps) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="title"
      className={cn("flex w-fit items-center gap-2", className)}
      {...props}
    />
  );
}

export function ItemDescription({ className, ...props }: ItemDescriptionProps) {
  return (
    <p data-control-ui="item" data-control-family="item" data-slot="description" className={cn("line-clamp-2", className)} {...props} />
  );
}

// never shrinks, so long content column cannot squeeze actions
export function ItemActions({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & ItemKnobStyle }) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="actions"
      className={cn("flex shrink-0 items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function ItemHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & ItemKnobStyle }) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="header"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export function ItemFooter({ className, ...props }: ItemFooterProps) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="footer"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}
