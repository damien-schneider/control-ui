"use client";

import { useEffect, useId, useRef } from "react";
import type { ActivePageId, DocsSkill, SearchItem } from "@/app/(features)/model/types";
import { MorphingPanel, MorphingPanelContent } from "@/components/control-ui/ui/morphing-panel";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/control-ui/ui/toolbar";
import { SkinPresetControls } from "@/components/theme-drawer/skin-preset-controls";
import { ThemeDrawerTrigger, ThemeEditorContent } from "@/components/theme-drawer/theme-drawer";
import { useThemeDrawer } from "@/components/theme-drawer-context";
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
  const { closeMobile, onNavigate } = useSidebarNavigation({
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
      collapsedSize={{ width: "auto", height: "var(--floating-toolbar-height)" }}
      expandedSize={{
        width: "calc(100% - 1rem)",
        height: "calc(100% - var(--floating-toolbar-top) - var(--floating-toolbar-bottom))",
      }}
      data-docs-floating-panel=""
      className="group/floating-panel absolute bottom-(--floating-toolbar-bottom) left-1/2 z-40 max-w-[calc(100%-1rem)] -translate-x-1/2 overflow-visible data-[state=closed]:w-fit data-[state=open]:z-50 [--floating-toolbar-bottom:max(0.75rem,env(safe-area-inset-bottom))] [--floating-toolbar-height:calc(var(--control-h-sm)_+_2_*_var(--floating-toolbar-padding)_+_2px)] [--floating-toolbar-padding:0.25rem] [--floating-toolbar-top:max(0.5rem,env(safe-area-inset-top))] data-[state=closed]:bg-transparent data-[state=closed]:shadow-none data-[state=closed]:ring-0 sm:[--floating-toolbar-padding:0.375rem] lg:top-(--floating-toolbar-top) lg:bottom-auto"
    >
      <Toolbar
        aria-label="Documentation controls"
        data-docs-floating-toolbar=""
        variant="inverse"
        inert={themeEditorOpen || undefined}
        className="relative h-full w-max max-w-[calc(100vw-1rem)] [--toolbar-padding:var(--floating-toolbar-padding)] transition-[opacity,filter,gap] duration-[var(--duration-base)] ease-[var(--ease-standard)] has-[input:focus]:gap-0 group-data-[state=open]/floating-panel:pointer-events-none group-data-[state=open]/floating-panel:opacity-0 group-data-[state=open]/floating-panel:blur-sm"
      >
        <SidebarSearch items={searchItems} onNavigate={onNavigate} />
        <ToolbarGroup
          data-skin-controls=""
          className="w-max shrink-0 justify-start gap-0 overflow-x-hidden opacity-100 transition-[width,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] peer-focus-within:pointer-events-none peer-focus-within:w-0 peer-focus-within:opacity-0 sm:gap-0.5"
        >
          <SkinPresetControls />
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
