"use client";

import { ChevronRightIcon, FolderIcon, HashIcon, LayersIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { useId, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/control-ui/ui/collapsible";
import { NativeSelect } from "@/components/control-ui/ui/native-select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  type SidebarSelectionIndicator,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";

const workspaceItems = [
  { title: "Agents", icon: SparklesIcon },
  { title: "Workflows", icon: LayersIcon },
  { title: "Tools", icon: HashIcon, disabled: true },
];
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
        <SidebarMenu indicator={indicator} aria-label="Workspace">
          {workspaceItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={active === item.title}
                aria-current={active === item.title ? "page" : undefined}
                onClick={() => onNavigate(item.title)}
                disabled={item.disabled}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
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
                        <SidebarMenuButton
                          size="sm"
                          isActive={active === title}
                          aria-current={active === title ? "page" : undefined}
                          onClick={() => onNavigate(title)}
                        >
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
}: {
  variant: "sidebar" | "floating" | "inset";
  indicator?: SidebarSelectionIndicator;
  nested: boolean;
}) {
  const [active, setActive] = useState(nested ? "Design system" : "Agents");
  const { setOpenMobile } = useSidebar();

  function navigate(page: string) {
    setActive(page);
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar variant={variant} collapsible="icon" className="h-full">
        <SidebarHeader>
          <div className="flex h-9 items-center gap-2 overflow-hidden px-1">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-(--radius-control) bg-primary text-label font-semibold text-primary-foreground">
              A
            </span>
            <span className="truncate font-medium group-data-[collapsible=icon]:hidden">Acme workspace</span>
          </div>
        </SidebarHeader>
        <WorkspaceNavigation active={active} onNavigate={navigate} indicator={indicator} nested={nested} />
        <SidebarFooter>
          <div className="flex items-center gap-2 overflow-hidden px-1 py-1 text-label text-muted-foreground">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium">JD</span>
            <span className="truncate group-data-[collapsible=icon]:hidden">Jamie Davis</span>
            <SidebarTrigger className="ml-auto lg:hidden" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <span className="truncate text-label font-medium">{active}</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5">
          <div>
            <p className="text-caption text-muted-foreground">Acme workspace</p>
            <h3 className="mt-1 text-heading-3 font-semibold">{active}</h3>
          </div>
          <div className="rounded-(--radius-panel) border border-border p-4">
            <p className="text-label font-medium">Your workspace, at a glance</p>
            <p className="mt-1 text-label text-muted-foreground">Browse your team’s agents, workflows, and projects from the sidebar.</p>
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
}: {
  variant?: "sidebar" | "floating" | "inset";
  label: string;
  nested?: boolean;
  controls?: boolean;
}) {
  const [indicator, setIndicator] = useState<SidebarSelectionIndicator>();
  const highlightId = useId();

  return (
    <fieldset aria-label={label} className="w-full min-w-0">
      {controls ? (
        <div className="mb-3 flex items-center justify-end gap-2 text-caption text-muted-foreground">
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
        </div>
      ) : null}
      <div className="relative isolate h-[30rem] w-full overflow-hidden rounded-(--radius-panel) border border-border bg-canvas [transform:translateZ(0)]">
        <SidebarProvider persistOpen={false} keyboardShortcut={null} className="min-h-0! h-full" style={{ "--sidebar-width": "14rem" }}>
          <Workspace variant={variant} indicator={indicator} nested={nested} />
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
