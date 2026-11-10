"use client";

import { useRender } from "@base-ui/react/use-render";
import { type ComponentProps, type CSSProperties, createContext, useContext } from "react";
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

export type ItemTitleProps = Omit<ComponentProps<"div">, "style"> & {
  render?: RenderProp<ComponentProps<"div">>;
  style?: CSSProperties & ItemKnobStyle;
};

export type ItemGroupProps = ComponentProps<"div"> & { style?: CSSProperties & ItemKnobStyle };

export type ItemSeparatorProps = Omit<ComponentProps<typeof Separator>, "orientation">;

export type ItemActionsProps = Omit<ComponentProps<"div">, "style"> & {
  showOnHover?: boolean;
  style?: CSSProperties & ItemKnobStyle;
};

const ItemListContext = createContext(false);

export function ItemGroup({ role = "list", className, ...props }: ItemGroupProps) {
  return (
    <ItemListContext.Provider value={role === "list"}>
      <div
        role={role}
        data-control-ui="item"
        data-control-family="item"
        data-slot="group"
        className={cn("group/item-group flex flex-col", className)}
        {...props}
      />
    </ItemListContext.Provider>
  );
}

export function ItemSeparator({ className, ...props }: ItemSeparatorProps) {
  const inList = useContext(ItemListContext);
  return (
    <Separator
      aria-hidden={inList || undefined}
      data-control-ui="item"
      data-slot="separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  );
}

export function Item({ variant = "default", render, className, children, ...props }: ItemProps) {
  const inList = useContext(ItemListContext);
  const listItemRole = inList && !render && !props.role ? { role: "listitem" } : undefined;
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      ...listItemRole,
      "data-control-ui": "item",
      "data-control-family": "item",
      "data-slot": "root",
      "data-variant": variant,
      className: cn("flex flex-wrap items-center [&[href]]:cursor-pointer", className),
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
      className={cn("flex shrink-0 items-center justify-center self-start [&>svg]:shrink-0", className)}
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
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function ItemTitle({ render, className, ...props }: ItemTitleProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "item",
      "data-control-family": "item",
      "data-slot": "title",
      className: cn("flex w-fit items-center", className),
    },
  });
}

export function ItemDescription({ className, ...props }: ItemDescriptionProps) {
  return (
    <p data-control-ui="item" data-control-family="item" data-slot="description" className={cn("line-clamp-2", className)} {...props} />
  );
}

// never shrinks, so long content column cannot squeeze actions
export function ItemActions({ showOnHover, className, ...props }: ItemActionsProps) {
  return (
    <div
      data-control-ui="item"
      data-control-family="item"
      data-slot="actions"
      data-show-on-hover={showOnHover || undefined}
      className={cn("flex shrink-0 items-center", className)}
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
      className={cn("flex basis-full items-center justify-between", className)}
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
      className={cn("flex basis-full items-center justify-between", className)}
      {...props}
    />
  );
}
