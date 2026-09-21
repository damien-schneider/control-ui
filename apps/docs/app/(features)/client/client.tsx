"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { CatalogOverviewId } from "@/app/(features)/catalog/overviews";
import { skinsOverviewId } from "@/app/(features)/catalog/skins";
import type {
  ActivePageId,
  DocsShellData,
  GuidePage,
  IntegrationId,
  SearchItem,
  SetupPreferenceUpdate,
} from "@/app/(features)/model/types";
import { DocsPageIntegrationProvider } from "@/app/(features)/page-templates/integration";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import {
  DOCS_SIDEBAR_MAX_WIDTH,
  DOCS_SIDEBAR_MIN_WIDTH,
  readStoredSidebarWidth,
  storedSidebarCollapsed,
  writeStoredSidebarWidth,
} from "@/app/(features)/sidebar/persistence";
import { DocsSearchProvider } from "@/app/(features)/sidebar/search";
import { DocsSidebarContent } from "@/app/(features)/sidebar/sidebar";
import { ControlEffectsRuntime } from "@/components/control-ui/extensions/control-effects-root";
import { cn } from "@/components/control-ui/lib/cn";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { PageActions, PageBody, PageHeader, PageLayout, type PageWidth, usePageScroll } from "@/components/control-ui/ui/page-layout";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { isThemeCategoryPath, THEME_EDITOR_PATH } from "@/components/theme-drawer/theme-categories";
import { DocsGithubLink } from "./github-link";
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

const docsMainId = "docs-main";

type DocsShellViewProps = DocsShellData & {
  children: ReactNode;
  githubStars: number | null;
};

type DocsShellStateProps = {
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
  const path = normalizePathname(pathname);
  const currentPath = isThemeCategoryPath(path) ? THEME_EDITOR_PATH : path;
  return searchItems.find((item) => normalizePathname(item.href) === currentPath)?.id;
}

type ActivePageCatalog = Pick<
  DocsShellData,
  "guides" | "skills" | "components" | "blocks" | "primitives" | "hooks" | "utils" | "extensions" | "skinPages"
>;

function guidePageWidth(guideLayout: GuidePage["layout"], catalogOverview: CatalogOverviewId | undefined): PageWidth {
  if (guideLayout === "workspace") return "full";
  if (guideLayout === "wide" || catalogOverview) return "wide";
  return "prose";
}

function resolveActivePage(activePage: ActivePageId | undefined, catalog: ActivePageCatalog) {
  const { guides, skills, components, blocks, primitives, hooks, utils, extensions, skinPages } = catalog;
  const activeGuide = guides.find((item) => item.id === activePage);
  const activeSkill = skills.find((item) => item.id === activePage);
  const activeUseCase = blocks.find((item) => item.id === activePage);
  const activePrimitive = primitives.find((item) => item.id === activePage);
  const activeReference = hooks.find((item) => item.id === activePage) ?? utils.find((item) => item.id === activePage);
  const activeExtension = extensions.find((item) => item.id === activePage);
  const activeCatalogOverview =
    activePage === "components" || activePage === "primitives" || activePage === "use-cases" ? activePage : undefined;
  const activeSkinsOverview = activePage === skinsOverviewId;
  const activeSkinPage = skinPages.find((item) => item.id === activePage);
  const matchedElsewhere =
    activeGuide ?? activeSkill ?? activeUseCase ?? activePrimitive ?? activeReference ?? activeExtension ?? activeCatalogOverview;
  const component =
    matchedElsewhere || activeSkinsOverview || activeSkinPage ? undefined : components.find((item) => item.id === activePage);

  return {
    pageWidth: guidePageWidth(activeGuide?.layout, activeCatalogOverview),
    links: pageLinks({
      activeGuide,
      activeSkill,
      activeUseCase,
      activePrimitive,
      activeReference,
      activeExtension,
      activeSkinPage,
      activeSkinsOverview,
      activeCatalogOverview,
      component,
      primitives,
      extensions,
    }),
  };
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
  // Same two sources the head script already applied to the DOM, read on the first client render so React's
  // model matches what is painted instead of correcting it a frame later.
  const [sidebarOpen, setSidebarOpen] = useState(() => !storedSidebarCollapsed());
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth);

  function updateSidebarWidth(width: number) {
    setSidebarWidth(width);
    writeStoredSidebarWidth(width);
  }

  return (
    <>
      {isHydrated ? (
        <PersistedDocsShell
          {...props}
          onSidebarOpenChange={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={updateSidebarWidth}
        />
      ) : (
        <DocsShellContent
          {...props}
          integration={defaultSetupPreference.integration}
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
  onSidebarOpenChange,
  sidebarOpen,
  sidebarWidth,
  onSidebarWidthChange,
  updateSetupPreference,
}: DocsShellContentProps) {
  const pathname = usePathname();
  const scrollsPage = usePageScroll() === "page";
  const searchItems = buildSearchItems({ guides, skills, components, blocks, primitives, hooks, utils, extensions, skinPages });
  const activePage = activePageForPathname(pathname, searchItems);

  const { links, pageWidth } = resolveActivePage(activePage, {
    guides,
    skills,
    components,
    blocks,
    primitives,
    hooks,
    utils,
    extensions,
    skinPages,
  });
  const pageContent = (
    <DocsPageIntegrationProvider
      integration={integration}
      selectIntegration={(nextIntegration) => updateSetupPreference({ integration: nextIntegration })}
    >
      {children}
    </DocsPageIntegrationProvider>
  );

  return (
    <SidebarProvider
      data-docs-shell=""
      className={cn("bg-canvas text-foreground", !scrollsPage && "h-svh")}
      open={sidebarOpen}
      onOpenChange={onSidebarOpenChange}
      width={sidebarWidth}
      onWidthChange={onSidebarWidthChange}
      minWidth={DOCS_SIDEBAR_MIN_WIDTH}
      maxWidth={DOCS_SIDEBAR_MAX_WIDTH}
    >
      <ButtonLink
        href={`#${docsMainId}`}
        variant="surface"
        size="sm"
        className="fixed start-3 top-3 z-(--z-popup) translate-y-[calc(-100%-1rem)] focus-visible:translate-y-0"
      >
        Skip to content
      </ButtonLink>
      <DocsSearchProvider items={searchItems}>
        <DocsSidebarContent
          active={activePage}
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
        />
        <SidebarInset
          data-docs-inset=""
          id={docsMainId}
          tabIndex={-1}
          className="min-h-0 lg:peer-data-[state=collapsed]:[&_[data-docs-sidebar-trigger]]:flex"
        >
          <div
            data-docs-content=""
            data-control-ui="sidebar-layout"
            data-control-family="sidebar-layout"
            data-slot="content"
            data-surface="panel"
            className={cn("relative flex min-h-0 flex-1 flex-col", !scrollsPage && "overflow-hidden")}
          >
            <div
              data-docs-sidebar-trigger=""
              className={cn(
                "pointer-events-none inset-x-0 top-0 z-20 mx-auto flex w-full max-w-7xl justify-start px-2 pt-3 lg:hidden lg:peer-data-[state=collapsed]:flex",
                scrollsPage ? "fixed" : "absolute",
              )}
            >
              <SidebarTrigger className="pointer-events-auto" />
            </div>
            <PageLayout width={pageWidth}>
              <PageHeader variant="floating">
                <PageActions>
                  <DocsGithubLink stars={githubStars} />
                </PageActions>
              </PageHeader>
              {activePage ? (
                <PageBody aside={pageWidth === "full" ? undefined : <TableOfContents items={links} className="top-12" />}>
                  {pageContent}
                </PageBody>
              ) : (
                pageContent
              )}
            </PageLayout>
          </div>
        </SidebarInset>
      </DocsSearchProvider>
    </SidebarProvider>
  );
}
