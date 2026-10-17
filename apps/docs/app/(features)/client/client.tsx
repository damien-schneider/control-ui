"use client";

import { useLiveQuery } from "@tanstack/react-db";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
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
import { DocsSidebarSearchProvider } from "@/app/(features)/sidebar/search";
import { DocsSidebarContent } from "@/app/(features)/sidebar/sidebar";
import { ControlEffectsRuntime } from "@/components/control-ui/extensions/control-effects-root";
import { cn } from "@/components/control-ui/lib/cn";
import { AppShell, AppShellContent } from "@/components/control-ui/ui/app-shell";
import { PageActions, PageBody, PageHeader, PageLayout, type PageWidth, usePageScroll } from "@/components/control-ui/ui/page-layout";
import { SidebarMobileNav, SidebarMobileTrigger, SidebarTrigger } from "@/components/control-ui/ui/sidebar";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { isThemeCategoryPath, SKIN_CATEGORY, THEME_EDITOR_PATH, themeCategoryForPath } from "@/components/theme-drawer/theme-categories";
import { DocsGithubLink } from "./github-link";
import { pageLinks } from "./page-links";
import {
  defaultSetupPreference,
  docsSetupCollection,
  normalizeSetupPreference,
  updateDocsSetupPreference,
  useIsHydrated,
} from "./setup-preference";

const ThemeEditorAside = dynamic(() => import("@/components/theme-drawer/theme-editor-aside").then((module) => module.ThemeEditorAside));

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
  "guides" | "skills" | "kits" | "blocks" | "components" | "hooks" | "utils" | "extensions" | "skinPages"
>;

function guidePageWidth(guideLayout: GuidePage["layout"], catalogOverview: CatalogOverviewId | undefined): PageWidth {
  if (guideLayout === "wide" || catalogOverview) return "wide";
  return "prose";
}

function resolveActivePage(activePage: ActivePageId | undefined, catalog: ActivePageCatalog) {
  const { guides, skills, kits, blocks, components, hooks, utils, extensions, skinPages } = catalog;
  const activeGuide = guides.find((item) => item.id === activePage);
  const activeSkill = skills.find((item) => item.id === activePage);
  const activeTemplate = blocks.find((item) => item.id === activePage);
  const activeComponent = components.find((item) => item.id === activePage);
  const activeReference = hooks.find((item) => item.id === activePage) ?? utils.find((item) => item.id === activePage);
  const activeExtension = extensions.find((item) => item.id === activePage);
  const activeCatalogOverview = activePage === "kits" || activePage === "components" || activePage === "templates" ? activePage : undefined;
  const activeSkinsOverview = activePage === skinsOverviewId;
  const activeSkinPage = skinPages.find((item) => item.id === activePage);
  const matchedElsewhere =
    activeGuide ?? activeSkill ?? activeTemplate ?? activeComponent ?? activeReference ?? activeExtension ?? activeCatalogOverview;
  const kit = matchedElsewhere || activeSkinsOverview || activeSkinPage ? undefined : kits.find((item) => item.id === activePage);

  return {
    pageWidth: activeSkinPage || !activePage ? "wide" : guidePageWidth(activeGuide?.layout, activeCatalogOverview),
    links: pageLinks({
      activeGuide,
      activeSkill,
      activeTemplate,
      activeComponent,
      activeReference,
      activeExtension,
      activeSkinPage,
      activeSkinsOverview,
      activeCatalogOverview,
      kit,
      components,
      extensions,
    }),
  };
}

function PersistedDocsShell(props: PersistedDocsShellProps) {
  const { data: setupPreferences } = useLiveQuery(docsSetupCollection);
  const setupPreference = normalizeSetupPreference(setupPreferences[0]);

  return <DocsShellContent {...props} integration={setupPreference.integration} updateSetupPreference={updateDocsSetupPreference} />;
}

export function DocsShell(props: DocsShellViewProps) {
  const isHydrated = useIsHydrated();
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
  kits,
  blocks,
  components,
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
  const skinScroll = usePageScroll();
  // Page and inset scroll mount different PageLayout trees; home pins one so a skin switch keeps its place and state.
  const scroll = normalizePathname(pathname) === "/" ? "page" : skinScroll;
  const scrollsPage = scroll === "page";
  const searchItems = buildSearchItems({ guides, skills, kits, blocks, components, hooks, utils, extensions, skinPages });
  const activePage = activePageForPathname(pathname, searchItems);
  const themeEditorCategory = activePage === "theme-editor" ? themeCategoryForPath(normalizePathname(pathname)) : null;

  const { links, pageWidth } = resolveActivePage(activePage, {
    guides,
    skills,
    kits,
    blocks,
    components,
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
    <AppShell
      scroll={scroll}
      data-docs-shell=""
      className="bg-canvas text-foreground"
      open={sidebarOpen}
      onOpenChange={onSidebarOpenChange}
      width={sidebarWidth}
      onWidthChange={onSidebarWidthChange}
      minWidth={DOCS_SIDEBAR_MIN_WIDTH}
      maxWidth={DOCS_SIDEBAR_MAX_WIDTH}
    >
      <DocsSidebarSearchProvider items={searchItems}>
        <DocsSidebarContent
          active={activePage}
          guides={guides}
          skills={skills}
          skillConcerns={skillConcerns}
          kits={kits}
          blocks={blocks}
          components={components}
          hooks={hooks}
          utils={utils}
          extensions={extensions}
          skinPages={skinPages}
          searchItems={searchItems}
        />
        <AppShellContent data-docs-inset="" className="min-h-0 lg:peer-data-[state=collapsed]:[&_[data-docs-sidebar-trigger]]:flex">
          <div
            data-docs-content=""
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
            <PageLayout
              width={pageWidth}
              style={themeEditorCategory && themeEditorCategory !== SKIN_CATEGORY ? { "--cui-page-layout-aside-size": "21rem" } : undefined}
            >
              <PageHeader variant="floating">
                <PageActions>
                  <DocsGithubLink stars={githubStars} />
                </PageActions>
              </PageHeader>
              {activePage ? (
                <PageBody
                  aside={
                    themeEditorCategory ? (
                      <ThemeEditorAside category={themeEditorCategory} />
                    ) : (
                      <TableOfContents items={links} className="top-12" />
                    )
                  }
                >
                  {pageContent}
                </PageBody>
              ) : (
                pageContent
              )}
            </PageLayout>
          </div>
        </AppShellContent>
        <SidebarMobileNav variant="floating" aria-label="Documentation mobile navigation">
          <SidebarMobileTrigger />
        </SidebarMobileNav>
      </DocsSidebarSearchProvider>
    </AppShell>
  );
}
