"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { HoverIndicator, RenderProp, SelectionIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinIndicator } from "@/components/control-ui/skin";
import { useSidebar } from "@/components/control-ui/ui/sidebar-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export const sidebarMenuButtonVariants = ["default", "outline"] as const;

export type SidebarMenuButtonVariant = (typeof sidebarMenuButtonVariants)[number];

export const sidebarMenuButtonSizes = ["default", "sm", "lg"] as const;

export type SidebarMenuButtonSize = (typeof sidebarMenuButtonSizes)[number];

export type SidebarGroupLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & SidebarKnobStyle } & {
  render?: RenderProp<ComponentProps<"div">>;
};

export type SidebarGroupContentProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

export type SidebarMenuActionProps = Omit<ComponentProps<"button">, "style"> & {
  render?: RenderProp<ComponentProps<"button">>;
  showOnHover?: boolean;
  style?: CSSProperties & SidebarKnobStyle;
};

export function SidebarGroupContent({ className, ...props }: SidebarGroupContentProps) {
  return (
    <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="group-content" className={cn("w-full", className)} {...props} />
  );
}

export function SidebarMenuAction({ className, render, showOnHover = false, children, ...props }: SidebarMenuActionProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props: {
      type: "button",
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "menu-action",
      "data-show-on-hover": showOnHover || undefined,
      className: cn(
        "end-1 flex size-5 items-center justify-center -translate-y-1/2 disabled:pointer-events-none group-data-[collapsible=icon]:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        className,
        "absolute",
      ),
      children,
    },
  });
}

export type SidebarMenuButtonProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & SidebarKnobStyle } & {
  render?: RenderProp<ComponentProps<"button">>;
  isActive?: boolean;
  tooltip?: ReactNode;
  variant?: SidebarMenuButtonVariant;
  size?: SidebarMenuButtonSize;
};

export function SidebarGroup({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & SidebarKnobStyle }) {
  return (
    <div
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="group"
      className={cn("relative flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, render, children, ...props }: SidebarGroupLabelProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "group-label",
      className: cn(
        "flex h-[var(--control-h-sm)] shrink-0 items-center [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:-mt-[var(--control-h-sm)] group-data-[collapsible=icon]:opacity-0",
        className,
      ),
      children,
    },
  });
}

export type SidebarSelectionIndicator = SelectionIndicator | HoverIndicator;

const SidebarMenuContext = createContext<SidebarSelectionIndicator>("none");

export function SidebarMenu({
  className,
  indicator,
  style,
  children,
  ...props
}: ComponentProps<"ul"> & {
  indicator?: SidebarSelectionIndicator;
} & { style?: CSSProperties & SidebarKnobStyle }) {
  const resolvedIndicator = indicator ?? skinIndicator("sidebar") ?? "none";
  const hasHighlight = resolvedIndicator !== "none";

  const list = (
    <ul
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu"
      data-indicator={resolvedIndicator}
      className={cn("flex min-w-0 flex-col", hasHighlight ? undefined : className)}
      style={hasHighlight ? undefined : style}
      {...props}
    >
      <SidebarMenuContext.Provider value={resolvedIndicator}>{children}</SidebarMenuContext.Provider>
    </ul>
  );

  if (!hasHighlight) return list;

  return (
    <div
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu-track"
      data-indicator={resolvedIndicator}
      data-track={resolvedIndicator}
      className={cn("relative isolate", className)}
      style={style}
    >
      {list}
      <TrackHighlight />
    </div>
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li"> & { style?: CSSProperties & SidebarKnobStyle }) {
  return (
    <li
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariantClasses = {
  default: null,
  outline: null,
} satisfies Record<SidebarMenuButtonVariant, null>;

const sidebarMenuButtonSizeClasses = {
  default: "group-data-[collapsible=icon]:size-[var(--control-h-md)]!",
  sm: "group-data-[collapsible=icon]:size-[var(--control-h-sm)]!",
  lg: "group-data-[collapsible=icon]:size-[var(--control-h-lg)]!",
} satisfies Record<SidebarMenuButtonSize, string>;

const sidebarMenuButtonClasses = cva(
  "peer/menu-button flex w-full items-center overflow-hidden text-start group-data-[collapsible=icon]:px-0! disabled:pointer-events-none aria-disabled:pointer-events-none [&>span]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: sidebarMenuButtonVariantClasses,
      size: sidebarMenuButtonSizeClasses,
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar();
  const indicator = useContext(SidebarMenuContext);

  const button = useRender({
    defaultTagName: "button",
    render,
    props: {
      type: "button",
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "menu-button",
      "data-size": size,
      "data-variant": variant,
      "data-active": isActive || undefined,
      "data-track-item": indicator !== "none" ? "" : undefined,
      className: cn(sidebarMenuButtonClasses({ variant, size }), className),
      children,
    },
  });

  if (!tooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<typeof SidebarMenu>) {
  return <SidebarMenu data-submenu="" className={cn("group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
