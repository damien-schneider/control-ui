"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import type { DocsShellData } from "@/app/(features)/model/shell-data";
import type { ActivePageId, IntegrationId, SearchItem, SetupPreferenceUpdate } from "@/app/(features)/model/types";
import { DocsPageIntegrationProvider } from "@/app/(features)/page-templates/integration";
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
import { PageBody, PageLayout, usePageScroll } from "@/components/control-ui/ui/page-layout";
import { TableOfContents } from "@/components/control-ui/ui/table-of-contents";
import { isThemeCategoryPath, SKIN_CATEGORY, THEME_EDITOR_PATH, themeCategoryForPath } from "@/components/theme-drawer/theme-categories";
import type { PageOutline } from "./page-links";
import { updateDocsSetupPreference, useDocsSetupIntegration } from "./setup-preference";
import { DocsBottomCorners, DocsTopCorners } from "./shell-corners";

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

type DocsShellContentProps = DocsShellViewProps &
  DocsShellStateProps & {
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

const unlistedPageOutline: PageOutline = { width: "wide", links: [] };

export function DocsShell(props: DocsShellViewProps) {
  const integration = useDocsSetupIntegration();
  const [sidebarOpen, setSidebarOpen] = useState(() => !storedSidebarCollapsed());
  const [sidebarWidth, setSidebarWidth] = useState(readStoredSidebarWidth);

  function updateSidebarWidth(width: number) {
    setSidebarWidth(width);
    writeStoredSidebarWidth(width);
  }

  return (
    <>
      <DocsShellContent
        {...props}
        integration={integration}
        onSidebarOpenChange={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={updateSidebarWidth}
        updateSetupPreference={updateDocsSetupPreference}
      />
      <ControlEffectsRuntime />
    </>
  );
}

function DocsShellContent({
  children,
  githubStars,
  nav,
  searchItems,
  pageOutlines,
  integration,
  onSidebarOpenChange,
  sidebarOpen,
  sidebarWidth,
  onSidebarWidthChange,
  updateSetupPreference,
}: DocsShellContentProps) {
  const pathname = usePathname();
  const [sidebarRootPathname, setSidebarRootPathname] = useState<string | null>(null);
  if (sidebarRootPathname !== null && sidebarRootPathname !== pathname) setSidebarRootPathname(null);
  const skinScroll = usePageScroll();
  // Page and inset scroll mount different PageLayout trees; home pins one so a skin switch keeps its place and state.
  const scroll = normalizePathname(pathname) === "/" ? "page" : skinScroll;
  const scrollsPage = scroll === "page";
  const activePage = activePageForPathname(pathname, searchItems);
  const themeEditorCategory = activePage === "theme-editor" ? themeCategoryForPath(normalizePathname(pathname)) : null;
  const outline = activePage ? pageOutlines[activePage] : unlistedPageOutline;
  const pageContent = (
    <DocsPageIntegrationProvider
      integration={integration}
      selectIntegration={(nextIntegration) => updateSetupPreference({ integration: nextIntegration })}
    >
      {children}
    </DocsPageIntegrationProvider>
  );

  const editTheme = () => setSidebarRootPathname(null);

  return (
    <AppShell
      scroll={scroll}
      data-docs-shell=""
      open={sidebarOpen}
      onOpenChange={onSidebarOpenChange}
      width={sidebarWidth}
      onWidthChange={onSidebarWidthChange}
      minWidth={DOCS_SIDEBAR_MIN_WIDTH}
      maxWidth={DOCS_SIDEBAR_MAX_WIDTH}
    >
      <DocsSidebarSearchProvider items={searchItems}>
        <DocsTopCorners githubStars={githubStars} onEditTheme={editTheme} />
        <DocsSidebarContent
          active={activePage}
          searchItems={searchItems}
          showRoot={sidebarRootPathname === pathname}
          onShowRoot={() => setSidebarRootPathname(pathname)}
          {...nav}
        />
        <AppShellContent data-docs-inset="" className="min-h-0">
          <div
            data-docs-content=""
            data-surface="panel"
            className={cn("relative flex min-h-0 flex-1 flex-col", !scrollsPage && "overflow-hidden")}
          >
            <PageLayout width={outline.width}>
              {activePage ? (
                <PageBody
                  asideWidth={themeEditorCategory && themeEditorCategory !== SKIN_CATEGORY ? "wide" : "narrow"}
                  aside={
                    <div className="h-full py-12">
                      {themeEditorCategory ? (
                        <ThemeEditorAside category={themeEditorCategory} />
                      ) : (
                        <TableOfContents items={outline.links} className="top-12" />
                      )}
                    </div>
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
        <DocsBottomCorners onEditTheme={editTheme} />
      </DocsSidebarSearchProvider>
    </AppShell>
  );
}
