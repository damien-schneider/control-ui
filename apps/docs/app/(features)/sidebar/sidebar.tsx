"use client";

import { CustomizeIcon, GithubIcon, PlusSignIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { useState } from "react";
import { ControlUiLogo } from "@/app/(features)/brand/control-ui-logo";
import type { ActivePageId, GuidePage } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { ButtonLink } from "@/components/control-ui/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/control-ui/ui/sidebar";
import { SkinPresetControls } from "@/components/theme-drawer/skin-preset-controls";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { primitiveCategorySidebarIcons, sidebarDoors, sidebarGroupIcons, useCaseKindSidebarIcons } from "./icons";
import { SidebarModeSelector } from "./mode-selector";
import { DocsNavGroup, SidebarDoorMenu, SidebarDoorPane, SkillConcernNavGroups } from "./nav-groups";
import {
  agentNavItems,
  ctaGuide,
  extensionNavItems,
  type GuideNavGroup,
  getUseCaseNavGroups,
  guideNavSections,
  hookNavItems,
  primitiveNavGroups,
  sidebarPaneForActivePage,
  utilNavItems,
} from "./nav-items";
import { DocsSearchTrigger } from "./search";
import { SidebarSetupControls, type SidebarSetupControlsScope } from "./setup-controls";
import { StartCard } from "./start-card";
import type { DocsSidebarContentProps, SidebarDoorId, SidebarMode, SidebarPane } from "./types";
import { useSidebarNavigation } from "./use-sidebar-navigation";

function setupControlsScopeForKind(kind: string | undefined): SidebarSetupControlsScope {
  if (kind === "Agent") return "ai";
  return "none";
}

const githubStarsFormatter = new Intl.NumberFormat("en-US");

type DocsSidebarProps = DocsSidebarContentProps & {
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
};

function GuideCtaLink({ guides, active, onNavigate }: { guides: GuidePage[]; active: ActivePageId; onNavigate: () => void }) {
  const cta = ctaGuide(guides);
  if (!cta) return null;

  return (
    <ButtonLink
      render={<Link href={`/${cta.id}`} onClick={onNavigate} aria-current={active === cta.id ? "page" : undefined} />}
      variant="solid"
      tone="primary"
      size="sm"
      className="w-full"
    >
      <HugeiconsIcon aria-hidden icon={PlusSignIcon} strokeWidth={2} />
      {cta.name}
    </ButtonLink>
  );
}

type CatalogNavGroupsProps = Pick<DocsSidebarContentProps, "components" | "primitives" | "hooks" | "utils" | "extensions"> & {
  mode: SidebarMode;
  active: ActivePageId;
  onNavigate: () => void;
};

function CatalogNavGroups({ mode, active, onNavigate, components, primitives, hooks, utils, extensions }: CatalogNavGroupsProps) {
  if (mode === "agents")
    return (
      <DocsNavGroup
        title="Agents"
        icon={sidebarGroupIcons.agents}
        items={agentNavItems(components)}
        active={active}
        prefix="/ai/"
        onNavigate={onNavigate}
      />
    );

  return (
    <>
      {primitiveNavGroups(primitives).map((group) => (
        <DocsNavGroup
          key={group.id}
          title={group.title}
          icon={primitiveCategorySidebarIcons[group.id]}
          items={group.items}
          active={active}
          prefix="/primitives/"
          onNavigate={onNavigate}
        />
      ))}
      <DocsNavGroup
        title="Hooks"
        icon={sidebarGroupIcons.hooks}
        items={hookNavItems(hooks)}
        active={active}
        prefix="/hooks/"
        onNavigate={onNavigate}
      />
      <DocsNavGroup
        title="Utils"
        icon={sidebarGroupIcons.utils}
        items={utilNavItems(utils)}
        active={active}
        prefix="/utils/"
        onNavigate={onNavigate}
      />
      <DocsNavGroup
        title="Extensions"
        icon={sidebarGroupIcons.extensions}
        items={extensionNavItems(extensions)}
        active={active}
        prefix="/extensions/"
        onNavigate={onNavigate}
      />
    </>
  );
}

type DoorNavGroupsProps = Pick<DocsSidebarContentProps, "blocks" | "skills" | "skillConcerns"> & {
  doorId: SidebarDoorId;
  referenceGroups: GuideNavGroup[];
  active: ActivePageId;
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
        prefix="/use-cases/"
        onNavigate={onNavigate}
      />
    ));

  if (doorId === "practices")
    return <SkillConcernNavGroups concerns={skillConcerns} skills={skills} active={active} onNavigate={onNavigate} />;

  return referenceGroups.map((group) => (
    <DocsNavGroup key={group.id} title={group.title} items={group.items} active={active} prefix="/" onNavigate={onNavigate} />
  ));
}

export function DocsSidebarContent({
  active,
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
  searchItems,
  integration,
  lastSectionMode,
  onLastSectionModeChange,
  updateSetupPreference,
}: DocsSidebarProps) {
  const { activeItem, mode, modeHrefs, closeMobile, onNavigate, onModeNavigate } = useSidebarNavigation({
    active,
    searchItems,
    lastSectionMode,
    onLastSectionModeChange,
  });
  const setupControlsScope = setupControlsScopeForKind(activeItem?.kind);
  const formattedGitHubStars = githubStars == null ? null : githubStarsFormatter.format(githubStars);
  const githubLinkLabel =
    formattedGitHubStars == null
      ? "Control UI on GitHub"
      : `Control UI on GitHub, ${formattedGitHubStars} ${githubStars === 1 ? "star" : "stars"}`;
  const guideSections = guideNavSections(guides);
  const startGroup = guideSections.top.find((group) => group.id === "start");
  const activePane = sidebarPaneForActivePage(active, searchItems, guideSections.reference);
  const [paneChoice, setPaneChoice] = useState<{ page: ActivePageId; pane: SidebarPane } | null>(null);
  const paneOverride = paneChoice?.page === active ? paneChoice.pane : null;
  const pane = paneOverride ?? activePane;
  const openDoor = sidebarDoors.find((door) => door.id === pane);

  function choosePane(nextPane: SidebarPane) {
    setPaneChoice({ page: active, pane: nextPane });
  }

  return (
    <Sidebar collapsible="offcanvas" className="group-data-[side=left]:border-r-0 group-data-[side=right]:border-l-0">
      <div data-docs-sidebar-navigation="" className="flex min-h-0 flex-1 flex-col">
        <SidebarHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex min-w-0 items-center gap-1.5">
              <ControlUiLogo />
              <span className="block truncate font-display text-body font-semibold leading-none tracking-tighter text-sidebar-foreground">
                control.ui
              </span>
              <Badge size="sm" className="absolute -top-1 left-full ml-1">
                alpha
              </Badge>
            </div>
            <DocsSearchTrigger />
          </div>
          <div className="flex items-center gap-1.5">
            <SkinPresetControls className="min-w-0 flex-1 justify-between" />
            <ButtonLink
              render={<Link href="/theme-editor" onClick={onNavigate} />}
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
        <SidebarSetupControls integration={integration} scope={setupControlsScope} updateSetupPreference={updateSetupPreference} />

        <SidebarContent>
          {openDoor ? (
            <div
              key={openDoor.id}
              className={cn(
                "flex min-h-0 flex-col gap-2",
                paneOverride && "animate-[docs-pane-in-right_var(--duration-base)_var(--ease-standard)]",
              )}
            >
              <SidebarDoorPane door={openDoor} active={active} onNavigate={onNavigate} onBack={() => choosePane("root")}>
                <DoorNavGroups
                  doorId={openDoor.id}
                  referenceGroups={guideSections.reference}
                  blocks={blocks}
                  skills={skills}
                  skillConcerns={skillConcerns}
                  active={active}
                  onNavigate={onNavigate}
                />
              </SidebarDoorPane>
            </div>
          ) : (
            <div
              key="root"
              className={cn(
                "flex min-h-0 flex-col gap-2",
                paneOverride && "animate-[docs-pane-in-left_var(--duration-base)_var(--ease-standard)]",
              )}
            >
              {startGroup ? <StartCard steps={startGroup} active={active} onNavigate={onNavigate} /> : null}
              <SidebarDoorMenu doors={sidebarDoors} activeDoorId={activePane === "root" ? null : activePane} onOpen={choosePane} />
              <SidebarModeSelector mode={mode} hrefs={modeHrefs} onNavigate={onModeNavigate} />
              <CatalogNavGroups
                mode={mode}
                active={active}
                onNavigate={onNavigate}
                components={components}
                primitives={primitives}
                hooks={hooks}
                utils={utils}
                extensions={extensions}
              />
            </div>
          )}
        </SidebarContent>

        <SidebarFooter>
          <div className="grid gap-2">
            <GuideCtaLink guides={guides} active={active} onNavigate={onNavigate} />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href="https://github.com/damien-schneider/control-ui"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={githubLinkLabel}
                      onClick={closeMobile}
                    />
                  }
                  size="sm"
                  className="justify-between"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <HugeiconsIcon aria-hidden icon={GithubIcon} size={16} strokeWidth={1.7} />
                    <span>GitHub</span>
                  </span>
                  {formattedGitHubStars == null ? null : (
                    <span className="inline-flex shrink-0 items-center gap-1 font-mono text-caption tabular-nums">
                      <HugeiconsIcon aria-hidden icon={StarIcon} size={14} strokeWidth={1.7} />
                      {formattedGitHubStars}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
          </div>
        </SidebarFooter>
      </div>

      <SidebarRail resizable />
    </Sidebar>
  );
}
