"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useRef, useState } from "react";
import type { HoverIndicator, RenderProp, SelectionIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

import { SidebarSurfaceContext, useSidebar } from "@/components/control-ui/ui/sidebar-provider";
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
  const skin = useSkin();
  const resolvedIndicator = indicator ?? skin.indicators?.sidebar ?? "none";
  const hasHighlight = resolvedIndicator === "slide";

  const list = (
    <ul
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu"
      data-indicator={resolvedIndicator}
      className={cn(
        "flex min-w-0 flex-col group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0",
        hasHighlight ? undefined : className,
      )}
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

export type SidebarMenuBadgeProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

export function SidebarMenuBadge({ className, ...props }: SidebarMenuBadgeProps) {
  return (
    <div
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu-badge"
      className={cn(
        "pointer-events-none absolute flex -translate-y-1/2 select-none items-center justify-center tabular-nums group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ref,
  ...props
}: SidebarMenuButtonProps) {
  const { isMobile, state } = useSidebar();
  const surface = useContext(SidebarSurfaceContext);
  const tooltipEnabled = !isMobile && state === "collapsed" && surface?.collapsible === "icon";
  const indicator = useContext(SidebarMenuContext);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [textLabel, setTextLabel] = useState("");

  const button = useRender({
    defaultTagName: "button",
    render,
    ref: [ref ?? null, buttonRef],
    props: {
      type: "button",
      "aria-current": isActive ? "page" : undefined,
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "menu-button",
      "data-size": size,
      "data-variant": variant,
      "data-active": isActive || undefined,
      "data-indicator": indicator,
      "data-track-item": indicator === "slide" ? "" : undefined,
      className: cn(
        "peer/menu-button flex items-center overflow-hidden text-start disabled:pointer-events-none aria-disabled:pointer-events-none [&>span]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        className,
      ),
      children,
    },
  });

  if (!tooltip && surface?.collapsible !== "icon") return button;

  return (
    <Tooltip
      disabled={!tooltipEnabled}
      onOpenChange={(open) => {
        if (open && !tooltip) setTextLabel(buttonRef.current?.textContent?.trim() ?? "");
      }}
    >
      <TooltipTrigger render={button} />
      <TooltipContent side={surface?.side === "right" ? "inline-start" : "inline-end"} align="center" hidden={!tooltipEnabled}>
        {tooltip ?? textLabel}
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<typeof SidebarMenu>) {
  return <SidebarMenu data-submenu="" className={cn("group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
