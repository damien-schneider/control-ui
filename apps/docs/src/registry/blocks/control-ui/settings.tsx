"use client";

import { ArrowLeftIcon, SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { prefersReducedMotion } from "@/components/control-ui/lib/motion";
import { Button } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/control-ui/ui/field";
import { Input } from "@/components/control-ui/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
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
  type SidebarProviderProps,
  SidebarRail,
  type SidebarStyle,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import {
  type SettingDefinition,
  type SettingsControlProps,
  type SettingsPageDefinition,
  type SettingsSearchResult,
  searchSettings,
} from "./settings-data";

export type { SettingDefinition, SettingsControlProps, SettingsPageDefinition, SettingsSectionDefinition } from "./settings-data";

export type SettingsBlockProps = Omit<ComponentProps<"div">, "children"> &
  Pick<SidebarProviderProps, "persistOpen" | "keyboardShortcut"> & {
    pages: readonly SettingsPageDefinition[];
    activePageId?: string;
    defaultActivePageId?: string;
    onActivePageChange?: (pageId: string) => void;
    backAction?: ReactNode;
    searchPlaceholder?: string;
    searchLabel?: string;
    clearSearchLabel?: string;
    searchStatusLabel?: (count: number) => string;
    noResultsDescription?: string;
    navigationLabel?: string;
    noPagesTitle?: string;
    noPagesDescription?: string;
    layout?: "viewport" | "contained";
  };

type PendingTarget = {
  pageId: string;
  rowId: string;
  controlId: string;
};

function defaultSearchStatusLabel(count: number) {
  if (count === 0) return "No matching settings";
  return `${count} ${count === 1 ? "setting" : "settings"} found`;
}

export function SettingsBlock({
  pages,
  activePageId,
  defaultActivePageId,
  onActivePageChange,
  backAction,
  searchPlaceholder = "Search settings",
  searchLabel = "Search settings",
  clearSearchLabel = "Clear search",
  searchStatusLabel = defaultSearchStatusLabel,
  noResultsDescription = "Try another name or keyword.",
  navigationLabel = "Settings",
  noPagesTitle = "No settings",
  noPagesDescription = "Add a settings page to populate this space.",
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

  const providerStyle: SidebarStyle = { "--sidebar-width": "15.5rem", ...style };

  return (
    <SidebarProvider
      layout={layout}
      surface="background"
      className={cn(layout === "viewport" && "h-svh overflow-hidden", className)}
      style={providerStyle}
      {...props}
    >
      <SettingsShell
        pages={pages}
        currentPage={currentPage}
        query={query}
        results={results}
        backAction={backAction}
        searchPlaceholder={searchPlaceholder}
        searchLabel={searchLabel}
        clearSearchLabel={clearSearchLabel}
        searchStatus={query.trim() ? searchStatusLabel(results.length) : ""}
        noResultsDescription={noResultsDescription}
        navigationLabel={navigationLabel}
        noPagesTitle={noPagesTitle}
        noPagesDescription={noPagesDescription}
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
  searchLabel,
  clearSearchLabel,
  searchStatus,
  noResultsDescription,
  navigationLabel,
  noPagesTitle,
  noPagesDescription,
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
  searchLabel: string;
  clearSearchLabel: string;
  searchStatus: string;
  noResultsDescription: string;
  navigationLabel: string;
  noPagesTitle: string;
  noPagesDescription: string;
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
      row?.scrollIntoView({ block: "center", behavior: prefersReducedMotion(row) ? "auto" : "smooth" });
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

  const trimmedQuery = query.trim();

  return (
    <>
      <LiveStatus message={searchStatus} />
      <Sidebar collapsible="offcanvas">
        <SidebarHeader divider className="gap-3">
          {backAction ? <div className="min-w-0">{backAction}</div> : null}
          <SettingsSearch
            value={query}
            label={searchLabel}
            clearLabel={clearSearchLabel}
            placeholder={searchPlaceholder}
            onValueChange={onQueryChange}
          />
        </SidebarHeader>
        <SidebarContent>
          {trimmedQuery ? (
            <SettingsSearchNavigation
              results={results}
              emptyTitle={searchStatus}
              emptyDescription={noResultsDescription}
              clearLabel={clearSearchLabel}
              onSelect={openResult}
              onClear={() => onQueryChange("")}
            />
          ) : (
            <SettingsPageNavigation label={navigationLabel} pages={pages} activePageId={currentPage?.id} onSelect={navigate} />
          )}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="h-full min-h-0 min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 sidebar:hidden">
          <SidebarTrigger />
          <Text size="label" weight="medium" className="truncate" title={currentPage?.title}>
            {currentPage?.title ?? navigationLabel}
          </Text>
        </header>
        <ScrollArea className="min-h-0 flex-1" lockAxis="x">
          {currentPage ? (
            <SettingsPage page={currentPage} instanceId={instanceId} />
          ) : (
            <SettingsEmpty title={noPagesTitle} description={noPagesDescription} />
          )}
        </ScrollArea>
      </SidebarInset>
    </>
  );
}

function SettingsSearch({
  value,
  label,
  clearLabel,
  placeholder,
  onValueChange,
}: {
  value: string;
  label: string;
  clearLabel: string;
  placeholder: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <InputGroup size="sm">
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
      />
      {value ? (
        <Button variant="ghost" size="xs" iconOnly aria-label={clearLabel} className="me-1" onClick={() => onValueChange("")}>
          <XIcon aria-hidden="true" />
        </Button>
      ) : null}
    </InputGroup>
  );
}

function SettingsPageNavigation({
  label,
  pages,
  activePageId,
  onSelect,
}: {
  label: string;
  pages: readonly SettingsPageDefinition[];
  activePageId?: string;
  onSelect: (pageId: string) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
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
  emptyTitle,
  emptyDescription,
  clearLabel,
  onSelect,
  onClear,
}: {
  results: readonly SettingsSearchResult[];
  emptyTitle: string;
  emptyDescription: string;
  clearLabel: string;
  onSelect: (result: SettingsSearchResult) => void;
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <SettingsEmpty
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button variant="surface" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        }
      />
    );
  }

  const groups = new Map<string, { page: SettingsPageDefinition; results: SettingsSearchResult[] }>();
  for (const result of results) {
    const group = groups.get(result.page.id) ?? { page: result.page, results: [] };
    group.results.push(result);
    groups.set(result.page.id, group);
  }

  return (
    <>
      {[...groups.values()].map((group) => (
        <SidebarGroup key={group.page.id}>
          <SidebarGroupLabel>
            {group.page.icon}
            <span>{group.page.title}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.results.map((result) => (
              <SidebarMenuItem key={`${result.section.id}/${result.setting.id}`}>
                <SidebarMenuButton size="sm" onClick={() => onSelect(result)}>
                  <span title={result.setting.title}>{result.setting.title}</span>
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
  const { layout } = useSidebar();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 md:px-10 md:py-12">
      <Heading level={layout === "contained" ? 2 : 1} size="heading-2">
        {page.title}
      </Heading>
      {page.sections.map((section) => (
        <FieldSet key={section.id} className="gap-3">
          <FieldLegend variant="section">{section.title}</FieldLegend>
          <FieldGroup variant="card">
            {section.settings.map((setting) => (
              <SettingsRow key={setting.id} pageId={page.id} sectionId={section.id} setting={setting} instanceId={instanceId} />
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
}: {
  pageId: string;
  sectionId: string;
  setting: SettingDefinition;
  instanceId: string;
}) {
  const ids = settingDomIds(instanceId, pageId, sectionId, setting.id);
  const controlProps: SettingsControlProps = {
    id: ids.control,
    "aria-labelledby": ids.label,
    "aria-describedby": setting.description ? ids.description : undefined,
  };

  return (
    <div
      id={ids.row}
      tabIndex={-1}
      className="scroll-m-8 outline-none transition-colors duration-[var(--duration-fast)] focus:bg-foreground/4 focus-within:bg-foreground/4"
    >
      <Field orientation="responsive" className="gap-3">
        <FieldContent>
          <FieldLabel id={ids.label} htmlFor={ids.control}>
            {setting.title}
          </FieldLabel>
          {setting.description ? <FieldDescription id={ids.description}>{setting.description}</FieldDescription> : null}
        </FieldContent>
        <div className="flex shrink-0 items-center">{setting.renderControl(controlProps)}</div>
      </Field>
    </div>
  );
}

function SettingsEmpty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Empty className="min-h-40">
      <EmptyHeader>
        <EmptyMedia>
          <SearchIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
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
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & { children?: ReactNode }) {
  return (
    <Button variant="quiet" size="sm" className={cn("-ms-1 justify-start gap-2", className)} {...props}>
      <ArrowLeftIcon data-icon-dir="inline" aria-hidden="true" />
      {children}
    </Button>
  );
}
