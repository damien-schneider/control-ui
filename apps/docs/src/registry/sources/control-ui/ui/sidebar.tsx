"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import type { RenderProp, SelectionIndicator } from "@/components/control-ui/contracts";
import { controlSize } from "@/components/control-ui/control-variants";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import { cn } from "@/components/control-ui/lib/cn";
import { useAsChildRender } from "@/components/control-ui/lib/use-as-child-render";
import { SELECTION_INDICATOR_BG_RESET, skinIndicator, skinSidebarLayout, skinSidebarWidth, skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/control-ui/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";

/*
 * Full shadcn Sidebar contract ported onto Control UI; docs shell itself runs on this lib.
 * Provider owns open/collapsed (cookie + Cmd/Ctrl-B); every public part emits scoped anatomy and composes recipe, skin slot, then caller classes.
 * wrapper/gap/container slots + --sidebar-width var kept verbatim from shadcn for docs-sidebar-resize-handle.
 */

// Lazy: highlight needs a JS geometry engine, skip download unless skin/props opt in. Decorative (aria-hidden), null fallback is fine.
const TrackHighlight = lazy(() =>
  import("@/components/control-ui/extensions/track-highlight").then((module) => ({ default: module.TrackHighlight })),
);

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
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

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  // Handlers unmemoized: provider only re-renders on own state, subtree re-renders anyway.
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

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delay={0}>
        <div
          data-control-ui="sidebar"
          data-slot="wrapper"
          style={
            {
              // Width = skin choice (ControlUiSkin.sidebarWidth): caller's --sidebar-width (style spread / resize handle) wins, else skin's request, else shadcn default.
              "--sidebar-width": skinSidebarWidth() ?? SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            skinSlot("sidebar", "wrapper", {}),
            className,
          )}
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
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  // Layout = skin choice (ControlUiSkin.sidebarLayout): variant prop wins, else skin's layout, else docked. Drives native gap/padding/rounding/shadow below — geometry a per-slot class can't express.
  const resolvedVariant = variant ?? skinSidebarLayout() ?? "sidebar";

  if (collapsible === "none") {
    return (
      <div
        data-control-ui="sidebar"
        data-slot="root"
        data-surface="panel"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          skinSlot("sidebar", "root", { dragging: false }) ?? skinSlot("sidebar", "inner", { dragging: false }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-control-ui="sidebar"
          data-slot="root"
          data-surface="panel"
          side={side}
          className={cn(
            "w-(--sidebar-width) gap-0 bg-sidebar p-0 text-sidebar-foreground",
            skinSlot("sidebar", "root", { dragging: false }) ?? skinSlot("sidebar", "inner", { dragging: false }),
          )}
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as CSSProperties}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-control-ui="sidebar"
      data-slot="root"
      data-surface="panel"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={resolvedVariant}
      data-side={side}
    >
      <div
        data-control-ui="sidebar"
        data-slot="gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          resolvedVariant === "floating" || resolvedVariant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-control-ui="sidebar"
        data-slot="container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-[var(--duration-base)] ease-[var(--ease-standard)] md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          resolvedVariant === "floating" || resolvedVariant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-control-ui="sidebar"
          data-slot="inner"
          className={cn(
            "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-[var(--radius-panel)] group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-md",
            skinSlot("sidebar", "inner", { dragging: false }) ?? skinSlot("sidebar", "root", { dragging: false }),
          )}
        >
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
      className={cn(sidebarTriggerWidth[size], "px-0", skinSlot("sidebar", "trigger", {}), className)}
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

export function SidebarRail({ className, ...props }: ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-control-ui="sidebar"
      data-slot="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-[background-color,translate] duration-[var(--duration-base)] ease-[var(--ease-standard)] after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:transition-colors after:duration-[var(--duration-base)] after:ease-[var(--ease-standard)] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        skinSlot("sidebar", "rail", {}),
        className,
      )}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      data-control-ui="sidebar"
      data-slot="inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background transition-[margin,border-radius,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        skinSlot("sidebar", "inset", {}),
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="sidebar"
      data-slot="header"
      className={cn("flex flex-col gap-2 p-2", skinSlot("sidebar", "header", {}), className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="sidebar"
      data-slot="footer"
      className={cn("flex flex-col gap-2 p-2", skinSlot("sidebar", "footer", {}), className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <ScrollArea
      data-control-ui="sidebar"
      data-slot="content"
      className={cn("min-h-0 flex-1 group-data-[collapsible=icon]:overflow-hidden", skinSlot("sidebar", "content", {}), className)}
      lockAxis="x"
      {...props}
    >
      <div className="flex flex-col gap-2">{children}</div>
    </ScrollArea>
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="sidebar"
      data-slot="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", skinSlot("sidebar", "group", {}), className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  asChild = false,
  render,
  children,
  ...props
}: ComponentProps<"div"> & {
  render?: RenderProp<ComponentProps<"div">>;
  /** @deprecated Prefer `render` for typed composition. Kept as a compatibility bridge. */
  asChild?: boolean;
}) {
  return useAsChildRender({
    defaultTagName: "div",
    asChild,
    render,
    children,
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-slot": "group-label",
      className: cn(
        "flex h-[var(--control-h-sm)] shrink-0 items-center gap-2 rounded-md px-2 text-caption font-medium text-sidebar-foreground/70 outline-hidden transition-[margin,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-[var(--control-h-sm)] group-data-[collapsible=icon]:opacity-0",
        skinSlot("sidebar", "group-label", {}),
        className,
      ),
    },
  });
}

export type SidebarSelectionIndicator = SelectionIndicator;

// Menu-scoped: SidebarMenuButton drops per-row bg when moving highlight is on (pill = sole active/hover chrome); defaults "none" outside slide menu.
const SidebarMenuContext = createContext<SidebarSelectionIndicator>("none");

export function SidebarMenu({
  className,
  indicator,
  children,
  ...props
}: ComponentProps<"ul"> & {
  /**
   * `none` = per-row background. `slide` = Vercel-style moving pill to hovered/active item, replacing per-row bg.
   * Motion follows `--duration-*` tokens (snaps under reduced motion).
   * Defaults to skin's request (ControlUiSkin.indicators.sidebar), else `none`.
   */
  indicator?: SidebarSelectionIndicator;
}) {
  // Explicit prop wins (caller-wins, shadcn contract), else the skin's DS-level choice, else off.
  const resolvedIndicator = indicator ?? skinIndicator("sidebar") ?? "none";
  const sliding = resolvedIndicator === "slide";

  const list = (
    <ul
      data-control-ui="sidebar"
      data-slot="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", skinSlot("sidebar", "menu", {}), sliding ? undefined : className)}
      {...props}
    >
      <SidebarMenuContext.Provider value={resolvedIndicator}>{children}</SidebarMenuContext.Provider>
    </ul>
  );

  if (!sliding) return list;

  // Wrap (never inject into <ul>): pill = sibling of menu items on positioned/isolated track, parked behind label via -z.
  // Default paint routes through --track-highlight-* knobs (theme.css @layer components) so a skin re-values vars instead of fighting utilities.
  return (
    <div data-control-ui="sidebar" data-slot="menu-track" className={cn("relative isolate", className)}>
      <Suspense fallback={null}>
        <TrackHighlight
          itemSelector='[data-control-ui="sidebar"][data-slot="menu-button"]'
          activeSelector='[data-control-ui="sidebar"][data-slot="menu-button"][data-active="true"]'
        />
      </Suspense>
      {list}
    </div>
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-control-ui="sidebar"
      data-slot="menu-item"
      className={cn("group/menu-item relative", skinSlot("sidebar", "menu-item", {}), className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center overflow-hidden rounded-[var(--radius-popup-item)] text-left outline-hidden transition-[width,height,padding] duration-[var(--duration-base)] ease-[var(--ease-standard)] group-data-[collapsible=icon]:px-0! hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 active:bg-foreground/8 active:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-foreground/8 data-[active=true]:font-medium data-[active=true]:text-foreground data-[state=open]:hover:bg-foreground/8 data-[state=open]:hover:text-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-foreground/6 hover:text-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-foreground/6 hover:text-foreground hover:shadow-[0_0_0_1px_oklch(from_var(--foreground)_l_c_h_/_0.08)]",
      },
      size: {
        default: `${controlSize({ size: "md" })} group-data-[collapsible=icon]:size-[var(--control-h-md)]!`,
        sm: `${controlSize({ size: "sm" })} group-data-[collapsible=icon]:size-[var(--control-h-sm)]!`,
        lg: `${controlSize({ size: "lg" })} group-data-[collapsible=icon]:size-[var(--control-h-lg)]!`,
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function SidebarMenuButton({
  asChild = false,
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  render?: RenderProp<ComponentProps<"button">>;
  /** @deprecated Prefer `render` for typed composition. Kept as a compatibility bridge. */
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: ReactNode;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar();
  const indicator = useContext(SidebarMenuContext);

  const button = useAsChildRender({
    defaultTagName: "button",
    asChild,
    render,
    children,
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-slot": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        sidebarMenuButtonVariants({ variant, size }),
        skinSlot("sidebar", "menu-button", { active: isActive, indicator }),
        // Moving highlight: pill = sole active/hover chrome, cancel recipe/skinSlot backgrounds — AFTER skinSlot so mode wins.
        // Text emphasis stays; caller className keeps last word.
        indicator === "slide" ? SELECTION_INDICATOR_BG_RESET : undefined,
        className,
      ),
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
