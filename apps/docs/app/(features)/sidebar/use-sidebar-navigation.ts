"use client";

import type { ActivePageId, DocsSkill, SearchItem } from "@/app/(features)/model/types";
import { useSidebar } from "@/components/control-ui/ui/sidebar";
import { sidebarModeForActivePage } from "./nav-items";
import type { SidebarMode } from "./types";

type SidebarNavigationOptions = {
  active: ActivePageId;
  searchItems: SearchItem[];
  skills: readonly DocsSkill[];
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
};

export function useSidebarNavigation({ active, searchItems, skills, lastSectionMode, onLastSectionModeChange }: SidebarNavigationOptions) {
  const { isMobile, setOpenMobile } = useSidebar();
  const activeItem = searchItems.find((item) => item.id === active);
  const onSectionPage = activeItem != null && activeItem.kind !== "Guide" && activeItem.kind !== "Skin";
  const routeMode = sidebarModeForActivePage(active, searchItems);
  const modeHrefs: Record<SidebarMode, string> = {
    agents: "/ai",
    primitives: "/primitives",
    "use-cases": "/use-cases",
    skills: skills[0] ? `/skills/${skills[0].id}` : "/skills",
  };

  function closeMobile() {
    if (isMobile) setOpenMobile(false);
  }

  return {
    activeItem,
    mode: onSectionPage ? routeMode : (lastSectionMode ?? routeMode),
    modeHrefs,
    closeMobile,
    onNavigate() {
      if (onSectionPage) onLastSectionModeChange(routeMode);
      closeMobile();
    },
    onModeNavigate(nextMode: SidebarMode) {
      onLastSectionModeChange(nextMode);
      closeMobile();
    },
  };
}
