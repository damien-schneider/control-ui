"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, RefObject } from "react";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SIDEBAR_COOKIE_NAME } from "@/components/control-ui/control-props";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";

import { TooltipProvider } from "@/components/control-ui/ui/tooltip";

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type SidebarStyle = CSSProperties &
  SidebarKnobStyle & {
    "--sidebar-width"?: string;
    "--sidebar-width-icon"?: string;
  };

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SIDEBAR_MOBILE_BREAKPOINT = 1024;
type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  width: number | undefined;
  minWidth: number;
  maxWidth: number;
  setWidth: (width: number) => void;
};

type SidebarElements = {
  wrapperRef: RefObject<HTMLDivElement | null>;
  offcanvasRef: RefObject<HTMLDivElement | null>;
  railRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const SidebarElementsContext = createContext<SidebarElements | null>(null);
export const SidebarSurfaceContext = createContext<{
  side: "left" | "right";
  collapsible: "offcanvas" | "icon" | "none";
  railContainer: HTMLDivElement | null;
} | null>(null);

export function useSidebarElements() {
  const elements = useContext(SidebarElementsContext);
  if (!elements) throw new Error("Sidebar parts must be used within a SidebarProvider.");
  return elements;
}

export function useSidebarSurface() {
  const surface = useContext(SidebarSurfaceContext);
  if (!surface) throw new Error("SidebarRail must be used within a Sidebar.");
  return surface;
}

function focusOutsideCollapsedContent({ offcanvasRef, railRef, triggerRef }: SidebarElements) {
  const container = offcanvasRef.current;
  if (!container?.contains(document.activeElement)) return;
  const target = railRef.current ?? triggerRef.current;
  if (target) target.focus({ preventScroll: true });
  else container.focus({ preventScroll: true });
}

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
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  onWidthChange?: (width: number) => void;
  persistOpen?: boolean;
  keyboardShortcut?: string | null;
  style?: SidebarStyle;
};

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  defaultWidth,
  minWidth = 224,
  maxWidth = 420,
  width: widthProp,
  onWidthChange,
  persistOpen = true,
  keyboardShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
  ref,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const skin = useSkin();
  const isMobile = useIsMobile(SIDEBAR_MOBILE_BREAKPOINT);
  const [openMobile, setOpenMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const offcanvasRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const elements = { wrapperRef, offcanvasRef, railRef, triggerRef };
  const [internalWidth, setInternalWidth] = useState(defaultWidth);
  function clampWidth(nextWidth: number) {
    return Math.min(maxWidth, Math.max(minWidth, nextWidth));
  }
  const requestedWidth = widthProp ?? internalWidth;
  const width = requestedWidth === undefined ? undefined : clampWidth(requestedWidth);
  function setWidth(nextWidth: number) {
    const clampedWidth = clampWidth(nextWidth);
    if (widthProp === undefined) setInternalWidth(clampedWidth);
    onWidthChange?.(clampedWidth);
  }

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  useLayoutEffect(() => {
    if (!open && !isMobile) focusOutsideCollapsedContent({ wrapperRef, offcanvasRef, railRef, triggerRef });
  }, [open, isMobile]);

  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (!openState && !isMobile) focusOutsideCollapsedContent(elements);
    if (openProp === undefined) setInternalOpen(openState);
    onOpenChange?.(openState);
    if (persistOpen) {
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't cross-browser yet.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
  };

  const toggleSidebar = () => (isMobile ? setOpenMobile((prev) => !prev) : setOpen(!open));

  const toggleRef = useRef(toggleSidebar);
  useEffect(() => {
    toggleRef.current = toggleSidebar;
  });

  useEffect(() => {
    if (keyboardShortcut === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === keyboardShortcut && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyboardShortcut]);

  const state = open ? "expanded" : "collapsed";

  const contextValue: SidebarContextProps = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
    width,
    setWidth,
    minWidth,
    maxWidth,
  };

  const wrapperStyle: SidebarStyle = {
    "--sidebar-width": skin.sidebarWidth ?? SIDEBAR_WIDTH,
    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    ...style,
    ...(width === undefined ? {} : { "--sidebar-width": `${width}px` }),
  };

  const wrapper = useRender({
    defaultTagName: "div",
    ref: [ref ?? null, wrapperRef],
    props: {
      ...props,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "wrapper",
      style: wrapperStyle,
      className: cn("group/sidebar-wrapper flex min-h-svh w-full", className),
      children,
    },
  });

  return (
    <SidebarContext.Provider value={contextValue}>
      <SidebarElementsContext.Provider value={elements}>
        <TooltipProvider delay={0}>{wrapper}</TooltipProvider>
      </SidebarElementsContext.Provider>
    </SidebarContext.Provider>
  );
}
