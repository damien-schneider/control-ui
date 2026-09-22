"use client";

import { CustomizeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { useState } from "react";
import { ControlUiLogo } from "@/app/(features)/brand/control-ui-logo";
import type { ActivePageId } from "@/app/(features)/model/types";
import { Badge } from "@/components/control-ui/ui/badge";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/control-ui/ui/sidebar";
import { SkinPresetControls } from "@/components/theme-drawer/skin-preset-controls";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { catalogNavGroupIcons, sidebarDoors, themeEditorDoor, useCaseKindSidebarIcons } from "./icons";
import { DocsNavGroup, SidebarDoorMenu, SidebarDoorPane, SkillConcernNavGroups } from "./nav-groups";
import { catalogNavGroups, type GuideNavGroup, getUseCaseNavGroups, guideNavSections, sidebarPaneForActivePage } from "./nav-items";
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
  if (doorId === "use-cases")
    return getUseCaseNavGroups(blocks).map((group) => (
      <DocsNavGroup
        key={group.id}
        title={group.title}
        icon={useCaseKindSidebarIcons[group.kind]}
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

type CatalogNavGroupsProps = Pick<DocsSidebarContentProps, "components" | "primitives" | "hooks" | "utils" | "extensions"> & {
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
  components,
  blocks,
  primitives,
  hooks,
  utils,
  extensions,
  searchItems,
}: DocsSidebarContentProps) {
  const closeSidebar = useCloseMobileSidebar();
  const guideSections = guideNavSections(guides);
  const startGroup = guideSections.top.find((group) => group.id === "start");
  const pane = sidebarPaneForActivePage(active, searchItems, guideSections.reference);
  const [rootPaneOnPage, setRootPaneOnPage] = useState<ActivePageId>();
  const openDoor = rootPaneOnPage === active ? undefined : [...sidebarDoors, themeEditorDoor].find((door) => door.id === pane);

  return (
    <Sidebar collapsible={DOCS_SIDEBAR_COLLAPSIBLE} className="group-data-[side=left]:border-r-0 group-data-[side=right]:border-l-0">
      <div data-docs-sidebar-navigation="" className="flex min-h-0 flex-1 flex-col">
        <SidebarHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex min-w-0 items-center">
              <Link href="/" onClick={closeSidebar} className="flex min-w-0 items-center gap-1.5">
                <ControlUiLogo />
                <span className="block truncate font-display text-body font-semibold leading-none tracking-tighter text-sidebar-foreground">
                  control.ui
                </span>
              </Link>
              <Badge size="sm" className="absolute -top-1 left-full ml-1">
                alpha
              </Badge>
            </div>
            <DocsSearchTrigger />
          </div>
          {/* biome-ignore lint/a11y/useSemanticElements: a labelled row of sidebar controls, not a form fieldset. */}
          <div role="group" aria-label="Documentation controls" className="flex items-center gap-1.5">
            <SkinPresetControls className="min-w-0 flex-1 justify-between" onNavigate={closeSidebar} />
            <ButtonLink
              render={<Link href="/theme-editor" onClick={closeSidebar} />}
              variant="surface"
              size="sm"
              iconOnly
              aria-label="Edit theme"
              title="Edit theme"
              aria-current={active === "theme-editor" ? "page" : undefined}
            >
              <HugeiconsIcon aria-hidden icon={CustomizeIcon} size={16} strokeWidth={1.7} />
            </ButtonLink>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {openDoor ? (
            <SidebarDoorPane door={openDoor} active={active} onNavigate={closeSidebar} onBack={() => setRootPaneOnPage(active)}>
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
                components={components}
                primitives={primitives}
                hooks={hooks}
                utils={utils}
                extensions={extensions}
              />
            </>
          )}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between gap-2">
            <ThemeModeSwitch />
            <p className="text-right text-micro leading-none text-muted-foreground">
              by{" "}
              <a
                href="https://x.com/damien_schneid"
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap underline decoration-sidebar-foreground/30 underline-offset-2 hover:text-sidebar-foreground"
              >
                Damien Schneider
              </a>
            </p>
          </div>
        </SidebarFooter>
      </div>

      <SidebarRail resizable />
    </Sidebar>
  );
}
