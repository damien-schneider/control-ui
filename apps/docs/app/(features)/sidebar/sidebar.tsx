"use client";

import { GithubIcon, PlusSignIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import { type RefObject, useState } from "react";
import { referenceGroupTitle } from "@/app/(features)/catalog/guides";
import type { ActivePageId, GuidePage } from "@/app/(features)/model/types";
import { DocsSidebarResizeHandle } from "@/app/(features)/sidebar/resize-handle";
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
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { ControlUiLogo } from "./control-ui-logo";
import { primitiveCategorySidebarIcons, referenceGroupIcon, sidebarGroupIcons, useCaseKindSidebarIcons } from "./icons";
import { SidebarModeSelector } from "./mode-selector";
import { DocsNavGroup, ReferenceDoorRow, ReferencePane, SkillConcernNavGroups } from "./nav-groups";
import {
  agentNavItems,
  ctaGuide,
  extensionNavItems,
  getUseCaseNavGroups,
  guideNavSections,
  hookNavItems,
  primitiveNavGroups,
  utilNavItems,
} from "./nav-items";
import { SidebarSetupControls, type SidebarSetupControlsScope } from "./setup-controls";
import { StartCard } from "./start-card";
import type { DocsSidebarContentProps, SidebarMode } from "./types";
import { useSidebarNavigation } from "./use-sidebar-navigation";

function setupControlsScopeForKind(kind: string | undefined): SidebarSetupControlsScope {
  if (kind === "Agent") return "ai";
  return "none";
}

const githubStarsFormatter = new Intl.NumberFormat("en-US");

type DocsSidebarProps = DocsSidebarContentProps & {
  initialSidebarWidth: number | null;
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
  resizeHandleRef: RefObject<HTMLDivElement | null>;
  sidebarContainerRef: RefObject<HTMLDivElement | null>;
  sidebarNavigationRef: RefObject<HTMLDivElement | null>;
  sidebarWrapperRef: RefObject<HTMLDivElement | null>;
};

function sidebarNavigationInert(isMobile: boolean, state: "expanded" | "collapsed"): true | undefined {
  return !isMobile && state === "collapsed" ? true : undefined;
}

function GuideCtaLink({ guides, active, onNavigate }: { guides: GuidePage[]; active: ActivePageId; onNavigate: () => void }) {
  const cta = ctaGuide(guides);
  if (!cta) return null;

  return (
    <ButtonLink
      render={<Link href={`/${cta.id}`} onClick={onNavigate} aria-current={active === cta.id ? "page" : undefined} />}
      variant="solid"
      tone="primary"
      size="xs"
    >
      <HugeiconsIcon aria-hidden icon={PlusSignIcon} strokeWidth={2} />
      {cta.name}
    </ButtonLink>
  );
}

type CatalogNavGroupsProps = Pick<
  DocsSidebarContentProps,
  "skills" | "skillConcerns" | "components" | "blocks" | "primitives" | "hooks" | "utils" | "extensions"
> & {
  mode: SidebarMode;
  active: ActivePageId;
  onNavigate: () => void;
};

function CatalogNavGroups({
  mode,
  active,
  onNavigate,
  skills,
  skillConcerns,
  components,
  blocks,
  primitives,
  hooks,
  utils,
  extensions,
}: CatalogNavGroupsProps) {
  if (mode === "skills") return <SkillConcernNavGroups concerns={skillConcerns} skills={skills} active={active} onNavigate={onNavigate} />;

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

  if (mode === "use-cases")
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
  initialSidebarWidth,
  lastSectionMode,
  onLastSectionModeChange,
  resizeHandleRef,
  sidebarContainerRef,
  sidebarNavigationRef,
  sidebarWrapperRef,
  updateSetupPreference,
}: DocsSidebarProps) {
  const { activeItem, mode, modeHrefs, closeMobile, onNavigate, onModeNavigate } = useSidebarNavigation({
    active,
    searchItems,
    skills,
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
  const agentGroup = guideSections.top.find((group) => group.id === "agents");
  const isInsideReference =
    active === "reference" || guideSections.reference.some((group) => group.items.some((item) => item.id === active));
  const [paneOverride, setPaneOverride] = useState<"root" | "reference" | null>(null);
  const pane = paneOverride ?? (isInsideReference ? "reference" : "root");

  function handleNavigate() {
    setPaneOverride(null);
    onNavigate();
  }

  function handleModeNavigate(nextMode: SidebarMode) {
    setPaneOverride(null);
    onModeNavigate(nextMode);
  }

  const { isMobile, state } = useSidebar();

  return (
    <Sidebar
      ref={sidebarContainerRef}
      collapsible="offcanvas"
      className="group-data-[side=left]:border-r-0 group-data-[side=right]:border-l-0"
    >
      <div
        ref={sidebarNavigationRef}
        data-docs-sidebar-navigation=""
        className="flex min-h-0 flex-1 flex-col"
        inert={sidebarNavigationInert(isMobile, state)}
      >
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex min-w-0 items-center gap-1.5">
              <ControlUiLogo />
              <span className="block truncate font-display text-body-lg font-medium leading-none tracking-tight text-sidebar-foreground">
                control/ui
              </span>
              <Badge size="sm" className="absolute -top-1 left-full ml-1">
                alpha
              </Badge>
            </div>
            <GuideCtaLink guides={guides} active={active} onNavigate={onNavigate} />
          </div>
        </SidebarHeader>
        <SidebarModeSelector mode={mode} hrefs={modeHrefs} onNavigate={handleModeNavigate} />
        <SidebarSetupControls integration={integration} scope={setupControlsScope} updateSetupPreference={updateSetupPreference} />

        <SidebarContent>
          {pane === "reference" ? (
            <div
              key="reference"
              className={cn(
                "flex min-h-0 flex-col gap-2",
                paneOverride && "animate-[docs-pane-in-right_var(--duration-base)_var(--ease-standard)]",
              )}
            >
              <ReferencePane
                title={referenceGroupTitle}
                groups={guideSections.reference}
                active={active}
                onNavigate={handleNavigate}
                onBack={() => setPaneOverride("root")}
              />
            </div>
          ) : (
            <div
              key="root"
              className={cn(
                "flex min-h-0 flex-col gap-2",
                paneOverride && "animate-[docs-pane-in-left_var(--duration-base)_var(--ease-standard)]",
              )}
            >
              {startGroup && agentGroup ? (
                <StartCard steps={startGroup} agent={agentGroup} active={active} onNavigate={handleNavigate} />
              ) : null}
              <ReferenceDoorRow
                title={referenceGroupTitle}
                icon={referenceGroupIcon}
                isInside={isInsideReference}
                onOpen={() => setPaneOverride("reference")}
              />
              <CatalogNavGroups
                mode={mode}
                active={active}
                onNavigate={handleNavigate}
                skills={skills}
                skillConcerns={skillConcerns}
                components={components}
                blocks={blocks}
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

      <DocsSidebarResizeHandle resizeHandleRef={resizeHandleRef} initialWidth={initialSidebarWidth} sidebarWrapperRef={sidebarWrapperRef} />
    </Sidebar>
  );
}
