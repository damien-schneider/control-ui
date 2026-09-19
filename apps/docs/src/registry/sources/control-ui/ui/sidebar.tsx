"use client";

import { useRender } from "@base-ui/react/use-render";
import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, Ref } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { SidebarLayout } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/control-ui/ui/sheet";
import {
  type SidebarStyle,
  SidebarSurfaceContext,
  useSidebar,
  useSidebarElements,
  useSidebarSurface,
} from "@/components/control-ui/ui/sidebar-provider";
import { SidebarResizeRail, type SidebarResizeRailProps } from "@/components/control-ui/ui/sidebar-resize-rail";

// biome-ignore lint/performance/noBarrelFile: Preserve the sidebar install-facing API.
export {
  SidebarGroup,
  SidebarGroupContent,
  type SidebarGroupContentProps,
  SidebarGroupLabel,
  type SidebarGroupLabelProps,
  SidebarMenu,
  SidebarMenuAction,
  type SidebarMenuActionProps,
  SidebarMenuButton,
  type SidebarMenuButtonProps,
  type SidebarMenuButtonSize,
  type SidebarMenuButtonVariant,
  SidebarMenuItem,
  SidebarMenuSub,
  type SidebarSelectionIndicator,
  sidebarMenuButtonSizes,
  sidebarMenuButtonVariants,
} from "@/components/control-ui/ui/sidebar-menu";
export { SidebarProvider, type SidebarProviderProps, type SidebarStyle, useSidebar } from "@/components/control-ui/ui/sidebar-provider";

export type SidebarRailProps =
  | (Omit<ComponentProps<"button">, "style"> & { resizable?: false; style?: CSSProperties & SidebarKnobStyle })
  | (SidebarResizeRailProps & { resizable: true });

export type SidebarInsetProps = Omit<ComponentProps<"main">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

type SidebarSurfaceStyle = CSSProperties & SidebarKnobStyle;

const SIDEBAR_WIDTH_MOBILE = "18rem";
const sidebarTriggerWidth = {
  xs: "w-[var(--control-h-xs)]",
  sm: "w-[var(--control-h-sm)]",
  md: "w-[var(--control-h-md)]",
  lg: "w-[var(--control-h-lg)]",
} satisfies Record<NonNullable<ComponentProps<typeof Button>["size"]>, string>;

export type SidebarProps = Omit<ComponentProps<"div">, "style"> & {
  side?: "left" | "right";
  variant?: SidebarLayout;
  collapsible?: "offcanvas" | "icon" | "none";
  style?: SidebarSurfaceStyle;
};

export function Sidebar({ side = "left", collapsible = "offcanvas", ...props }: SidebarProps) {
  const [railContainer, setRailContainer] = useState<HTMLDivElement | null>(null);
  return (
    <SidebarSurfaceContext.Provider value={{ side, collapsible, railContainer }}>
      <SidebarSurface {...props} railContainerRef={setRailContainer} />
    </SidebarSurfaceContext.Provider>
  );
}

function SidebarSurface({
  variant,
  ref,
  className,
  children,
  style,
  railContainerRef,
  ...props
}: SidebarProps & { railContainerRef: Ref<HTMLDivElement> }) {
  const { side, collapsible } = useSidebarSurface();
  const { offcanvasRef } = useSidebarElements();
  const skin = useSkin();
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const resolvedVariant = variant ?? skin.sidebarLayout ?? "sidebar";

  const container = useRender({
    defaultTagName: "div",
    ref: collapsible === "offcanvas" ? [ref ?? null, offcanvasRef] : ref,
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "container",
      tabIndex: -1,
      className: cn(
        "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) lg:flex",
        side === "left"
          ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
          : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
        resolvedVariant === "floating" || resolvedVariant === "inset"
          ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
          : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        className,
      ),
      children: (
        <>
          <div
            data-control-ui="sidebar"
            data-control-family="sidebar"
            data-slot="inner"
            className="flex h-full w-full flex-col"
            inert={state === "collapsed" && collapsible === "offcanvas"}
          >
            {children}
          </div>
          <div ref={railContainerRef} className="contents" />
        </>
      ),
    },
  });

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="root"
        data-surface="panel"
        data-variant={resolvedVariant}
        data-side={side}
        className={cn("group relative flex h-full w-(--sidebar-width) flex-col", className)}
        style={style}
        {...props}
      >
        {children}
        <div ref={railContainerRef} className="contents" />
      </div>
    );
  }

  if (isMobile) {
    const mobileSheetStyle: SidebarStyle & SidebarSurfaceStyle = {
      "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
      ...style,
    };

    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side={side} className="w-(--sidebar-width) gap-0 p-0" style={mobileSheetStyle}>
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div
            ref={ref}
            data-control-ui="sidebar"
            data-control-family="sidebar"
            data-slot="root"
            data-surface="panel"
            data-variant={resolvedVariant}
            data-mobile=""
            data-side={side}
            className={cn("flex min-h-0 flex-1 flex-col", className)}
            style={style}
            {...props}
          >
            <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="inner" className="flex min-h-0 flex-1 flex-col">
              {children}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn("group peer hidden lg:block", side === "right" && "order-last")}
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="root"
      data-surface="panel"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={resolvedVariant}
      data-side={side}
      style={style}
    >
      <div
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="gap"
        className={cn(
          "relative w-(--sidebar-width)",
          "group-data-[collapsible=offcanvas]:w-0",
          resolvedVariant === "floating" || resolvedVariant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      {container}
    </div>
  );
}

export function SidebarTrigger({ className, onClick, size = "sm", ref, ...props }: ComponentProps<typeof Button>) {
  const { toggleSidebar, isMobile, openMobile, open } = useSidebar();
  const { triggerRef, railRef } = useSidebarElements();

  return useRender({
    defaultTagName: "button",
    render: <Button variant="ghost" size={size} />,
    ref: [ref ?? null, triggerRef],
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-slot": "trigger",
      "data-sidebar-trigger": "",
      "aria-expanded": isMobile ? openMobile : open,
      className: cn(sidebarTriggerWidth[size], "px-0", className),
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleSidebar();
        if (!isMobile && !open) railRef.current?.focus({ preventScroll: true });
      },
      children: (
        <>
          <PanelLeftIcon className="size-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </>
      ),
    },
  });
}

export function SidebarRail(props: SidebarRailProps) {
  const { isMobile } = useSidebar();
  const { railContainer } = useSidebarSurface();
  if (isMobile || !railContainer) return null;
  if (props.resizable) {
    const { resizable, ...resizeProps } = props;
    return createPortal(<SidebarResizeRail {...resizeProps} />, railContainer);
  }
  const { resizable, ...toggleProps } = props;
  return createPortal(<SidebarToggleRail {...toggleProps} />, railContainer);
}

function SidebarToggleRail({
  className,
  ref,
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & SidebarKnobStyle }) {
  const { toggleSidebar, open } = useSidebar();
  const { railRef } = useSidebarElements();
  return useRender({
    defaultTagName: "button",
    ref: [ref ?? null, railRef],
    props: {
      ...props,
      type: "button",
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "rail",
      "aria-label": props["aria-label"] ?? "Toggle Sidebar",
      "aria-expanded": open,
      tabIndex: -1,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      },
      title: "Toggle Sidebar",
      className: cn(
        "absolute inset-y-0 z-20 hidden -translate-x-1/2 group-data-[side=left]:-right-4 group-data-[side=right]:left-0 lg:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0",
        className,
      ),
    },
  });
}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return (
    <main
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="inset"
      className={cn("relative flex min-w-0 w-full flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & SidebarKnobStyle }) {
  return (
    <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="header" className={cn("flex flex-col", className)} {...props} />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & SidebarKnobStyle }) {
  return (
    <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="footer" className={cn("flex flex-col", className)} {...props} />
  );
}

export function SidebarContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <ScrollArea
      data-control-ui="sidebar"
      data-slot="content"
      className={cn("min-h-0 flex-1 group-data-[collapsible=icon]:overflow-hidden", className)}
      lockAxis="x"
      {...props}
    >
      <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="content-stack" className="flex flex-col">
        {children}
      </div>
    </ScrollArea>
  );
}
