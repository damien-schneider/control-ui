"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { skinsOverviewId } from "@/app/(features)/catalog/skins";
import type { ActivePageId, DocsShellData, IntegrationId, SearchItem, SetupPreferenceUpdate } from "@/app/(features)/model/types";
import { DocsPageIntegrationProvider } from "@/app/(features)/page-templates/routed-page";
import { buildSearchItems } from "@/app/(features)/registry-api/search";
import { DocsSidebarContent } from "@/app/(features)/sidebar/sidebar";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/control-ui/ui/sidebar";
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
import { SkinSourcePanel } from "./skin-source-panel";

type DocsShellProps = DocsShellData & {
  children: ReactNode;
  githubStars: number | null;
};

type DocsShellContentProps = DocsShellProps & {
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

function PersistedDocsShell(props: DocsShellProps) {
  const { data: setupPreferences } = useLiveQuery(docsSetupCollection);
  const storedSetupPreference = setupPreferences[0];
  const setupPreference = normalizeSetupPreference(storedSetupPreference);

  useEffect(() => {
    if (!storedSetupPreference || storedSetupPreference.version === docsSetupPreferenceVersion) return;

    // Older payload may carry fields (adapter/skin/source) absent from current type; the legacy annotation surfaces them for migration (guarded by version check above).
    const legacy: LegacyDocsSetupPreference = storedSetupPreference;
    docsSetupCollection.update(defaultSetupPreference.id, (draft) => {
      draft.integration = legacy.integration ?? legacy.adapter ?? defaultSetupPreference.integration;
      draft.version = docsSetupPreferenceVersion;
    });
  }, [storedSetupPreference]);

  return <DocsShellContent {...props} integration={setupPreference.integration} updateSetupPreference={updateDocsSetupPreference} />;
}

export function DocsShell(props: DocsShellProps) {
  const isHydrated = useIsHydrated();

  if (isHydrated) return <PersistedDocsShell {...props} />;

  return <DocsShellContent {...props} integration={defaultSetupPreference.integration} updateSetupPreference={() => {}} />;
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
  updateSetupPreference,
}: DocsShellContentProps) {
  const pathname = usePathname();
  // React Compiler keeps this derivation stable while its serialized catalog inputs are unchanged.
  const searchItems = buildSearchItems({ guides, skills, components, blocks, primitives, hooks, utils, extensions, skinPages });
  const activePage = activePageForPathname(pathname, searchItems);

  if (!activePage) return <>{children}</>;

  const activeGuide = guides.find((item) => item.id === activePage);
  const activeSkill = skills.find((item) => item.id === activePage);
  const activeBlock = blocks.find((item) => item.id === activePage);
  const activePrimitive = primitives.find((item) => item.id === activePage);
  const activeHook = hooks.find((item) => item.id === activePage);
  const activeUtil = utils.find((item) => item.id === activePage);
  const activeExtension = extensions.find((item) => item.id === activePage);
  const activeReference = activeHook ?? activeUtil;
  const activeCatalogOverview = activePage === "ai" || activePage === "primitives" ? activePage : undefined;
  const activeSkinsOverview = activePage === skinsOverviewId;
  const activeSkinPage = skinPages.find((item) => item.id === activePage);
  const activeSkins = activeSkinsOverview || Boolean(activeSkinPage);
  const activeComponent =
    activeGuide ||
    activeSkill ||
    activeBlock ||
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
    activeBlock,
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
    <SidebarProvider className="h-svh bg-canvas text-foreground">
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
        updateSetupPreference={updateSetupPreference}
      />
      <SidebarInset className="min-h-0 bg-canvas pb-24 transition-[padding-right] duration-200 ease-linear md:pb-0 md:pr-[var(--theme-drawer-width,0px)]">
        <div
          data-control-ui="sidebar-layout"
          data-slot="content"
          data-surface="panel"
          className={cn(
            "relative mt-1.5 ml-0 mr-1.5 mb-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-pop lg:mt-2 lg:mr-2 lg:mb-2 lg:ml-0",
            skinSlot("sidebar-layout", "content", {}),
          )}
        >
          <ScrollArea className="min-h-0 flex-1" viewportClassName="scroll-smooth motion-reduce:scroll-auto">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-1 pt-1 pb-24 md:px-2 md:pt-2 2xl:grid-cols-[minmax(0,1fr)_180px]">
              {pageContent}

              <aside className="hidden py-12 2xl:block">
                <TableOfContents items={links} />
              </aside>
            </div>
          </ScrollArea>
          <SkinSourcePanel skins={skinPages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
