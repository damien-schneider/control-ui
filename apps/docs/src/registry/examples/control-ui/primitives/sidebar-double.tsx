"use client";

import { BriefcaseIcon, InboxIcon, SettingsIcon, UsersIcon, WorkflowIcon } from "lucide-react";
import { useId, useState } from "react";
import type { SidebarLayout } from "@/components/control-ui/skin";
import { Avatar, AvatarFallback } from "@/components/control-ui/ui/avatar";
import { NativeSelect } from "@/components/control-ui/ui/native-select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarIconRail,
  type SidebarIconRailLayer,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarPanel,
  type SidebarPanelLayer,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const sections = [
  {
    title: "Opportunities",
    icon: BriefcaseIcon,
    groups: [
      {
        label: "Views",
        pages: [
          { title: "All", count: 0 },
          { title: "Archived", count: 0 },
        ],
      },
      {
        label: "Status",
        pages: [
          { title: "Open", count: 24 },
          { title: "Negotiation", count: 6 },
          { title: "Won", count: 0 },
          { title: "Lost", count: 0 },
        ],
      },
    ],
  },
  {
    title: "Automation",
    icon: WorkflowIcon,
    groups: [
      {
        label: "Automation",
        pages: [
          { title: "Overview", count: 0 },
          { title: "Workflows", count: 0 },
          { title: "Templates", count: 0 },
          { title: "Runs & logs", count: 3 },
          { title: "Analytics", count: 0 },
        ],
      },
    ],
  },
  {
    title: "Inbox",
    icon: InboxIcon,
    groups: [
      {
        label: "Inbox",
        pages: [
          { title: "Unread", count: 5 },
          { title: "Mentions", count: 0 },
          { title: "Done", count: 0 },
        ],
      },
    ],
  },
  {
    title: "Contacts",
    icon: UsersIcon,
    groups: [
      {
        label: "Contacts",
        pages: [
          { title: "People", count: 0 },
          { title: "Companies", count: 0 },
        ],
      },
    ],
  },
] as const;

type Section = (typeof sections)[number];

function DoubleSidebarWorkspace({
  variant,
  side,
  collapsible,
  railLayer,
  panelLayer,
  initialSection,
}: {
  variant: SidebarLayout;
  side: "left" | "right";
  collapsible: CollapseMode;
  railLayer: SidebarIconRailLayer;
  panelLayer: SidebarPanelLayer;
  initialSection: Section["title"];
}) {
  const [sectionTitle, setSectionTitle] = useState<Section["title"]>(initialSection);
  const section = sections.find((candidate) => candidate.title === sectionTitle) ?? sections[0];
  const [page, setPage] = useState<string>(section.groups[0].pages[0].title);
  const { setOpenMobile } = useSidebar();

  function openSection(next: Section) {
    setSectionTitle(next.title);
    setPage(next.groups[0].pages[0].title);
  }

  function openPage(title: string) {
    setPage(title);
    setOpenMobile(false);
  }

  return (
    <>
      <Sidebar variant={variant} side={side} collapsible={collapsible} className="h-full">
        <SidebarIconRail layer={railLayer}>
          <SidebarHeader>
            <SidebarMenuButton size="lg" tooltip="Acme workspace">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-(--radius-control) bg-primary text-primary-foreground"
              >
                <Text size="label" weight="semibold">
                  A
                </Text>
              </span>
              <span>Acme workspace</span>
            </SidebarMenuButton>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu aria-label="Sections">
                {sections.map((candidate) => (
                  <SidebarMenuItem key={candidate.title}>
                    <SidebarMenuButton isActive={candidate.title === section.title} onClick={() => openSection(candidate)}>
                      <candidate.icon />
                      <span>{candidate.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu aria-label="Account">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => openPage("Settings")}>
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Jamie Davis">
                  <Avatar aria-hidden="true" size="sm">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>Jamie Davis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </SidebarIconRail>
        <SidebarPanel layer={panelLayer}>
          <SidebarHeader>
            <div className="px-2 py-1.5">
              <Heading level={2} size="label">
                {section.title}
              </Heading>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {section.groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu aria-label={`${section.title} ${group.label}`}>
                    {group.pages.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton isActive={item.title === page} onClick={() => openPage(item.title)}>
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        {item.count ? <SidebarMenuBadge>{item.count}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </SidebarPanel>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <SidebarTrigger />
          <Text size="label" weight="medium" className="truncate">
            {section.title} / {page}
          </Text>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-5 pb-5">
          <Heading level={3}>{page}</Heading>
          <Text as="p" size="label" tone="muted">
            The icon rail switches sections; the panel lists the pages of the selected section.
          </Text>
        </div>
      </SidebarInset>
    </>
  );
}

function LayerSelect<Value extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Value;
  options: readonly Value[];
  onChange: (value: Value) => void;
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="shrink-0">
        {label}
      </label>
      <NativeSelect
        id={id}
        className="w-28"
        value={value}
        onChange={(event) => {
          const selected = options.find((option) => option === event.target.value);
          if (selected) onChange(selected);
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option[0].toUpperCase() + option.slice(1)}
          </option>
        ))}
      </NativeSelect>
    </>
  );
}

const layouts = ["sidebar", "floating", "inset", "page"] as const satisfies readonly SidebarLayout[];
const railLayers = ["sidebar", "raised"] as const satisfies readonly SidebarIconRailLayer[];
const panelLayers = ["sidebar", "raised", "content"] as const satisfies readonly SidebarPanelLayer[];
const sides = ["left", "right"] as const;
const collapseModes = ["icon", "offcanvas", "none"] as const;
type CollapseMode = (typeof collapseModes)[number];

function DoubleSidebarExample({
  label,
  railLayer: initialRailLayer,
  panelLayer: initialPanelLayer,
  initialSection,
  controls = false,
}: {
  label: string;
  railLayer: SidebarIconRailLayer;
  panelLayer: SidebarPanelLayer;
  initialSection: Section["title"];
  controls?: boolean;
}) {
  const [variant, setVariant] = useState<SidebarLayout>("inset");
  const [railLayer, setRailLayer] = useState(initialRailLayer);
  const [panelLayer, setPanelLayer] = useState(initialPanelLayer);
  const [side, setSide] = useState<"left" | "right">("left");
  const [collapsible, setCollapsible] = useState<CollapseMode>("icon");

  return (
    <fieldset aria-label={label} className="w-full min-w-0">
      {controls ? (
        <Text as="div" size="caption" tone="muted" className="mb-3 flex flex-wrap items-center justify-end gap-2">
          <LayerSelect label="Layout" value={variant} options={layouts} onChange={setVariant} />
          <LayerSelect label="Rail layer" value={railLayer} options={railLayers} onChange={setRailLayer} />
          <LayerSelect label="Panel layer" value={panelLayer} options={panelLayers} onChange={setPanelLayer} />
          <LayerSelect label="Side" value={side} options={sides} onChange={setSide} />
          <LayerSelect label="Collapse" value={collapsible} options={collapseModes} onChange={setCollapsible} />
        </Text>
      ) : null}
      <div className="relative isolate h-[30rem] w-full overflow-hidden rounded-(--radius-panel) border border-border bg-canvas [transform:translateZ(0)]">
        <SidebarProvider persistOpen={false} keyboardShortcut={null} layout="contained" style={{ "--sidebar-width": "17rem" }}>
          <DoubleSidebarWorkspace
            variant={variant}
            side={side}
            collapsible={collapsible}
            railLayer={railLayer}
            panelLayer={panelLayer}
            initialSection={initialSection}
          />
        </SidebarProvider>
      </div>
    </fieldset>
  );
}

export function PrimitiveSidebarDoubleExample() {
  return <DoubleSidebarExample label="Double sidebar" railLayer="raised" panelLayer="sidebar" initialSection="Opportunities" controls />;
}

export function PrimitiveSidebarDoubleContentExample() {
  return (
    <DoubleSidebarExample label="Double sidebar joined to content" railLayer="sidebar" panelLayer="content" initialSection="Automation" />
  );
}
