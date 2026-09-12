"use client";

import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSidebarLayout } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/control-ui/ui/sheet";
import { type SidebarStyle, useSidebar } from "@/components/control-ui/ui/sidebar-provider";

// biome-ignore lint/performance/noBarrelFile: Preserve the sidebar install-facing API.
export {
  SidebarGroup,
  SidebarGroupLabel,
  type SidebarGroupLabelProps,
  SidebarMenu,
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

export type SidebarRailProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

export type SidebarInsetProps = Omit<ComponentProps<"main">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

type SidebarSurfaceStyle = CSSProperties & SidebarKnobStyle;

const SIDEBAR_WIDTH_MOBILE = "18rem";
const sidebarTriggerWidth = {
  xs: "w-[var(--control-h-xs)]",
  sm: "w-[var(--control-h-sm)]",
  md: "w-[var(--control-h-md)]",
  lg: "w-[var(--control-h-lg)]",
} satisfies Record<NonNullable<ComponentProps<typeof Button>["size"]>, string>;

export function Sidebar({
  side = "left",
  variant,
  collapsible = "offcanvas",
  ref,
  className,
  children,
  style,
  ...props
}: Omit<ComponentProps<"div">, "style"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  style?: SidebarSurfaceStyle;
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const resolvedVariant = variant ?? skinSidebarLayout() ?? "sidebar";

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="root"
        data-surface="panel"
        className={cn("flex h-full w-(--sidebar-width) flex-col", className)}
        style={style}
        {...props}
      >
        {children}
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
      className="group peer hidden lg:block"
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
      <div
        ref={ref}
        data-control-ui="sidebar"
        data-control-family="sidebar"
        data-slot="container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) lg:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          resolvedVariant === "floating" || resolvedVariant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          className,
        )}
        {...props}
      >
        <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="inner" className="flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SidebarTrigger({ className, onClick, size = "sm", ...props }: ComponentProps<typeof Button>) {
  const { toggleSidebar, isMobile, openMobile, open } = useSidebar();

  return (
    <Button
      data-control-ui="sidebar"
      data-slot="trigger"
      data-sidebar-trigger=""
      variant="ghost"
      aria-expanded={isMobile ? openMobile : open}
      size={size}
      className={cn(sidebarTriggerWidth[size], "px-0", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function SidebarRail({ className, ...props }: SidebarRailProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden -translate-x-1/2 group-data-[side=left]:-right-4 group-data-[side=right]:left-0 lg:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0",
        className,
      )}
      {...props}
    />
  );
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
