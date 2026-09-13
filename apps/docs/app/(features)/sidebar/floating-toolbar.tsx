"use client";

import { CustomizeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ActivePageId, DocsSkill, SearchItem } from "@/app/(features)/model/types";
import { Toolbar, ToolbarGroup, ToolbarLink } from "@/components/control-ui/ui/toolbar";
import { SkinPresetControls } from "@/components/theme-drawer/skin-preset-controls";
import { SidebarSearch } from "./search";
import type { SidebarMode } from "./types";
import { useSidebarNavigation } from "./use-sidebar-navigation";

type DocsFloatingToolbarProps = {
  active: ActivePageId;
  searchItems: SearchItem[];
  skills: readonly DocsSkill[];
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
};

export function DocsFloatingToolbar({ active, searchItems, skills, lastSectionMode, onLastSectionModeChange }: DocsFloatingToolbarProps) {
  const { onNavigate } = useSidebarNavigation({
    active,
    searchItems,
    skills,
    lastSectionMode,
    onLastSectionModeChange,
  });

  return (
    <div
      data-docs-floating-panel=""
      className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-fit max-w-[calc(100%-1rem)] -translate-x-1/2 [--floating-toolbar-padding:0.25rem] sm:[--floating-toolbar-padding:0.375rem] lg:top-[max(1rem,env(safe-area-inset-top))] lg:bottom-auto"
    >
      <Toolbar
        aria-label="Documentation controls"
        data-docs-floating-toolbar=""
        variant="inverse"
        className="relative w-max max-w-[calc(100vw-1rem)] [--cui-toolbar-padding:var(--floating-toolbar-padding)] transition-[gap] duration-[var(--duration-base)] ease-[var(--ease-standard)] has-[input:focus]:gap-0"
      >
        <SidebarSearch items={searchItems} onNavigate={onNavigate} />
        <ToolbarGroup
          data-skin-controls=""
          className="w-max shrink-0 justify-start gap-0 overflow-x-hidden opacity-100 transition-[width,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] peer-focus-within:pointer-events-none peer-focus-within:w-0 peer-focus-within:opacity-0 sm:gap-0.5"
        >
          <SkinPresetControls />
          <ToolbarLink
            render={<Link href="/theme-editor" onNavigate={onNavigate} />}
            aria-label="Edit theme"
            title="Edit theme"
            aria-current={active === "theme-editor" ? "page" : undefined}
          >
            <HugeiconsIcon aria-hidden icon={CustomizeIcon} size={16} strokeWidth={1.7} />
          </ToolbarLink>
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}
