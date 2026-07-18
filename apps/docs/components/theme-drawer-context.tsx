"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, Fragment, use, useEffect, useState, useSyncExternalStore } from "react";
import type { DockablePanelPlacement } from "./control-ui/contracts";
import type { SkinId } from "./theme-drawer/types";

const THEME_DRAWER_WIDTH = "360px";
const DESKTOP_THEME_DRAWER_QUERY = "(min-width: 768px)";

function subscribeToDesktopThemeDrawer(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(DESKTOP_THEME_DRAWER_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getDesktopThemeDrawerSnapshot() {
  if (typeof window === "undefined") return null;
  return window.matchMedia(DESKTOP_THEME_DRAWER_QUERY).matches;
}

function getDesktopThemeDrawerServerSnapshot() {
  return null;
}

export function useDesktopThemeDrawer() {
  return useSyncExternalStore(subscribeToDesktopThemeDrawer, getDesktopThemeDrawerSnapshot, getDesktopThemeDrawerServerSnapshot);
}

type ThemeDrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  skinEpoch: number;
  bumpSkinEpoch: () => void;
  skinSource: SkinId | null;
  openSkinSource: (skin: SkinId) => void;
  closeSkinSource: () => void;
  skinSourcePlacement: DockablePanelPlacement;
  setSkinSourcePlacement: (placement: DockablePanelPlacement) => void;
};

const ThemeDrawerContext = createContext<ThemeDrawerContextValue | null>(null);

export function ThemeDrawerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDesktop = useDesktopThemeDrawer();
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const [skinEpoch, setSkinEpoch] = useState(0);
  const [skinSource, setSkinSource] = useState<SkinId | null>(null);
  const [skinSourcePlacement, setSkinSourcePlacement] = useState<DockablePanelPlacement>("right");

  const hasThemeDrawer = pathname !== "/create";
  const open = hasThemeDrawer && (openOverride ?? isDesktop === true);

  function setOpen(nextOpen: boolean) {
    setOpenOverride(nextOpen);
  }

  function toggleOpen() {
    setOpenOverride(!open);
  }

  function bumpSkinEpoch() {
    setSkinEpoch((prev) => prev + 1);
  }

  function openSkinSource(skin: SkinId) {
    setSkinSource(skin);
  }

  function closeSkinSource() {
    setSkinSource(null);
  }

  useEffect(() => {
    const root = document.documentElement;
    if (open) root.style.setProperty("--theme-drawer-width", THEME_DRAWER_WIDTH);
    else root.style.removeProperty("--theme-drawer-width");
  }, [open]);

  const value: ThemeDrawerContextValue = {
    open,
    setOpen,
    toggleOpen,
    skinEpoch,
    bumpSkinEpoch,
    skinSource,
    openSkinSource,
    closeSkinSource,
    skinSourcePlacement,
    setSkinSourcePlacement,
  };

  return <ThemeDrawerContext.Provider value={value}>{children}</ThemeDrawerContext.Provider>;
}

export function useThemeDrawer(): ThemeDrawerContextValue {
  const ctx = use(ThemeDrawerContext);
  if (!ctx) throw new Error("useThemeDrawer must be used within a ThemeDrawerProvider");
  return ctx;
}

export function SkinEpochBoundary({ children }: { children: ReactNode }) {
  const { skinEpoch } = useThemeDrawer();
  return <Fragment key={skinEpoch}>{children}</Fragment>;
}
