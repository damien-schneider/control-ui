"use client";

import { DocsBrand } from "@/app/(features)/brand/docs-brand";
import { DocsBylineLink, DocsResourceLinks } from "@/app/(features)/client/site-links";
import type { ActivePageId } from "@/app/(features)/model/types";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/control-ui/ui/sidebar";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { catalogNavGroupIcons, sidebarDoors, templateKindSidebarIcons, themeEditorDoor } from "./icons";
import { DocsNavGroup, SidebarDoorMenu, SidebarDoorPane, SkillConcernNavGroups } from "./nav-groups";
import { catalogNavGroups, type GuideNavGroup, getTemplateNavGroups, guideNavSections, sidebarPaneForActivePage } from "./nav-items";
import { DOCS_SIDEBAR_COLLAPSIBLE } from "./persistence";
import { DocsSearchTrigger } from "./search";
import { StartCard } from "./start-card";
import { ThemeCategoryNav } from "./theme-category-nav";
import type { DocsSidebarContentProps, SidebarDoorId } from "./types";
import { useCloseMobileSidebar } from "./use-close-mobile-sidebar";

type DoorNavGroupsProps = Pick<DocsSidebarContentProps, "blocks" | "skills" | "skillConcerns"> & {
  doorId: SidebarDoorId;
  referenceGroups: GuideNavGroup[];
  active: ActivePageId | undefined;
  onNavigate: () => void;
};

function DoorNavGroups({ doorId, referenceGroups, blocks, skills, skillConcerns, active, onNavigate }: DoorNavGroupsProps) {
  if (doorId === "templates")
    return getTemplateNavGroups(blocks).map((group) => (
      <DocsNavGroup
        key={group.id}
        title={group.title}
        icon={templateKindSidebarIcons[group.kind]}
        items={group.items}
        active={active}
        onNavigate={onNavigate}
      />
    ));

  if (doorId === "practices")
    return <SkillConcernNavGroups concerns={skillConcerns} skills={skills} active={active} onNavigate={onNavigate} />;

  if (doorId === "theme-editor") return <ThemeCategoryNav onNavigate={onNavigate} />;

  return referenceGroups.map((group) => (
    <DocsNavGroup key={group.id} title={group.title} items={group.items} active={active} onNavigate={onNavigate} />
  ));
}

type CatalogNavGroupsProps = Pick<DocsSidebarContentProps, "kits" | "components" | "hooks" | "utils" | "extensions"> & {
  active: ActivePageId | undefined;
  onNavigate: () => void;
};

function CatalogNavGroups({ active, onNavigate, ...catalog }: CatalogNavGroupsProps) {
  return catalogNavGroups(catalog).map((group) => (
    <DocsNavGroup
      key={group.id}
      title={group.title}
      icon={catalogNavGroupIcons[group.id]}
      items={group.items}
      active={active}
      onNavigate={onNavigate}
    />
  ));
}

export function DocsSidebarContent({
  active,
  guides,
  skills,
  skillConcerns,
  kits,
  blocks,
  components,
  hooks,
  utils,
  extensions,
  searchItems,
  showRoot,
  onShowRoot,
}: DocsSidebarContentProps) {
  const { isMobile } = useSidebar();
  const closeSidebar = useCloseMobileSidebar();
  const guideSections = guideNavSections(guides);
  const startGroup = guideSections.top.find((group) => group.id === "start");
  const pane = sidebarPaneForActivePage(active, searchItems, guideSections.reference);
  const openDoor = showRoot ? undefined : [...sidebarDoors, themeEditorDoor].find((door) => door.id === pane);

  return (
    <Sidebar data-docs-sidebar-navigation="" mobileVariant="drawer" collapsible={DOCS_SIDEBAR_COLLAPSIBLE}>
      {isMobile ? (
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <DocsBrand onNavigate={closeSidebar} />
            <DocsSearchTrigger />
          </div>
        </SidebarHeader>
      ) : null}
      <SidebarContent>
        {openDoor ? (
          <SidebarDoorPane door={openDoor} active={active} onNavigate={closeSidebar} onBack={onShowRoot}>
            <DoorNavGroups
              doorId={openDoor.id}
              referenceGroups={guideSections.reference}
              blocks={blocks}
              skills={skills}
              skillConcerns={skillConcerns}
              active={active}
              onNavigate={closeSidebar}
            />
          </SidebarDoorPane>
        ) : (
          <>
            {startGroup ? <StartCard steps={startGroup} active={active} onNavigate={closeSidebar} /> : null}
            <SidebarDoorMenu doors={sidebarDoors} onNavigate={closeSidebar} />
            <CatalogNavGroups
              active={active}
              onNavigate={closeSidebar}
              kits={kits}
              components={components}
              hooks={hooks}
              utils={utils}
              extensions={extensions}
            />
          </>
        )}
      </SidebarContent>

      {isMobile ? (
        <SidebarFooter>
          <div className="flex items-center justify-between gap-2">
            <ThemeModeSwitch />
            <DocsBylineLink />
          </div>
          <div className="flex items-center gap-1">
            <DocsResourceLinks />
          </div>
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  );
}
