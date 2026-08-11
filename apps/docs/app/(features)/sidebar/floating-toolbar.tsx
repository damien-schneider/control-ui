"use client";

import { useEffect, useId, useRef } from "react";
import type { ActivePageId, DocsSkill, SearchItem } from "@/app/(features)/model/types";
import { MorphingPanel, MorphingPanelContent } from "@/components/control-ui/ui/morphing-panel";
import { SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { ThemeDrawerTrigger, ThemeEditorContent } from "@/components/theme-drawer/theme-drawer";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import { SidebarModeSelector } from "./mode-selector";
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
  const { mode, modeHrefs, closeMobile, onNavigate, onModeNavigate } = useSidebarNavigation({
    active,
    searchItems,
    skills,
    lastSectionMode,
    onLastSectionModeChange,
  });
  const { open: themeEditorOpen, setOpen: setThemeEditorOpen } = useThemeDrawer();
  const themeEditorTitleId = useId();
  const themeEditorDescriptionId = useId();
  const themeEditorRef = useRef<HTMLDivElement>(null);
  const themeDrawerTriggerRef = useRef<HTMLButtonElement>(null);
  const themeEditorWasOpen = useRef(false);

  // editor replaces toolbar — no native focus return
  useEffect(() => {
    if (themeEditorOpen) {
      themeEditorWasOpen.current = true;
      themeEditorRef.current?.focus();
      return;
    }
    if (!themeEditorWasOpen.current) return;
    themeEditorWasOpen.current = false;
    themeDrawerTriggerRef.current?.focus();
  }, [themeEditorOpen]);

  useEffect(() => {
    if (!themeEditorOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setThemeEditorOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [themeEditorOpen, setThemeEditorOpen]);

  return (
    <MorphingPanel
      open={themeEditorOpen}
      onOpenChange={(nextOpen) => setThemeEditorOpen(nextOpen)}
      collapsedSize={{ width: "var(--floating-toolbar-width)", height: "var(--floating-toolbar-height)" }}
      expandedSize={{
        width: "calc(100% - 1rem)",
        height: "calc(100% - var(--floating-toolbar-top) - var(--floating-toolbar-bottom))",
      }}
      data-docs-floating-panel=""
      className="group/floating-panel absolute bottom-(--floating-toolbar-bottom) left-1/2 z-40 max-w-[calc(100%-1rem)] -translate-x-1/2 overflow-visible data-[state=open]:z-50 [--floating-toolbar-bottom:max(0.75rem,env(safe-area-inset-bottom))] [--floating-toolbar-height:calc(var(--control-h-sm)_+_2_*_var(--toolbar-padding,0.25rem)_+_2px)] [--floating-toolbar-rest-width:19rem] [--floating-toolbar-search-width:21rem] [--floating-toolbar-top:max(0.5rem,env(safe-area-inset-top))] [--floating-toolbar-width:var(--floating-toolbar-rest-width)] has-[input:focus]:[--floating-toolbar-width:var(--floating-toolbar-search-width)] data-[state=closed]:bg-transparent data-[state=closed]:shadow-none data-[state=closed]:ring-0 sm:[--floating-toolbar-rest-width:24rem] sm:[--floating-toolbar-search-width:26rem] sm:[--toolbar-padding:0.375rem] lg:top-(--floating-toolbar-top) lg:bottom-auto"
    >
      <Toolbar
        aria-label="Documentation controls"
        data-docs-floating-toolbar=""
        variant="inverse"
        inert={themeEditorOpen || undefined}
        className="absolute inset-0 size-full transition-[opacity,filter,gap] duration-[var(--duration-base)] ease-[var(--ease-standard)] has-[input:focus]:gap-0 group-data-[state=open]/floating-panel:pointer-events-none group-data-[state=open]/floating-panel:opacity-0 group-data-[state=open]/floating-panel:blur-sm"
      >
        <SidebarSearch items={searchItems} onNavigate={onNavigate} />
        <ToolbarGroup className="min-w-0 flex-[1_1_100%] justify-center overflow-hidden opacity-100 transition-[flex-basis,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] peer-focus-within:pointer-events-none peer-focus-within:flex-[0_1_0%] peer-focus-within:opacity-0">
          <SidebarTrigger render={<ToolbarButton iconOnly />} className="lg:hidden" />
          <ToolbarSeparator className="h-5 self-auto" />
          <SidebarModeSelector mode={mode} hrefs={modeHrefs} onNavigate={onModeNavigate} />
          <ToolbarSeparator className="h-5 self-auto" />
          <ThemeDrawerTrigger render={<ToolbarButton ref={themeDrawerTriggerRef} iconOnly />} iconOnly onToggle={closeMobile} />
        </ToolbarGroup>
      </Toolbar>

      <MorphingPanelContent
        ref={themeEditorRef}
        tabIndex={-1}
        role="region"
        aria-labelledby={themeEditorTitleId}
        aria-describedby={themeEditorDescriptionId}
      >
        <ThemeEditorContent labelledById={themeEditorTitleId} describedById={themeEditorDescriptionId} />
      </MorphingPanelContent>
    </MorphingPanel>
  );
}
