"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { skinsOverviewId } from "@/app/(features)/catalog/skins";
import type { ActivePageId, DocsShellData, IntegrationId, SearchItem, SetupPreferenceUpdate } from "@/app/(features)/model/types";
import { DocsPageIntegrationProvider } from "@/app/(features)/page-templates/routed-page";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import { DocsFloatingToolbar } from "@/app/(features)/sidebar/floating-toolbar";
import { DocsSidebarContent } from "@/app/(features)/sidebar/sidebar";
import type { SidebarMode } from "@/app/(features)/sidebar/types";
import { readStoredSidebarWidth, writeStoredSidebarWidth } from "@/app/(features)/sidebar/width";
import { SIDEBAR_COOKIE_NAME } from "@/components/control-ui/control-props";
import { ControlEffectsRuntime } from "@/components/control-ui/extensions/control-effects-root";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
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

function storedSidebarCollapsed() {
  return document.cookie.split("; ").includes(`${SIDEBAR_COOKIE_NAME}=false`);
}

type DocsShellViewProps = DocsShellData & {
  children: ReactNode;
  githubStars: number | null;
};

type DocsShellStateProps = {
  lastSidebarMode: SidebarMode | null;
  onLastSidebarModeChange: (mode: SidebarMode) => void;
  onSidebarOpenChange: (open: boolean) => void;
  sidebarOpen: boolean;
  sidebarWidth: number | undefined;
  onSidebarWidthChange: (width: number) => void;
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

export function DocsShell(props: DocsShellViewProps) {
  const isHydrated = useIsHydrated();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState<number>();
  const [lastSidebarMode, setLastSidebarMode] = useState<SidebarMode | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (storedSidebarCollapsed()) setSidebarOpen(false);
    setSidebarWidth(readStoredSidebarWidth() ?? undefined);
  }, []);

  function updateSidebarWidth(width: number) {
    setSidebarWidth(width);
    writeStoredSidebarWidth(width);
  }

  return (
    <>
      {isHydrated ? (
        <PersistedDocsShell
          {...props}
          lastSidebarMode={lastSidebarMode}
          onLastSidebarModeChange={setLastSidebarMode}
          onSidebarOpenChange={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={updateSidebarWidth}
        />
      ) : (
        <DocsShellContent
          {...props}
          integration={defaultSetupPreference.integration}
          lastSidebarMode={lastSidebarMode}
          onLastSidebarModeChange={setLastSidebarMode}
          onSidebarOpenChange={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={updateSidebarWidth}
          updateSetupPreference={() => {}}
        />
      )}
      <ControlEffectsRuntime />
    </>
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
  sidebarWidth,
  onSidebarWidthChange,
  updateSetupPreference,
}: DocsShellContentProps) {
  const pathname = usePathname();
  const skin = useSkin();
  const usesPageLayout = skin.sidebarLayout === "page";
  const searchItems = buildSearchItems({ guides, skills, components, blocks, primitives, hooks, utils, extensions, skinPages });
  const activePage = activePageForPathname(pathname, searchItems);

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
  const pageGrid = (
    <div data-docs-page-grid="">
      {pageContent}
      <aside data-docs-page-toc="">
        <TableOfContents items={links} />
      </aside>
    </div>
  );

  return (
    <SidebarProvider
      data-docs-layout={usesPageLayout ? "page" : "contained"}
      className={cn("bg-canvas text-foreground", !usesPageLayout && "h-svh")}
      open={sidebarOpen}
      onOpenChange={onSidebarOpenChange}
      width={sidebarWidth}
      onWidthChange={onSidebarWidthChange}
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
        lastSectionMode={lastSidebarMode}
        onLastSectionModeChange={onLastSidebarModeChange}
        updateSetupPreference={updateSetupPreference}
      />
      <SidebarInset data-docs-inset="" className="min-h-0 lg:peer-data-[state=collapsed]:[&_[data-docs-sidebar-trigger]]:flex">
        <div
          data-docs-content=""
          data-control-ui="sidebar-layout"
          data-control-family="sidebar-layout"
          data-slot="content"
          data-surface="panel"
          className={cn("relative flex min-h-0 flex-1 flex-col", !usesPageLayout && "overflow-hidden")}
        >
          <div
            data-docs-sidebar-trigger=""
            className={cn(
              "pointer-events-none inset-x-0 top-0 z-20 mx-auto flex w-full max-w-7xl justify-start px-2 pt-3 lg:hidden lg:peer-data-[state=collapsed]:flex",
              usesPageLayout ? "fixed" : "absolute",
            )}
          >
            <SidebarTrigger className="pointer-events-auto" />
          </div>
          {usesPageLayout ? (
            pageGrid
          ) : (
            <ScrollArea className="min-h-0 flex-1" viewportClassName="scroll-smooth motion-reduce:scroll-auto">
              {pageGrid}
            </ScrollArea>
          )}
        </div>
        <DocsFloatingToolbar
          active={activePage}
          searchItems={searchItems}
          lastSectionMode={lastSidebarMode}
          onLastSectionModeChange={onLastSidebarModeChange}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
