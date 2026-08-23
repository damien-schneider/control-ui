"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { skinsOverviewId } from "@/app/(features)/catalog/skins";
import type { ActivePageId, DocsShellData, IntegrationId, SearchItem, SetupPreferenceUpdate } from "@/app/(features)/model/types";
import { DocsPageIntegrationProvider } from "@/app/(features)/page-templates/routed-page";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import { DocsFloatingToolbar } from "@/app/(features)/sidebar/floating-toolbar";
import { DocsSidebarContent } from "@/app/(features)/sidebar/sidebar";
import type { SidebarMode } from "@/app/(features)/sidebar/types";
import { clampSidebarWidth, readStoredSidebarWidth, SIDEBAR_WIDTH_VAR } from "@/app/(features)/sidebar/width";
import { ControlEffectsRuntime } from "@/components/control-ui/extensions/control-effects-root";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { SkinEpochBoundary } from "@/components/theme-drawer-context";
import { pageLinks } from "./page-links";
import {
  defaultSetupPreference,
  docsSetupCollection,
  docsSetupPreferenceVersion,
  type LegacyDocsSetupPreference,
  normalizeSetupPreference,
  updateDocsSetupPreference,
  useIsHydrated,
} from "./setup-preference";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type DocsShellViewProps = DocsShellData & {
  children: ReactNode;
  githubStars: number | null;
};

type DocsShellProps = DocsShellViewProps & {
  defaultSidebarOpen: boolean;
};

type DocsShellStateProps = {
  lastSidebarMode: SidebarMode | null;
  onLastSidebarModeChange: (mode: SidebarMode) => void;
  onSidebarOpenChange: (open: boolean) => void;
  sidebarOpen: boolean;
};

type PersistedDocsShellProps = DocsShellViewProps & DocsShellStateProps;

type DocsShellContentProps = PersistedDocsShellProps & {
  integration: IntegrationId;
  updateSetupPreference: (nextPreference: SetupPreferenceUpdate) => void;
};

function normalizePathname(pathname: string) {
  const withoutTrailingSlash = pathname.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

function activePageForPathname(pathname: string, searchItems: SearchItem[]): ActivePageId | undefined {
  const currentPath = normalizePathname(pathname);
  return searchItems.find((item) => normalizePathname(item.href) === currentPath)?.id;
}

function PersistedDocsShell(props: PersistedDocsShellProps) {
  const { data: setupPreferences } = useLiveQuery(docsSetupCollection);
  const storedSetupPreference = setupPreferences[0];
  const setupPreference = normalizeSetupPreference(storedSetupPreference);

  useEffect(() => {
    if (!storedSetupPreference || storedSetupPreference.version === docsSetupPreferenceVersion) return;

    const legacy: LegacyDocsSetupPreference = storedSetupPreference;
    docsSetupCollection.update(defaultSetupPreference.id, (draft) => {
      draft.integration = legacy.integration ?? legacy.adapter ?? defaultSetupPreference.integration;
      draft.version = docsSetupPreferenceVersion;
    });
  }, [storedSetupPreference]);

  return <DocsShellContent {...props} integration={setupPreference.integration} updateSetupPreference={updateDocsSetupPreference} />;
}

export function DocsShell({ defaultSidebarOpen, ...props }: DocsShellProps) {
  const isHydrated = useIsHydrated();
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [lastSidebarMode, setLastSidebarMode] = useState<SidebarMode | null>(null);

  return (
    <SkinEpochBoundary>
      {isHydrated ? (
        <PersistedDocsShell
          {...props}
          lastSidebarMode={lastSidebarMode}
          onLastSidebarModeChange={setLastSidebarMode}
          onSidebarOpenChange={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />
      ) : (
        <DocsShellContent
          {...props}
          integration={defaultSetupPreference.integration}
          lastSidebarMode={lastSidebarMode}
          onLastSidebarModeChange={setLastSidebarMode}
          onSidebarOpenChange={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          updateSetupPreference={() => {}}
        />
      )}
      <ControlEffectsRuntime />
    </SkinEpochBoundary>
  );
}

function DocsShellContent({
  children,
  githubStars,
  guides,
  skills,
  skillConcerns,
  components,
  blocks,
  primitives,
  hooks,
  utils,
  extensions,
  skinPages,
  integration,
  lastSidebarMode,
  onLastSidebarModeChange,
  onSidebarOpenChange,
  sidebarOpen,
  updateSetupPreference,
}: DocsShellContentProps) {
  const pathname = usePathname();
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const [initialSidebarWidth, setInitialSidebarWidth] = useState<number | null>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const sidebarNavigationRef = useRef<HTMLDivElement>(null);
  function updateSidebarOpen(nextOpen: boolean) {
    if (!nextOpen && sidebarNavigationRef.current?.contains(document.activeElement)) resizeHandleRef.current?.focus();
    onSidebarOpenChange(nextOpen);
  }
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const searchItems = buildSearchItems({ guides, skills, components, blocks, primitives, hooks, utils, extensions, skinPages });
  const activePage = activePageForPathname(pathname, searchItems);
  // parent effect runs after wrapper and container refs attach
  useIsomorphicLayoutEffect(() => {
    if (!activePage) return;
    const wrapper = sidebarWrapperRef.current;
    const renderedWidth = sidebarContainerRef.current?.getBoundingClientRect().width ?? 0;
    const storedWidth = readStoredSidebarWidth();
    const nextWidth = storedWidth ?? (renderedWidth > 0 ? clampSidebarWidth(renderedWidth) : null);
    if (!wrapper || nextWidth === null) return;

    if (storedWidth !== null) wrapper.style.setProperty(SIDEBAR_WIDTH_VAR, `${storedWidth}px`);
    setInitialSidebarWidth(nextWidth);
  }, [activePage]);

  if (!activePage) return <>{children}</>;

  const activeGuide = guides.find((item) => item.id === activePage);
  const activeSkill = skills.find((item) => item.id === activePage);
  const activeUseCase = blocks.find((item) => item.id === activePage);
  const activePrimitive = primitives.find((item) => item.id === activePage);
  const activeHook = hooks.find((item) => item.id === activePage);
  const activeUtil = utils.find((item) => item.id === activePage);
  const activeExtension = extensions.find((item) => item.id === activePage);
  const activeReference = activeHook ?? activeUtil;
  const activeCatalogOverview = activePage === "ai" || activePage === "primitives" || activePage === "use-cases" ? activePage : undefined;
  const activeSkinsOverview = activePage === skinsOverviewId;
  const activeSkinPage = skinPages.find((item) => item.id === activePage);
  const activeSkins = activeSkinsOverview || Boolean(activeSkinPage);
  const activeComponent =
    activeGuide ||
    activeSkill ||
    activeUseCase ||
    activePrimitive ||
    activeReference ||
    activeExtension ||
    activeCatalogOverview ||
    activeSkins
      ? undefined
      : components.find((item) => item.id === activePage);
  const links = pageLinks({
    activeGuide,
    activeSkill,
    activeUseCase,
    activePrimitive,
    activeReference,
    activeExtension,
    activeSkinPage,
    activeSkinsOverview,
    activeCatalogOverview,
    component: activeComponent,
    primitives,
    extensions,
  });
  const pageContent = <DocsPageIntegrationProvider integration={integration}>{children}</DocsPageIntegrationProvider>;

  return (
    <SidebarProvider
      ref={sidebarWrapperRef}
      className="h-svh bg-canvas text-foreground"
      open={sidebarOpen}
      onOpenChange={updateSidebarOpen}
    >
      <DocsSidebarContent
        active={activePage}
        githubStars={githubStars}
        guides={guides}
        skills={skills}
        skillConcerns={skillConcerns}
        components={components}
        blocks={blocks}
        primitives={primitives}
        hooks={hooks}
        utils={utils}
        extensions={extensions}
        skinPages={skinPages}
        searchItems={searchItems}
        integration={integration}
        initialSidebarWidth={initialSidebarWidth}
        lastSectionMode={lastSidebarMode}
        onLastSectionModeChange={onLastSidebarModeChange}
        resizeHandleRef={resizeHandleRef}
        sidebarContainerRef={sidebarContainerRef}
        sidebarNavigationRef={sidebarNavigationRef}
        sidebarWrapperRef={sidebarWrapperRef}
        updateSetupPreference={updateSetupPreference}
      />
      <SidebarInset className="min-h-0 bg-canvas lg:peer-data-[state=collapsed]:[&_[data-docs-sidebar-trigger]]:flex">
        <div
          data-control-ui="sidebar-layout"
          data-slot="content"
          data-surface="panel"
          className="relative m-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-pop lg:m-2"
        >
          <div
            data-docs-sidebar-trigger=""
            className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-7xl justify-start px-2 pt-3 lg:hidden lg:peer-data-[state=collapsed]:flex"
          >
            <SidebarTrigger className="pointer-events-auto" onClick={() => resizeHandleRef.current?.focus()} />
          </div>
          <ScrollArea className="min-h-0 flex-1" viewportClassName="scroll-smooth motion-reduce:scroll-auto">
            <div
              data-docs-page-grid=""
              className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-1 pt-[calc(var(--control-h-sm)+1rem)] pb-24 md:px-2 lg:pt-[calc(var(--control-h-sm)+1.5rem)] 2xl:grid-cols-[minmax(0,1fr)_180px]"
            >
              {pageContent}

              <aside className="hidden py-12 2xl:block">
                <TableOfContents items={links} />
              </aside>
            </div>
          </ScrollArea>
        </div>
        <DocsFloatingToolbar
          active={activePage}
          searchItems={searchItems}
          skills={skills}
          lastSectionMode={lastSidebarMode}
          onLastSectionModeChange={onLastSidebarModeChange}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
