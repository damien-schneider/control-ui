"use client";

import { ChevronRightIcon, FolderIcon, HashIcon, LayersIcon, MoreHorizontalIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { useId, useState } from "react";
import type { SidebarLayout } from "@/components/control-ui/skin";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import { NativeSelect } from "@/components/control-ui/ui/native-select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
  type SidebarSelectionIndicator,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const workspaceItems = [
  { title: "Agents", icon: SparklesIcon, size: "default", disabled: false, unread: 3 },
  { title: "Workflows", icon: LayersIcon, size: "sm", disabled: false, unread: 12 },
  { title: "Tools", icon: HashIcon, size: "default", disabled: true, unread: 0 },
] as const;
const projectPages = ["Overview", "Design system", "API integration"];

function WorkspaceNavigation({
  active,
  onNavigate,
  indicator,
  nested,
}: {
  active: string;
  onNavigate: (page: string) => void;
  indicator?: SidebarSelectionIndicator;
  nested: boolean;
}) {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu indicator={indicator} aria-label="Workspace">
            {workspaceItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={active === item.title}
                  size={item.size}
                  onClick={() => onNavigate(item.title)}
                  disabled={item.disabled}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.unread ? (
                  <SidebarMenuBadge>
                    {item.unread}
                    <span className="sr-only"> unread</span>
                  </SidebarMenuBadge>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<SidebarMenuAction showOnHover />}
                    disabled={item.disabled}
                    aria-label={`${item.title} actions`}
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuItem onClick={() => onNavigate(`${item.title} settings`)}>Settings for {item.title}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
            {nested ? (
              <SidebarMenuItem>
                <Collapsible defaultOpen>
                  <SidebarMenuButton render={<CollapsibleTrigger />} tooltip="Projects">
                    <FolderIcon />
                    <span>Projects</span>
                    <ChevronRightIcon data-control-ui="sidebar" data-slot="chevron" />
                  </SidebarMenuButton>
                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub indicator={indicator} aria-label="Projects">
                      {projectPages.map((title) => (
                        <SidebarMenuItem key={title}>
                          <SidebarMenuButton size="sm" isActive={active === title} onClick={() => onNavigate(title)}>
                            <span>{title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ) : null}
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" isActive={active === "Settings"} onClick={() => onNavigate("Settings")} tooltip="Settings">
                <SettingsIcon />
                <span className="flex-1">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <Collapsible defaultOpen>
          <SidebarGroupLabel render={<CollapsibleTrigger />}>
            <span>Resources</span>
            <ChevronRightIcon data-control-ui="sidebar" data-slot="chevron" />
          </SidebarGroupLabel>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenu indicator={indicator} aria-label="Resources">
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="/get-started" />} tooltip="Documentation">
                  <LayersIcon />
                  <span>Documentation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </SidebarContent>
  );
}

function Workspace({
  variant,
  indicator,
  nested,
  resizable,
  side,
  collapsible,
}: {
  variant: SidebarLayout;
  resizable: boolean;
  side: "left" | "right";
  indicator?: SidebarSelectionIndicator;
  nested: boolean;
  collapsible: "icon" | "offcanvas" | "none";
}) {
  const [active, setActive] = useState(nested ? "Design system" : "Agents");
  const { setOpenMobile } = useSidebar();

  function navigate(page: string) {
    setActive(page);
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar variant={variant} side={side} collapsible={resizable ? "offcanvas" : collapsible} className="h-full">
        <SidebarHeader>
          <SidebarMenuButton size="lg" tooltip="Acme workspace" onClick={() => navigate("Overview")}>
            <Text
              aria-hidden="true"
              size="label"
              weight="semibold"
              className="flex size-7 shrink-0 items-center justify-center rounded-(--radius-control) bg-primary text-primary-foreground"
            >
              A
            </Text>
            <Text weight="medium">Acme workspace</Text>
          </SidebarMenuButton>
        </SidebarHeader>
        <WorkspaceNavigation active={active} onNavigate={navigate} indicator={indicator} nested={nested} />
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton size="lg" tooltip="Jamie Davis" />}>
              <Text
                aria-hidden="true"
                size="caption"
                weight="medium"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted"
              >
                JD
              </Text>
              <span>Jamie Davis</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="inline-end" align="end">
              <DropdownMenuItem onClick={() => navigate("Profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("Settings")}>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        {resizable ? <SidebarRail resizable /> : null}
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          {resizable || collapsible !== "none" ? <SidebarTrigger /> : null}
          <Text size="label" weight="medium" className="truncate">
            {active}
          </Text>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5">
          <div>
            <Text as="p" size="caption" tone="muted">
              Acme workspace
            </Text>
            <Heading level={3} className="mt-1">
              {active}
            </Heading>
          </div>
          <div className="rounded-(--radius-panel) border border-border p-4">
            <Text as="p" size="label" weight="medium">
              Your workspace, at a glance
            </Text>
            <Text as="p" size="label" tone="muted" className="mt-1">
              Browse your team’s agents, workflows, and projects from the sidebar.
            </Text>
          </div>
          <div className="min-h-0 overflow-x-auto rounded-(--radius-panel) border border-border">
            <div className="min-w-96 divide-y divide-border text-label">
              <div className="flex justify-between gap-8 px-4 py-3 text-muted-foreground">
                <span>Project</span>
                <span>Last updated</span>
              </div>
              <div className="flex justify-between gap-8 px-4 py-3">
                <span>Customer support</span>
                <span>Today</span>
              </div>
              <div className="flex justify-between gap-8 px-4 py-3">
                <span>Research assistant</span>
                <span>Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

function SidebarExample({
  variant = "sidebar",
  label,
  nested = false,
  controls = false,
  resizable = false,
  side = "left",
}: {
  variant?: SidebarLayout;
  label: string;
  nested?: boolean;
  controls?: boolean;
  resizable?: boolean;
  side?: "left" | "right";
}) {
  const [width, setWidth] = useState(280);
  const [indicator, setIndicator] = useState<SidebarSelectionIndicator>();
  const [layout, setLayout] = useState<SidebarLayout>();
  const [sidebarSide, setSidebarSide] = useState(side);
  const [collapsible, setCollapsible] = useState<"icon" | "offcanvas" | "none">("icon");
  const layoutId = useId();
  const highlightId = useId();
  const sideId = useId();
  const collapseId = useId();

  return (
    <fieldset aria-label={label} className="w-full min-w-0">
      {controls ? (
        <Text as="div" size="caption" tone="muted" className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <label htmlFor={layoutId} className="shrink-0">
            Layout
          </label>
          <div className="w-32">
            <NativeSelect
              id={layoutId}
              value={layout ?? variant}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "sidebar" || value === "floating" || value === "inset" || value === "page") setLayout(value);
              }}
            >
              <option value="sidebar">Sidebar</option>
              <option value="floating">Floating</option>
              <option value="inset">Inset</option>
              <option value="page">Page</option>
            </NativeSelect>
          </div>
          <label htmlFor={highlightId} className="shrink-0">
            Menu highlight
          </label>
          <div className="w-40">
            <NativeSelect
              id={highlightId}
              value={indicator ?? "skin"}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "none" || value === "slide" || value === "hover") setIndicator(value);
                else setIndicator(undefined);
              }}
            >
              <option value="skin">Skin default</option>
              <option value="none">Static</option>
              <option value="slide">Sliding selection</option>
              <option value="hover">Fluid hover</option>
            </NativeSelect>
          </div>
          <label htmlFor={sideId}>Side</label>
          <div className="w-24">
            <NativeSelect
              id={sideId}
              value={sidebarSide}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "left" || value === "right") setSidebarSide(value);
              }}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </NativeSelect>
          </div>
          <label htmlFor={collapseId}>Collapse</label>
          <div className="w-32">
            <NativeSelect
              id={collapseId}
              value={collapsible}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "icon" || value === "offcanvas" || value === "none") setCollapsible(value);
              }}
            >
              <option value="icon">Icon rail</option>
              <option value="offcanvas">Off-canvas</option>
              <option value="none">Fixed</option>
            </NativeSelect>
          </div>
        </Text>
      ) : null}
      <div className="relative isolate h-[30rem] w-full overflow-hidden rounded-(--radius-panel) border border-border bg-canvas [transform:translateZ(0)]">
        <SidebarProvider
          persistOpen={false}
          keyboardShortcut={null}
          width={resizable && side === "right" ? width : undefined}
          onWidthChange={resizable && side === "right" ? setWidth : undefined}
          className="min-h-0! h-full"
          style={{ "--sidebar-width": "14rem" }}
        >
          <Workspace
            variant={layout ?? variant}
            indicator={indicator}
            nested={nested}
            resizable={resizable}
            side={sidebarSide}
            collapsible={collapsible}
          />
        </SidebarProvider>
      </div>
    </fieldset>
  );
}

export function PrimitiveSidebarExample() {
  return <SidebarExample label="Sidebar" controls />;
}

export function PrimitiveSidebarNestedExample() {
  return <SidebarExample label="Nested navigation" nested />;
}

export function PrimitiveSidebarFloatingExample() {
  return <SidebarExample variant="floating" label="Floating" />;
}

export function PrimitiveSidebarInsetExample() {
  return <SidebarExample variant="inset" label="Inset" />;
}

export function PrimitiveSidebarResizableExample() {
  return <SidebarExample label="Resizable" resizable />;
}

export function PrimitiveSidebarRightExample() {
  return <SidebarExample label="Right sidebar" resizable side="right" />;
}
