"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, Fragment, use, useState } from "react";
import type { DockablePanelPlacement } from "./control-ui/contracts";
import type { SkinId } from "./theme-drawer/types";

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
  // The editor now morphs out of the floating toolbar over the whole viewport, so it stays closed until asked for — no desktop auto-open.
  const [openRequested, setOpenRequested] = useState(false);
  const [skinEpoch, setSkinEpoch] = useState(0);
  const [skinSource, setSkinSource] = useState<SkinId | null>(null);
  const [skinSourcePlacement, setSkinSourcePlacement] = useState<DockablePanelPlacement>("right");

  const hasThemeDrawer = pathname !== "/create";
  const open = hasThemeDrawer && openRequested;

  function setOpen(nextOpen: boolean) {
    setOpenRequested(nextOpen);
  }

  function toggleOpen() {
    setOpenRequested(!open);
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
