"use client";

import { GithubIcon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import Link from "next/link";
import type { RefObject } from "react";
import { useEffect, useId, useRef } from "react";
import { skinsOverview } from "@/app/(features)/catalog/skins";
import type { ActivePageId, GuidePage } from "@/app/(features)/model/types";
import { DocsSidebarResizeHandle } from "@/app/(features)/sidebar/resize-handle";
import { Badge } from "@/components/control-ui/ui/badge";
import { ButtonLink } from "@/components/control-ui/ui/button";
import { MorphingPanel, MorphingPanelContent } from "@/components/control-ui/ui/morphing-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { ThemeDrawerTrigger, ThemeEditorContent } from "@/components/theme-drawer/theme-drawer";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import { ThemeModeSwitch } from "@/components/theme-toggle";
import { ControlUiLogo } from "./control-ui-logo";
import { primitiveCategorySidebarIcons, sidebarGroupIcons, useCaseKindSidebarIcons } from "./icons";
import { SidebarModeSelector } from "./mode-selector";
import { DocsNavGroup, SkillConcernNavGroups } from "./nav-groups";
import {
  agentNavItems,
  ctaGuide,
  extensionNavItems,
  getUseCaseNavGroups,
  guideNavItems,
  hookNavItems,
  primitiveNavGroups,
  sidebarModeForActivePage,
  utilNavItems,
} from "./nav-items";
import { SidebarSearch } from "./search";
import { SidebarSetupControls, type SidebarSetupControlsScope } from "./setup-controls";
import type { DocsSidebarContentProps, SidebarMode } from "./types";

function setupControlsScopeForKind(kind: string | undefined): SidebarSetupControlsScope {
  if (kind === "Agent") return "ai";
  return "none";
}

const skinOverviewNavItems = [{ id: skinsOverview.id, name: skinsOverview.label }];
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
      className="w-full"
    >
      {cta.name}
    </ButtonLink>
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
  const activeItem = searchItems.find((item) => item.id === active);
  const onSectionPage = activeItem != null && activeItem.kind !== "Guide" && activeItem.kind !== "Skin";
  const setupControlsScope = setupControlsScopeForKind(activeItem?.kind);
  const routeMode = sidebarModeForActivePage(active, searchItems);
  const mode = onSectionPage ? routeMode : (lastSectionMode ?? routeMode);
  const formattedGitHubStars = githubStars == null ? null : githubStarsFormatter.format(githubStars);
  const githubLinkLabel =
    formattedGitHubStars == null
      ? "Control UI on GitHub"
      : `Control UI on GitHub, ${formattedGitHubStars} ${githubStars === 1 ? "star" : "stars"}`;
  const modeHrefs: Record<SidebarMode, string> = {
    agents: "/ai",
    primitives: "/primitives",
    "use-cases": "/use-cases",
    skills: skills[0] ? `/skills/${skills[0].id}` : "/skills",
  };
  const caseNavigationGroups = getUseCaseNavGroups(blocks);
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { open: themeEditorOpen, setOpen: setThemeEditorOpen } = useThemeDrawer();
  const themeEditorTitleId = useId();
  const themeEditorDescriptionId = useId();
  const themeEditorRef = useRef<HTMLDivElement>(null);
  const themeDrawerTriggerRef = useRef<HTMLButtonElement>(null);
  const themeEditorWasOpen = useRef(false);

  // editor replaces toolbar — no native focus return
  useEffect(() => {
    if (themeEditorOpen) {
      themeEditorWasOpen.current = true;
      themeEditorRef.current?.focus();
      return;
    }
    if (!themeEditorWasOpen.current) return;
    themeEditorWasOpen.current = false;
    themeDrawerTriggerRef.current?.focus();
  }, [themeEditorOpen]);

  useEffect(() => {
    if (!themeEditorOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setThemeEditorOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [themeEditorOpen, setThemeEditorOpen]);
  function closeMobile() {
    if (isMobile) setOpenMobile(false);
  }
  function onNavigate() {
    if (onSectionPage) onLastSectionModeChange(routeMode);
    closeMobile();
  }
  function onModeNavigate(nextMode: SidebarMode) {
    onLastSectionModeChange(nextMode);
    closeMobile();
  }

  return (
    <>
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
            <div className="grid gap-1">
              <div className="flex items-center gap-1.5">
                <ControlUiLogo />
                <span className="block truncate font-display text-body-lg font-medium leading-none tracking-tight text-sidebar-foreground">
                  control/ui
                </span>
                <Badge variant="secondary" size="sm">
                  alpha
                </Badge>
              </div>
              <p className="text-balance text-caption leading-relaxed text-muted-foreground">
                An opinionated, customizable superset of shadcn/ui
              </p>
            </div>
            <GuideCtaLink guides={guides} active={active} onNavigate={onNavigate} />
            <div className="grid gap-3">
              <SidebarSetupControls integration={integration} scope={setupControlsScope} updateSetupPreference={updateSetupPreference} />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <DocsNavGroup
              title="Guides"
              icon={sidebarGroupIcons.guides}
              items={guideNavItems(guides)}
              active={active}
              prefix="/"
              onNavigate={onNavigate}
            />
            <DocsNavGroup
              title="Skins"
              icon={sidebarGroupIcons.skins}
              items={skinOverviewNavItems}
              active={active}
              prefix="/"
              onNavigate={onNavigate}
            />
            {mode === "skills" ? (
              <SkillConcernNavGroups concerns={skillConcerns} skills={skills} active={active} onNavigate={onNavigate} />
            ) : null}
            {mode === "agents" ? (
              <DocsNavGroup
                title="Agents"
                icon={sidebarGroupIcons.agents}
                items={agentNavItems(components)}
                active={active}
                prefix="/ai/"
                onNavigate={onNavigate}
              />
            ) : null}
            {mode === "use-cases"
              ? caseNavigationGroups.map((group) => (
                  <DocsNavGroup
                    key={group.id}
                    title={group.title}
                    icon={useCaseKindSidebarIcons[group.kind]}
                    items={group.items}
                    active={active}
                    prefix="/use-cases/"
                    onNavigate={onNavigate}
                  />
                ))
              : null}
            {mode === "primitives" ? (
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
            ) : null}
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

        <DocsSidebarResizeHandle
          resizeHandleRef={resizeHandleRef}
          initialWidth={initialSidebarWidth}
          sidebarWrapperRef={sidebarWrapperRef}
        />
      </Sidebar>

      <MorphingPanel
        open={themeEditorOpen}
        onOpenChange={(nextOpen) => setThemeEditorOpen(nextOpen)}
        collapsedSize={{ width: "var(--floating-toolbar-width)", height: "var(--floating-toolbar-height)" }}
        expandedSize={{
          width: "calc(100vw - 1rem)",
          height: "calc(100dvh - var(--floating-toolbar-top) - var(--floating-toolbar-bottom))",
        }}
        data-docs-floating-panel=""
        className="group/floating-panel fixed bottom-(--floating-toolbar-bottom) left-1/2 z-40 max-w-[calc(100vw-1rem)] -translate-x-1/2 overflow-visible data-[state=open]:z-50 [--floating-toolbar-bottom:max(0.75rem,env(safe-area-inset-bottom))] [--floating-toolbar-height:calc(var(--control-h-sm)_+_2_*_var(--toolbar-padding,0.25rem)_+_2px)] [--floating-toolbar-rest-width:19rem] [--floating-toolbar-search-width:21rem] [--floating-toolbar-top:max(0.5rem,env(safe-area-inset-top))] [--floating-toolbar-width:var(--floating-toolbar-rest-width)] has-[input:focus]:[--floating-toolbar-width:var(--floating-toolbar-search-width)] data-[state=closed]:bg-transparent data-[state=closed]:shadow-none data-[state=closed]:ring-0 sm:[--floating-toolbar-rest-width:24rem] sm:[--floating-toolbar-search-width:26rem] sm:[--toolbar-padding:0.375rem] lg:top-(--floating-toolbar-top) lg:bottom-auto"
      >
        <Toolbar
          aria-label="Documentation controls"
          data-docs-floating-toolbar=""
          variant="inverse"
          inert={themeEditorOpen || undefined}
          className="absolute inset-0 size-full transition-[opacity,filter,gap] duration-[var(--duration-base)] ease-[var(--ease-standard)] has-[input:focus]:gap-0 group-data-[state=open]/floating-panel:pointer-events-none group-data-[state=open]/floating-panel:opacity-0 group-data-[state=open]/floating-panel:blur-sm"
        >
          <SidebarSearch items={searchItems} onNavigate={onNavigate} />
          <ToolbarGroup className="min-w-0 flex-[1_1_100%] justify-center overflow-hidden opacity-100 transition-[flex-basis,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)] peer-focus-within:pointer-events-none peer-focus-within:flex-[0_1_0%] peer-focus-within:opacity-0">
            <SidebarTrigger render={<ToolbarButton iconOnly />} className="lg:hidden" />
            <ToolbarSeparator className="h-5 self-auto" />
            <SidebarModeSelector mode={mode} hrefs={modeHrefs} onNavigate={onModeNavigate} />
            <ToolbarSeparator className="h-5 self-auto" />
            <ThemeDrawerTrigger render={<ToolbarButton ref={themeDrawerTriggerRef} iconOnly />} iconOnly onToggle={closeMobile} />
          </ToolbarGroup>
        </Toolbar>

        <MorphingPanelContent
          ref={themeEditorRef}
          tabIndex={-1}
          role="region"
          aria-labelledby={themeEditorTitleId}
          aria-describedby={themeEditorDescriptionId}
        >
          <ThemeEditorContent labelledById={themeEditorTitleId} describedById={themeEditorDescriptionId} />
        </MorphingPanelContent>
      </MorphingPanel>
    </>
  );
}
