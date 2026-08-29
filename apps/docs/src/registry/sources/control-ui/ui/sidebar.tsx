"use client";

import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { type RenderProp, type SelectionIndicator, SIDEBAR_COOKIE_NAME } from "@/components/control-ui/control-props";
import { controlSize } from "@/components/control-ui/control-variants";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinIndicator, skinSidebarLayout, skinSidebarWidth } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/control-ui/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

export const sidebarMenuButtonVariants = ["default", "outline"] as const;

export type SidebarMenuButtonVariant = (typeof sidebarMenuButtonVariants)[number];

export const sidebarMenuButtonSizes = ["default", "sm", "lg"] as const;

export type SidebarMenuButtonSize = (typeof sidebarMenuButtonSizes)[number];

export type SidebarRailProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

export type SidebarInsetProps = Omit<ComponentProps<"main">, "style"> & { style?: CSSProperties & SidebarKnobStyle };

export type SidebarGroupLabelProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & SidebarKnobStyle } & {
  render?: RenderProp<ComponentProps<"div">>;
};

export type SidebarMenuButtonProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & SidebarKnobStyle } & {
  render?: RenderProp<ComponentProps<"button">>;
  isActive?: boolean;
  tooltip?: ReactNode;
  variant?: SidebarMenuButtonVariant;
  size?: SidebarMenuButtonSize;
};

/*
 * shadcn's Sidebar contract ported onto Control UI: provider owns open/collapsed state behind cookie and Cmd/Ctrl-B.
 * wrapper/gap/container slots and the --sidebar-width var are kept verbatim from shadcn so external resize handles keep working.
 */

// lazy because highlight drags in JS geometry engine; it is decorative, so null fallback is fine
const TrackHighlight = lazy(() =>
  import("@/components/control-ui/extensions/track-highlight").then((module) => ({ default: module.TrackHighlight })),
);

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
/** Exported so blocks can set width through `style` and stay type-checked. */
export type SidebarStyle = CSSProperties &
  SidebarKnobStyle & {
    "--sidebar-width"?: string;
    "--sidebar-width-icon"?: string;
  };

type SidebarSurfaceStyle = CSSProperties & SidebarKnobStyle;

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
// this breakpoint and every `lg:` in file must name same width, or viewport lands between them with neither sheet nor docked rail rendered
const SIDEBAR_MOBILE_BREAKPOINT = 1024;
const sidebarTriggerWidth = {
  xs: "w-[var(--control-h-xs)]",
  sm: "w-[var(--control-h-sm)]",
  md: "w-[var(--control-h-md)]",
  lg: "w-[var(--control-h-lg)]",
} satisfies Record<NonNullable<ComponentProps<typeof Button>["size"]>, string>;

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

export type SidebarProviderProps = Omit<ComponentProps<"div">, "style"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: SidebarStyle;
};

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  ref,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile(SIDEBAR_MOBILE_BREAKPOINT);
  const [openMobile, setOpenMobile] = useState(false);

  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't cross-browser yet.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  const toggleSidebar = () => (isMobile ? setOpenMobile((prev) => !prev) : setOpen(!open));

  const toggleRef = useRef(toggleSidebar);
  useEffect(() => {
    toggleRef.current = toggleSidebar;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const state = open ? "expanded" : "collapsed";

  const contextValue: SidebarContextProps = { state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar };

  // caller's --sidebar-width → skin → shadcn default
  const wrapperStyle: SidebarStyle = {
    "--sidebar-width": skinSidebarWidth() ?? SIDEBAR_WIDTH,
    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    ...style,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delay={0}>
        <div
          ref={ref}
          data-control-ui="sidebar"
          data-control-family="sidebar"
          data-slot="wrapper"
          style={wrapperStyle}
          className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

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
  // variant prop → skin → docked; drives gap, padding, rounding, and shadow geometry no per-slot class can express
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
        <SheetContent
          ref={ref}
          data-control-ui="sidebar"
          data-control-family="sidebar"
          data-slot="root"
          data-surface="panel"
          side={side}
          className="w-(--sidebar-width) gap-0 p-0"
          style={mobileSheetStyle}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div data-control-ui="sidebar" data-control-family="sidebar" data-slot="inner" className="flex h-full w-full flex-col">
            {children}
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
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-control-ui="sidebar"
      data-slot="trigger"
      variant="ghost"
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
      className={cn("relative flex w-full flex-1 flex-col", className)}
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
        "group-data-[collapsible=icon]:-mt-[var(--control-h-sm)] group-data-[collapsible=icon]:opacity-0",
        className,
      ),
      children,
    },
  });
}

export type SidebarSelectionIndicator = SelectionIndicator;

// SidebarMenuButton drops its per-row background while pill is on; outside slide menu it defaults to "none".
const SidebarMenuContext = createContext<SidebarSelectionIndicator>("none");

export function SidebarMenu({
  className,
  indicator,
  children,
  ...props
}: ComponentProps<"ul"> & {
  /**
   * `slide` replaces per-row backgrounds with one pill that glides to hovered or active item.
   * Defaults to ControlUiSkin.indicators.sidebar, else `none`.
   */
  indicator?: SidebarSelectionIndicator;
} & { style?: CSSProperties & SidebarKnobStyle }) {
  // prop → skin → off
  const resolvedIndicator = indicator ?? skinIndicator("sidebar") ?? "none";
  const sliding = resolvedIndicator === "slide";

  const list = (
    <ul
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu"
      data-indicator={resolvedIndicator}
      className={cn("flex w-full min-w-0 flex-col", sliding ? undefined : className)}
      {...props}
    >
      <SidebarMenuContext.Provider value={resolvedIndicator}>{children}</SidebarMenuContext.Provider>
    </ul>
  );

  if (!sliding) return list;

  // wrapped, never injected into the <ul>: pill must stay sibling of menu items
  // paint routes through the --track-highlight-* knobs so skin re-values vars instead of fighting utilities
  return (
    <div
      data-control-ui="sidebar"
      data-control-family="sidebar"
      data-slot="menu-track"
      data-indicator={resolvedIndicator}
      className={cn("relative isolate", className)}
    >
      <Suspense fallback={null}>
        <TrackHighlight
          itemSelector='[data-control-ui="sidebar"][data-slot="menu-button"]'
          activeSelector='[data-control-ui="sidebar"][data-slot="menu-button"][data-active]'
        />
      </Suspense>
      {list}
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
  default: `${controlSize({ size: "md" })} group-data-[collapsible=icon]:size-[var(--control-h-md)]!`,
  sm: `${controlSize({ size: "sm" })} group-data-[collapsible=icon]:size-[var(--control-h-sm)]!`,
  lg: `${controlSize({ size: "lg" })} group-data-[collapsible=icon]:size-[var(--control-h-lg)]!`,
} satisfies Record<SidebarMenuButtonSize, string>;

const sidebarMenuButtonClasses = cva(
  "peer/menu-button flex w-full items-center overflow-hidden group-data-[collapsible=icon]:px-0! disabled:pointer-events-none aria-disabled:pointer-events-none [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
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

  const button = useRender({
    defaultTagName: "button",
    render,
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "menu-button",
      "data-size": size,
      "data-variant": variant,
      "data-active": isActive || undefined,
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
