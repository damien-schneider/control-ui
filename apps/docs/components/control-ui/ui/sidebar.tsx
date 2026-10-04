"use client";

import { useRender } from "@base-ui/react/use-render";
import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, MouseEvent, Ref } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { RenderProp } from "@/components/control-ui/control-props";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { SidebarLayout } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/control-ui/ui/sheet";
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
  SidebarMenuBadge,
  type SidebarMenuBadgeProps,
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
export {
  type SidebarLayoutMode,
  SidebarProvider,
  type SidebarProviderProps,
  type SidebarStyle,
  useSidebar,
} from "@/components/control-ui/ui/sidebar-provider";

export type SidebarRailProps =
  | (Omit<ComponentProps<"button">, "style"> & { resizable?: false; style?: CSSProperties & SidebarKnobStyle })
  | (SidebarResizeRailProps & { resizable: true });

export type SidebarInsetProps = Omit<ComponentProps<"main">, "style" | "id"> & {
  render?: RenderProp<ComponentProps<"main">>;
  style?: CSSProperties & SidebarKnobStyle;
};

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
  label?: string;
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
  label = "Navigation",
  ref,
  className,
  children,
  style,
  railContainerRef,
  ...props
}: SidebarProps & { railContainerRef: Ref<HTMLDivElement> }) {
  const { side, collapsible } = useSidebarSurface();
  const { offcanvasRef, triggerRef } = useSidebarElements();
  const skin = useSkin();
  const { isMobile, state, openMobile, setOpenMobile, layout, sidebarId } = useSidebar();
  const resolvedVariant = variant ?? skin.sidebarLayout ?? "sidebar";

  const container = useRender({
    defaultTagName: "div",
    ref: collapsible === "offcanvas" ? [ref ?? null, offcanvasRef] : ref,
    props: {
      id: sidebarId,
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "container",
      tabIndex: -1,
      className: cn(
        layout === "contained" ? "absolute h-full" : "fixed h-svh",
        "inset-y-0 z-10 hidden w-(--sidebar-width) lg:flex",
        side === "left" ? "start-0" : "end-0",
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
        <SheetContent side={side} finalFocus={triggerRef} className="w-(--sidebar-width) gap-0 p-0" style={mobileSheetStyle}>
          <SheetHeader className="sr-only">
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div
            ref={ref}
            id={sidebarId}
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

export function SidebarTrigger({
  className,
  onClick,
  size = "sm",
  label = "Toggle sidebar",
  ref,
  ...props
}: ComponentProps<typeof Button> & { label?: string }) {
  const { toggleSidebar, isMobile, openMobile, open, keyboardShortcut, sidebarId } = useSidebar();
  const { triggerRef, railRef } = useSidebarElements();
  const shortcutKey = keyboardShortcut?.toUpperCase();

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
      "aria-controls": isMobile && !openMobile ? undefined : sidebarId,
      "aria-keyshortcuts": shortcutKey ? `Meta+${shortcutKey} Control+${shortcutKey}` : undefined,
      className: cn(sidebarTriggerWidth[size], "px-0", className),
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggleSidebar();
        if (isMobile || open) return;
        const trigger = event.currentTarget;
        requestAnimationFrame(() => {
          if (!trigger.checkVisibility()) railRef.current?.focus({ preventScroll: true });
        });
      },
      children: (
        <>
          <PanelLeftIcon className="size-4" data-icon-dir="inline" aria-hidden="true" />
          <span className="sr-only">{label}</span>
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
      "aria-label": props["aria-label"] ?? "Toggle sidebar",
      "aria-expanded": open,
      tabIndex: -1,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      },
      title: props.title ?? "Toggle sidebar",
      className: cn(
        "absolute inset-y-0 z-20 hidden -translate-x-1/2 rtl:translate-x-1/2 group-data-[side=left]:-end-4 group-data-[side=right]:start-0 lg:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0",
        className,
      ),
    },
  });
}

export function SidebarInset({ className, render, ref, ...props }: SidebarInsetProps) {
  const { layout, contentId } = useSidebar();
  const { insetRef } = useSidebarElements();
  return useRender({
    defaultTagName: layout === "contained" ? "div" : "main",
    render,
    ref: [ref ?? null, insetRef],
    props: {
      tabIndex: -1,
      ...props,
      id: contentId,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "inset",
      className: cn("relative flex min-w-0 w-full flex-1 flex-col", className),
    },
  });
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
      viewportClassName="overscroll-y-contain"
      {...props}
    >
      <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="content-stack" className="flex flex-col">
        {children}
      </div>
    </ScrollArea>
  );
}
