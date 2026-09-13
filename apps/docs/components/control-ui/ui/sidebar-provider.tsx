"use client";

import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  persistOpen?: boolean;
  keyboardShortcut?: string | null;
  style?: SidebarStyle;
};

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
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

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (onOpenChange) {
      onOpenChange(openState);
    } else {
      setInternalOpen(openState);
    }
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

  const contextValue: SidebarContextProps = { state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar };

  const wrapperStyle: SidebarStyle = {
    "--sidebar-width": skin.sidebarWidth ?? SIDEBAR_WIDTH,
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
