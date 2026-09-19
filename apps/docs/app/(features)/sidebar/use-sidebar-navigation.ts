"use client";

import type { ActivePageId, SearchItem } from "@/app/(features)/model/types";
import { useSidebar } from "@/components/control-ui/ui/sidebar";
import { defaultSidebarMode, sidebarModeForActivePage } from "./nav-items";
import type { SidebarMode } from "./types";

type SidebarNavigationOptions = {
  active: ActivePageId;
  searchItems: SearchItem[];
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
};

const modeHrefs: Record<SidebarMode, string> = {
  agents: "/ai",
  primitives: "/primitives",
};

export function useSidebarNavigation({ active, searchItems, lastSectionMode, onLastSectionModeChange }: SidebarNavigationOptions) {
  const { isMobile, setOpenMobile } = useSidebar();
  const activeItem = searchItems.find((item) => item.id === active);
  const routeMode = sidebarModeForActivePage(active, searchItems);

  function closeMobile() {
    if (isMobile) setOpenMobile(false);
  }

  return {
    activeItem,
    mode: routeMode ?? lastSectionMode ?? defaultSidebarMode,
    modeHrefs,
    closeMobile,
    onNavigate() {
      if (routeMode) onLastSectionModeChange(routeMode);
      closeMobile();
    },
    onModeNavigate(nextMode: SidebarMode) {
      onLastSectionModeChange(nextMode);
      closeMobile();
    },
  };
}
