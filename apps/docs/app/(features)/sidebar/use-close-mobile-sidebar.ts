"use client";

import { useSidebar } from "@/components/control-ui/ui/sidebar";

export function useCloseMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  return function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false);
  };
}
