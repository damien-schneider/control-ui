"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { HoverIndicator, RenderProp, SelectionIndicator } from "@/components/control-ui/control-props";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

import { SidebarIconRailContext, SidebarSurfaceContext, useSidebarIconOnly } from "@/components/control-ui/ui/sidebar-provider";
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
        "end-1 flex size-5 items-center justify-center -translate-y-1/2 group-data-[collapsible=icon]:hidden",
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

export type SidebarGroupProps = ComponentProps<"div"> & { style?: CSSProperties & SidebarKnobStyle };

const SidebarGroupLabelContext = createContext<((labelId: string | undefined) => void) | null>(null);

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  const [labelId, setLabelId] = useState<string>();
  return (
    <SidebarGroupLabelContext.Provider value={setLabelId}>
      <div
        {...(labelId ? ({ role: "group", "aria-labelledby": labelId } as const) : undefined)}
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="group"
        className={cn("relative flex w-full min-w-0 flex-col", className)}
        {...props}
      />
    </SidebarGroupLabelContext.Provider>
  );
}

export function SidebarGroupLabel({ className, render, children, id, ref, ...props }: SidebarGroupLabelProps) {
  const generatedId = useId();
  const labelId = id ?? generatedId;
  const labelRef = useRef<HTMLDivElement>(null);
  const registerLabel = useContext(SidebarGroupLabelContext);

  useEffect(() => {
    registerLabel?.(labelRef.current?.id || labelId);
    return () => registerLabel?.(undefined);
  }, [registerLabel, labelId]);

  return useRender({
    defaultTagName: "div",
    render,
    ref: [ref ?? null, labelRef],
    props: {
      ...props,
      id: labelId,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "group-label",
      className: cn(
        "flex h-control-sm shrink-0 items-center",
        "group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:-mt-control-sm group-data-[collapsible=icon]:opacity-0",
        className,
      ),
      children,
    },
  });
}

export type SidebarSelectionIndicator = SelectionIndicator | HoverIndicator;

const SidebarMenuContext = createContext<SidebarSelectionIndicator>("none");

export type SidebarMenuProps = ComponentProps<"ul"> & {
  indicator?: SidebarSelectionIndicator;
} & { style?: CSSProperties & SidebarKnobStyle };

export function SidebarMenu({ className, indicator, style, children, ...props }: SidebarMenuProps) {
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

export type SidebarMenuItemProps = ComponentProps<"li"> & { style?: CSSProperties & SidebarKnobStyle };

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
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
  const surface = useContext(SidebarSurfaceContext);
  const inIconRail = useContext(SidebarIconRailContext);
  const iconOnly = useSidebarIconOnly();
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
        "peer/menu-button flex items-center overflow-hidden text-start aria-disabled:pointer-events-none [&>span]:truncate",
        className,
      ),
      children,
    },
  });

  if (!tooltip && !inIconRail && surface?.collapsible !== "icon") return button;

  return (
    <Tooltip
      disabled={!iconOnly}
      onOpenChange={(open) => {
        if (open && !tooltip) setTextLabel(buttonRef.current?.textContent?.trim() ?? "");
      }}
    >
      <TooltipTrigger render={button} />
      <TooltipContent side={surface?.side === "right" ? "inline-start" : "inline-end"} align="center" hidden={!iconOnly}>
        {tooltip ?? textLabel}
      </TooltipContent>
    </Tooltip>
  );
}

export type SidebarMenuSubProps = SidebarMenuProps;

export function SidebarMenuSub({ className, ...props }: SidebarMenuSubProps) {
  return <SidebarMenu data-submenu="" className={cn("group-data-[collapsible=icon]:hidden", className)} {...props} />;
}
