"use client";

import { ArrowLeftIcon, SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/control-ui/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import {
  type SettingDefinition,
  type SettingsControlProps,
  type SettingsPageDefinition,
  type SettingsSearchResult,
  searchSettings,
} from "./settings-data";

export type { SettingDefinition, SettingsControlProps, SettingsPageDefinition, SettingsSectionDefinition } from "./settings-data";

export type SettingsBlockProps = Omit<ComponentProps<"div">, "children"> & {
  pages: readonly SettingsPageDefinition[];
  activePageId?: string;
  defaultActivePageId?: string;
  onActivePageChange?: (pageId: string) => void;
  backAction?: ReactNode;
  searchPlaceholder?: string;
  layout?: "viewport" | "contained";
};

type PendingTarget = {
  pageId: string;
  rowId: string;
  controlId: string;
};

export function SettingsBlock({
  pages,
  activePageId,
  defaultActivePageId,
  onActivePageChange,
  backAction,
  searchPlaceholder = "Search settings",
  layout = "viewport",
  className,
  style,
  ...props
}: SettingsBlockProps) {
  const [internalPageId, setInternalPageId] = useState(defaultActivePageId ?? pages[0]?.id);
  const [query, setQuery] = useState("");
  const [pendingTarget, setPendingTarget] = useState<PendingTarget | null>(null);
  const instanceId = useId();
  const requestedPageId = activePageId ?? internalPageId;
  const currentPage = pages.find((page) => page.id === requestedPageId) ?? pages[0];
  const results = searchSettings(pages, query);

  function changePage(pageId: string) {
    if (activePageId === undefined) setInternalPageId(pageId);
    onActivePageChange?.(pageId);
  }

  return (
    <SidebarProvider
      data-settings-layout={layout}
      className={cn(
        "overflow-hidden bg-background text-foreground",
        layout === "viewport" ? "h-svh min-h-svh" : "relative h-full min-h-0",
        className,
      )}
      style={{ "--sidebar-width": "15.5rem", ...style } as CSSProperties}
      {...props}
    >
      <SettingsShell
        pages={pages}
        currentPage={currentPage}
        query={query}
        results={results}
        backAction={backAction}
        searchPlaceholder={searchPlaceholder}
        contained={layout === "contained"}
        instanceId={instanceId}
        pendingTarget={pendingTarget}
        onPendingTargetChange={setPendingTarget}
        onPageChange={changePage}
        onQueryChange={setQuery}
      />
    </SidebarProvider>
  );
}

function SettingsShell({
  pages,
  currentPage,
  query,
  results,
  backAction,
  searchPlaceholder,
  contained,
  instanceId,
  pendingTarget,
  onPendingTargetChange,
  onPageChange,
  onQueryChange,
}: {
  pages: readonly SettingsPageDefinition[];
  currentPage?: SettingsPageDefinition;
  query: string;
  results: readonly SettingsSearchResult[];
  backAction?: ReactNode;
  searchPlaceholder: string;
  contained: boolean;
  instanceId: string;
  pendingTarget: PendingTarget | null;
  onPendingTargetChange: (target: PendingTarget | null) => void;
  onPageChange: (pageId: string) => void;
  onQueryChange: (query: string) => void;
}) {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    if (!pendingTarget || currentPage?.id !== pendingTarget.pageId) return;

    const frame = requestAnimationFrame(() => {
      const row = document.getElementById(pendingTarget.rowId);
      const control = document.getElementById(pendingTarget.controlId);
      row?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      (control instanceof HTMLElement ? control : row)?.focus({ preventScroll: true });
      onPendingTargetChange(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [currentPage?.id, onPendingTargetChange, pendingTarget]);

  function navigate(pageId: string) {
    onPageChange(pageId);
    setOpenMobile(false);
  }

  function openResult(result: SettingsSearchResult) {
    const ids = settingDomIds(instanceId, result.page.id, result.section.id, result.setting.id);
    onPendingTargetChange({ pageId: result.page.id, rowId: ids.row, controlId: ids.control });
    navigate(result.page.id);
  }

  return (
    <>
      <Sidebar collapsible="offcanvas" className={contained ? "absolute! inset-y-0! h-full" : undefined}>
        <SidebarHeader className="gap-3 border-b border-sidebar-border p-3">
          {backAction ? <div className="min-w-0">{backAction}</div> : null}
          <SettingsSearch value={query} placeholder={searchPlaceholder} onValueChange={onQueryChange} />
        </SidebarHeader>
        <SidebarContent>
          {query.trim() ? (
            <SettingsSearchNavigation results={results} onSelect={openResult} />
          ) : (
            <SettingsPageNavigation pages={pages} activePageId={currentPage?.id} onSelect={navigate} />
          )}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="h-full min-h-0 min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
          <SidebarTrigger />
          <span className="truncate text-label font-medium">{currentPage?.title ?? "Settings"}</span>
        </header>
        <ScrollArea className="min-h-0 flex-1" lockAxis="x">
          {currentPage ? (
            <SettingsPage page={currentPage} instanceId={instanceId} />
          ) : (
            <SettingsEmpty title="No settings" description="Add a settings page to populate this space." />
          )}
        </ScrollArea>
      </SidebarInset>
    </>
  );
}

function SettingsSearch({
  value,
  placeholder,
  onValueChange,
}: {
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <InputGroup size="sm">
      <InputGroupAddon className="pl-2.5">
        <SearchIcon className="size-3.5" aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
      {value ? (
        <Button variant="ghost" size="xs" iconOnly aria-label="Clear settings search" className="mr-1" onClick={() => onValueChange("")}>
          <XIcon className="size-3.5" />
        </Button>
      ) : null}
    </InputGroup>
  );
}

function SettingsPageNavigation({
  pages,
  activePageId,
  onSelect,
}: {
  pages: readonly SettingsPageDefinition[];
  activePageId?: string;
  onSelect: (pageId: string) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarMenu>
        {pages.map((page) => (
          <SidebarMenuItem key={page.id}>
            <SidebarMenuButton size="sm" isActive={page.id === activePageId} onClick={() => onSelect(page.id)}>
              {page.icon}
              <span>{page.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SettingsSearchNavigation({
  results,
  onSelect,
}: {
  results: readonly SettingsSearchResult[];
  onSelect: (result: SettingsSearchResult) => void;
}) {
  if (results.length === 0) {
    return <SettingsEmpty title="No matching settings" description="Try another name or keyword." />;
  }

  const groups = new Map<string, { page: SettingsPageDefinition; results: SettingsSearchResult[] }>();
  for (const result of results) {
    const group = groups.get(result.page.id) ?? { page: result.page, results: [] };
    group.results.push(result);
    groups.set(result.page.id, group);
  }

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "setting" : "settings"} found
      </span>
      {[...groups.values()].map((group) => (
        <SidebarGroup key={group.page.id}>
          <SidebarGroupLabel>
            {group.page.icon}
            <span>{group.page.title}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.results.map((result) => (
              <SidebarMenuItem key={`${result.section.id}/${result.setting.id}`}>
                <SidebarMenuButton size="sm" className="h-auto min-h-[var(--control-h-sm)] py-1.5" onClick={() => onSelect(result)}>
                  <span>{result.setting.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function SettingsPage({ page, instanceId }: { page: SettingsPageDefinition; instanceId: string }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 md:px-10 md:py-12">
      <h1 className="text-heading font-semibold text-foreground text-balance">{page.title}</h1>
      {page.sections.map((section) => (
        <FieldSet key={section.id} className="gap-3">
          <FieldLegend className="text-body font-semibold">{section.title}</FieldLegend>
          <FieldGroup className="gap-0 overflow-hidden rounded-[var(--radius-lg)] border bg-card">
            {section.settings.map((setting, index) => (
              <SettingsRow
                key={setting.id}
                pageId={page.id}
                sectionId={section.id}
                setting={setting}
                instanceId={instanceId}
                separated={index > 0}
              />
            ))}
          </FieldGroup>
        </FieldSet>
      ))}
    </div>
  );
}

function SettingsRow({
  pageId,
  sectionId,
  setting,
  instanceId,
  separated,
}: {
  pageId: string;
  sectionId: string;
  setting: SettingDefinition;
  instanceId: string;
  separated: boolean;
}) {
  const ids = settingDomIds(instanceId, pageId, sectionId, setting.id);
  const controlProps: SettingsControlProps = {
    id: ids.control,
    "aria-labelledby": ids.label,
    "aria-describedby": setting.description ? ids.description : undefined,
  };

  return (
    <>
      {separated ? <FieldSeparator /> : null}
      <Field
        id={ids.row}
        orientation="responsive"
        tabIndex={-1}
        className="scroll-m-8 gap-3 p-4 outline-none transition-colors duration-[var(--duration-fast)] focus:bg-foreground/4 focus-within:bg-foreground/4"
      >
        <FieldContent>
          <FieldLabel id={ids.label} htmlFor={ids.control} className="leading-snug">
            {setting.title}
          </FieldLabel>
          {setting.description ? <FieldDescription id={ids.description}>{setting.description}</FieldDescription> : null}
        </FieldContent>
        <div className="flex shrink-0 items-center">{setting.renderControl(controlProps)}</div>
      </Field>
    </>
  );
}

function SettingsEmpty({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="min-h-40 gap-3 p-4">
      <EmptyHeader>
        <EmptyMedia className="mb-0 size-8">
          <SearchIcon className="size-4" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function settingDomIds(instanceId: string, pageId: string, sectionId: string, settingId: string) {
  const base = [instanceId, pageId, sectionId, settingId].map((value) => value.replace(/[^a-zA-Z0-9_-]/g, "-")).join("-");
  return {
    row: `${base}-row`,
    control: `${base}-control`,
    label: `${base}-label`,
    description: `${base}-description`,
  };
}

export function SettingsBackAction({
  children = "Back to app",
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & { children?: ReactNode }) {
  return (
    <Button variant="quiet" size="sm" className="-ml-1 justify-start gap-2" {...props}>
      <ArrowLeftIcon className="size-4" />
      {children}
    </Button>
  );
}
