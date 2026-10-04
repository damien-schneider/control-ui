"use client";

import { ChevronLeftIcon, ChevronRightIcon, FileIcon, FolderIcon, MoreHorizontalIcon, SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps, KeyboardEvent, ReactNode, RefCallback } from "react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/control-ui/ui/breadcrumb";
import { Button } from "@/components/control-ui/ui/button";
import { Drawer, DrawerBody, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/control-ui/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/control-ui/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Input } from "@/components/control-ui/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/control-ui/ui/resizable";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
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
  SidebarProvider,
  SidebarRail,
  type SidebarStyle,
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import { Heading, type HeadingLevel, Text } from "@/components/control-ui/ui/typography";
import {
  type FileExplorerBreadcrumb,
  type FileExplorerColumn,
  type FileExplorerEntry,
  type FileExplorerLocation,
  type FileExplorerSearchResult,
  groupFileExplorerItems,
  orderFileExplorerEntries,
  resolveFileExplorer,
  searchFileExplorer,
} from "./file-explorer-data";

export type {
  FileExplorerBreadcrumb,
  FileExplorerColumn,
  FileExplorerEntry,
  FileExplorerEntryDetail,
  FileExplorerLocation,
  FileExplorerResolution,
  FileExplorerSearchResult,
} from "./file-explorer-data";

export type FileExplorerBlockProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  locations: readonly FileExplorerLocation[];
  activeLocationId?: string;
  defaultActiveLocationId?: string;
  selectedPath?: readonly string[];
  defaultSelectedPath?: readonly string[];
  searchValue?: string;
  defaultSearchValue?: string;
  onActiveLocationChange?: (location: FileExplorerLocation) => void;
  onSelectedPathChange?: (path: readonly string[], entry: FileExplorerEntry | undefined) => void;
  onSearchValueChange?: (value: string) => void;
  onOpenEntry?: (entry: FileExplorerEntry, path: readonly string[]) => void;
  sidebarTop?: ReactNode;
  sidebarFooter?: ReactNode;
  headerActions?: ReactNode;
  headerMenuItems?: ReactNode;
  searchPlaceholder?: string | false;
  searchLabel?: string;
  clearSearchLabel?: string;
  searchResultsLabel?: string;
  searchStatusLabel?: (count: number, query: string) => string;
  backLabel?: string;
  moreActionsLabel?: string;
  detailsLabel?: string;
  layout?: "viewport" | "contained";
};

type OptionTarget = { columnIndex: number; entryId: string };

function defaultSearchStatusLabel(count: number, query: string) {
  if (count === 0) return `No results for “${query}”`;
  return count === 1 ? "1 result" : `${count} results`;
}

export function FileExplorerBlock({
  locations,
  activeLocationId,
  defaultActiveLocationId,
  selectedPath,
  defaultSelectedPath = [],
  searchValue,
  defaultSearchValue = "",
  onActiveLocationChange,
  onSelectedPathChange,
  onSearchValueChange,
  onOpenEntry,
  sidebarTop,
  sidebarFooter,
  headerActions,
  headerMenuItems,
  searchPlaceholder = "Search files",
  searchLabel = "Search files",
  clearSearchLabel = "Clear search",
  searchResultsLabel = "Search results",
  searchStatusLabel = defaultSearchStatusLabel,
  backLabel = "Go back",
  moreActionsLabel = "More actions",
  detailsLabel = "Details",
  layout = "viewport",
  className,
  style,
  ...props
}: FileExplorerBlockProps) {
  const [internalLocationId, setInternalLocationId] = useState(defaultActiveLocationId ?? locations[0]?.id);
  const [internalSelectedPath, setInternalSelectedPath] = useState<readonly string[]>(defaultSelectedPath);
  const [internalSearchValue, setInternalSearchValue] = useState(defaultSearchValue);
  const currentLocationId = activeLocationId ?? internalLocationId;
  const currentPath = selectedPath ?? internalSelectedPath;
  const query = searchValue ?? internalSearchValue;
  const trimmedQuery = query.trim();
  const activeLocation = locations.find((location) => location.id === currentLocationId) ?? locations[0];
  const contained = layout === "contained";

  function changePath(path: readonly string[], entry: FileExplorerEntry | undefined) {
    if (selectedPath === undefined) setInternalSelectedPath(path);
    onSelectedPathChange?.(path, entry);
  }

  function changeQuery(value: string) {
    if (searchValue === undefined) setInternalSearchValue(value);
    onSearchValueChange?.(value);
  }

  function changeLocation(location: FileExplorerLocation) {
    if (activeLocationId === undefined) setInternalLocationId(location.id);
    changePath([], undefined);
    changeQuery("");
    onActiveLocationChange?.(location);
  }

  if (!activeLocation) {
    return <FileExplorerUnavailable className={className} style={style} {...props} />;
  }

  const resolution = resolveFileExplorer(activeLocation, currentPath);
  const searchResults = searchFileExplorer(activeLocation, query);
  const searchStatus = trimmedQuery ? searchStatusLabel(searchResults.length, trimmedQuery) : "";

  function selectSearchResult(result: FileExplorerSearchResult) {
    changePath(result.path, result.entry);
    changeQuery("");
  }

  function openEntry(entry: FileExplorerEntry, path: readonly string[]) {
    onOpenEntry?.(entry, path);
  }

  const providerStyle: SidebarStyle = { "--sidebar-width": "14.5rem", ...style };

  return (
    <SidebarProvider
      layout={layout}
      className={cn("bg-background text-foreground", !contained && "h-svh overflow-hidden", className)}
      style={providerStyle}
      {...props}
    >
      <FileExplorerSidebar
        locations={locations}
        activeLocationId={activeLocation.id}
        sidebarTop={sidebarTop}
        sidebarFooter={sidebarFooter}
        onLocationSelect={changeLocation}
      />

      <SidebarInset className="@container/explorer h-full min-h-0 min-w-0 overflow-hidden">
        <FileExplorerHeader
          location={activeLocation}
          headingLevel={contained ? 2 : 1}
          breadcrumbs={resolution.breadcrumbs}
          query={query}
          searchPlaceholder={searchPlaceholder}
          searchLabel={searchLabel}
          clearSearchLabel={clearSearchLabel}
          backLabel={backLabel}
          moreActionsLabel={moreActionsLabel}
          canGoBack={resolution.validPath.length > 0}
          headerActions={headerActions}
          headerMenuItems={headerMenuItems}
          onBack={() => changePath(resolution.validPath.slice(0, -1), resolution.breadcrumbs.at(-2)?.entry)}
          onBreadcrumbSelect={(breadcrumb) => changePath(breadcrumb.path, breadcrumb.entry)}
          onQueryChange={changeQuery}
        />

        <div className="min-h-0 flex-1 overflow-hidden">
          {trimmedQuery ? (
            <FileExplorerSearchResults
              label={searchResultsLabel}
              status={searchStatus}
              clearSearchLabel={clearSearchLabel}
              results={searchResults}
              onSelect={selectSearchResult}
              onOpen={openEntry}
              onClear={() => changeQuery("")}
            />
          ) : (
            <FileExplorerColumns
              columns={resolution.columns}
              selectedEntry={resolution.selectedEntry}
              selectedPath={resolution.validPath}
              headingLevel={contained ? 3 : 2}
              backLabel={backLabel}
              detailsLabel={detailsLabel}
              onNavigate={changePath}
              onOpen={openEntry}
            />
          )}
        </div>

        <FileExplorerStatusBar breadcrumbs={resolution.breadcrumbs} selectedEntry={resolution.selectedEntry} />
        <LiveStatus message={searchStatus} />
      </SidebarInset>
    </SidebarProvider>
  );
}

function FileExplorerUnavailable({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex min-h-96 items-center justify-center border bg-background", className)} {...props}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>No locations</EmptyTitle>
          <EmptyDescription>Add at least one location to populate the file explorer.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function FileExplorerSidebar({
  locations,
  activeLocationId,
  sidebarTop,
  sidebarFooter,
  onLocationSelect,
}: {
  locations: readonly FileExplorerLocation[];
  activeLocationId: string;
  sidebarTop?: ReactNode;
  sidebarFooter?: ReactNode;
  onLocationSelect: (location: FileExplorerLocation) => void;
}) {
  const { setOpenMobile } = useSidebar();
  const groups = groupFileExplorerItems(locations);

  return (
    <Sidebar collapsible="offcanvas">
      {sidebarTop ? (
        <SidebarHeader className="min-h-11 justify-center border-b border-sidebar-border px-3">{sidebarTop}</SidebarHeader>
      ) : null}
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label || "locations"}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((location) => (
                <SidebarMenuItem key={location.id}>
                  <SidebarMenuButton
                    size="sm"
                    isActive={location.id === activeLocationId}
                    onClick={() => {
                      onLocationSelect(location);
                      setOpenMobile(false);
                    }}
                  >
                    {location.icon ?? <FolderIcon />}
                    <span>{location.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {sidebarFooter ? <SidebarFooter className="border-t border-sidebar-border">{sidebarFooter}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  );
}

function FileExplorerHeader({
  location,
  headingLevel,
  breadcrumbs,
  query,
  searchPlaceholder,
  searchLabel,
  clearSearchLabel,
  backLabel,
  moreActionsLabel,
  canGoBack,
  headerActions,
  headerMenuItems,
  onBack,
  onBreadcrumbSelect,
  onQueryChange,
}: {
  location: FileExplorerLocation;
  headingLevel: HeadingLevel;
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  query: string;
  searchPlaceholder: string | false;
  searchLabel: string;
  clearSearchLabel: string;
  backLabel: string;
  moreActionsLabel: string;
  canGoBack: boolean;
  headerActions?: ReactNode;
  headerMenuItems?: ReactNode;
  onBack: () => void;
  onBreadcrumbSelect: (breadcrumb: FileExplorerBreadcrumb) => void;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="shrink-0 border-b border-border/70 bg-card/35">
      <div className="flex h-12 items-center gap-2 px-3">
        <SidebarTrigger size="xs" />
        <Button
          variant="ghost"
          size="xs"
          className="hidden @xl/explorer:inline-flex"
          disabled={!canGoBack}
          aria-label={backLabel}
          onClick={onBack}
        >
          <ChevronLeftIcon className="size-4" data-icon-dir="inline" />
        </Button>
        <Heading level={headingLevel} size="label" weight="semibold" className="min-w-0 flex-1 truncate" title={location.label}>
          {location.label}
        </Heading>
        {headerActions ? (
          <div className={cn("shrink-0 items-center gap-1", headerMenuItems ? "hidden @2xl/explorer:flex" : "flex")}>{headerActions}</div>
        ) : null}
        {headerMenuItems ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              variant="ghost"
              size="xs"
              iconOnly
              aria-label={moreActionsLabel}
              className={headerActions ? "@2xl/explorer:hidden" : undefined}
            >
              <MoreHorizontalIcon className="size-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">{headerMenuItems}</DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {searchPlaceholder ? (
          <InputGroup size="sm" className="flex-[0_1_9rem] bg-background/60 @xl/explorer:flex-[0_0_12rem]">
            <InputGroupAddon className="ps-2">
              <SearchIcon className="size-3.5" aria-hidden="true" />
            </InputGroupAddon>
            <Input
              type="search"
              aria-label={searchLabel}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
            />
            {query ? (
              <Button variant="ghost" size="xs" iconOnly className="me-1" aria-label={clearSearchLabel} onClick={() => onQueryChange("")}>
                <XIcon className="size-3.5" />
              </Button>
            ) : null}
          </InputGroup>
        ) : null}
      </div>
      <div className="px-3 pb-2">
        <FileExplorerAddressBar breadcrumbs={breadcrumbs} onSelect={onBreadcrumbSelect} />
      </div>
    </header>
  );
}

function FileExplorerColumns({
  columns,
  selectedEntry,
  selectedPath,
  headingLevel,
  backLabel,
  detailsLabel,
  onNavigate,
  onOpen,
}: {
  columns: readonly FileExplorerColumn[];
  selectedEntry?: FileExplorerEntry;
  selectedPath: readonly string[];
  headingLevel: HeadingLevel;
  backLabel: string;
  detailsLabel: string;
  onNavigate: (path: readonly string[], entry: FileExplorerEntry | undefined) => void;
  onOpen: (entry: FileExplorerEntry, path: readonly string[]) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const optionElements = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<OptionTarget | null>(null);
  const restoreFocus = useRef(false);
  const backRef = useRef<HTMLButtonElement>(null);
  const [narrowRef, narrowDisplayed] = useDisplayed();
  const [wideRef, wideDisplayed] = useDisplayed();
  const [pinned, setPinned] = useState<{ pathKey: string; columnIndex: number } | null>(null);
  const lastIndex = columns.length - 1;
  const activeIndex = pinned?.pathKey === JSON.stringify(selectedPath) ? Math.min(pinned.columnIndex, lastIndex) : lastIndex;
  const activeColumn = columns[activeIndex];
  const parentColumn = activeIndex > 0 ? columns[activeIndex - 1] : undefined;
  const paneCount = columns.length + 1;
  const columnSize = `${Math.max(18, Math.floor(68 / paneCount))}%`;

  useEffect(() => {
    const target = pendingFocus.current;
    if (target && focusOption(target)) pendingFocus.current = null;
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    if (rootRef.current?.contains(document.activeElement)) return;
    const tabStop = [...optionElements.current.values()].find((option) => option.tabIndex === 0 && option.checkVisibility());
    (tabStop ?? backRef.current)?.focus();
  });

  function focusOption(target: OptionTarget) {
    for (const layout of ["narrow", "wide"]) {
      const option = optionElements.current.get(`${layout}:${target.columnIndex}:${target.entryId}`);
      if (option?.checkVisibility()) {
        option.focus();
        return true;
      }
    }
    return false;
  }

  function moveTo(columnIndex: number, entry: FileExplorerEntry, path: readonly string[]) {
    onNavigate(path, entry);
    setPinned({ pathKey: JSON.stringify(path), columnIndex });
    const target = { columnIndex, entryId: entry.id };
    pendingFocus.current = focusOption(target) ? null : target;
  }

  function moveToParent(columnIndex: number) {
    const parentId = selectedPath[columnIndex - 1];
    const parent = columns[columnIndex - 1]?.entries.find((entry) => entry.id === parentId);
    if (parent) moveTo(columnIndex - 1, parent, selectedPath.slice(0, columnIndex));
  }

  function select(columnIndex: number, entry: FileExplorerEntry) {
    setPinned(null);
    restoreFocus.current = true;
    onNavigate([...selectedPath.slice(0, columnIndex), entry.id], entry);
  }

  function moveAlongInlineAxis(event: KeyboardEvent<HTMLElement>, columnIndex: number, entry: FileExplorerEntry) {
    const towardEnd = (event.key === "ArrowRight") !== (getComputedStyle(event.currentTarget).direction === "rtl");
    if (!towardEnd) {
      moveToParent(columnIndex);
      return;
    }
    const child = entry.kind === "folder" ? orderFileExplorerEntries(entry.children ?? [])[0] : undefined;
    if (child) moveTo(columnIndex + 1, child, [...selectedPath.slice(0, columnIndex), entry.id, child.id]);
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLElement>, columnIndex: number, entry: FileExplorerEntry) {
    const ordered = orderFileExplorerEntries(columns[columnIndex]?.entries ?? []);
    const index = ordered.indexOf(entry);
    const base = selectedPath.slice(0, columnIndex);
    let target: FileExplorerEntry | undefined;

    switch (event.key) {
      case "ArrowDown":
        target = ordered[index + 1];
        break;
      case "ArrowUp":
        target = ordered[index - 1];
        break;
      case "Home":
        target = ordered[0];
        break;
      case "End":
        target = ordered.at(-1);
        break;
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault();
        moveAlongInlineAxis(event, columnIndex, entry);
        return;
      case "Enter":
        event.preventDefault();
        onOpen(entry, [...base, entry.id]);
        return;
      default:
        return;
    }

    event.preventDefault();
    if (target) moveTo(columnIndex, target, [...base, target.id]);
  }

  function renderColumn(column: FileExplorerColumn, columnIndex: number, layout: "narrow" | "wide") {
    return (
      <FileExplorerColumnView
        column={column}
        optionRef={(entryId) => (element) => {
          const key = `${layout}:${columnIndex}:${entryId}`;
          if (element) optionElements.current.set(key, element);
          return () => {
            optionElements.current.delete(key);
          };
        }}
        onSelect={(entry) => select(columnIndex, entry)}
        onOpen={(entry) => onOpen(entry, [...selectedPath.slice(0, columnIndex), entry.id])}
        onOptionKeyDown={(event, entry) => handleOptionKeyDown(event, columnIndex, entry)}
      />
    );
  }

  return (
    <div ref={rootRef} className="h-full min-h-0">
      <div ref={narrowRef} className="flex h-full min-h-0 flex-col @xl/explorer:hidden">
        {narrowDisplayed ? (
          <>
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border/70 px-2">
              {parentColumn ? (
                <Button
                  variant="ghost"
                  size="xs"
                  className="min-w-0 justify-start"
                  ref={backRef}
                  aria-label={`${backLabel}: ${parentColumn.label}`}
                  onClick={() => moveToParent(activeIndex)}
                >
                  <ChevronLeftIcon className="size-4" data-icon-dir="inline" />
                  <span className="truncate">{parentColumn.label}</span>
                </Button>
              ) : (
                <Text size="label" weight="medium" className="min-w-0 truncate px-1">
                  {activeColumn?.label}
                </Text>
              )}
              <Drawer>
                <DrawerTrigger render={<Button variant="ghost" size="xs" className="ms-auto" disabled={!selectedEntry} />}>
                  {detailsLabel}
                </DrawerTrigger>
                <DrawerContent>
                  {selectedEntry ? (
                    <DrawerBody>
                      <FileExplorerPreviewContent
                        entry={selectedEntry}
                        title={<DrawerTitle className="mt-4 max-w-full truncate text-heading-4">{selectedEntry.name}</DrawerTitle>}
                      />
                    </DrawerBody>
                  ) : null}
                </DrawerContent>
              </Drawer>
            </div>
            <div className="min-h-0 flex-1 bg-card">{activeColumn ? renderColumn(activeColumn, activeIndex, "narrow") : null}</div>
          </>
        ) : null}
      </div>
      <div ref={wideRef} className="hidden h-full min-h-0 @xl/explorer:block">
        {wideDisplayed ? (
          <ResizablePanelGroup orientation="horizontal" className="rounded-none border-0 bg-card shadow-none">
            {columns.map((column, columnIndex) => (
              <FileExplorerPanel key={column.id} defaultSize={columnSize} minSize="16%">
                {renderColumn(column, columnIndex, "wide")}
              </FileExplorerPanel>
            ))}
            <ResizablePanel defaultSize="32%" minSize="20%">
              <FileExplorerPreview entry={selectedEntry} headingLevel={headingLevel} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : null}
      </div>
    </div>
  );
}

function useDisplayed() {
  const ref = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setDisplayed(Boolean(entry && entry.contentRect.width > 0)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, displayed] as const;
}

function FileExplorerPanel({ children, ...props }: ComponentProps<typeof ResizablePanel>) {
  return (
    <>
      <ResizablePanel {...props}>{children}</ResizablePanel>
      <ResizableHandle />
    </>
  );
}

function FileExplorerEntryIcon({ entry }: { entry: FileExplorerEntry }) {
  return entry.icon ?? (entry.kind === "folder" ? <FolderIcon /> : <FileIcon className="text-muted-foreground" />);
}

function FileExplorerColumnView({
  column,
  optionRef,
  onSelect,
  onOpen,
  onOptionKeyDown,
}: {
  column: FileExplorerColumn;
  optionRef: (entryId: string) => RefCallback<HTMLButtonElement>;
  onSelect: (entry: FileExplorerEntry) => void;
  onOpen: (entry: FileExplorerEntry) => void;
  onOptionKeyDown: (event: KeyboardEvent<HTMLElement>, entry: FileExplorerEntry) => void;
}) {
  const groupId = useId();
  const groups = groupFileExplorerItems(column.entries);
  const tabStopId = column.selectedId ?? groups[0]?.items[0]?.id;

  if (column.entries.length === 0) {
    return (
      <Empty className="h-full rounded-none">
        <EmptyHeader>
          <EmptyMedia>
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>Empty folder</EmptyTitle>
          <EmptyDescription>{column.label} has no files yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full" lockAxis="x">
      <div role="listbox" aria-label={column.label} className="grid gap-4 p-2">
        {groups.map((group, groupIndex) => {
          const labelId = `${groupId}-${groupIndex}`;
          const options = group.items.map((entry) => {
            const isSelected = entry.id === column.selectedId;
            return (
              <Button
                key={entry.id}
                ref={optionRef(entry.id)}
                role="option"
                aria-selected={isSelected}
                tabIndex={entry.id === tabStopId ? 0 : -1}
                variant="quiet"
                size="sm"
                active={isSelected}
                className="w-full justify-start gap-2 px-2 text-start"
                title={entry.name}
                onClick={() => onSelect(entry)}
                onDoubleClick={() => onOpen(entry)}
                onKeyDown={(event) => onOptionKeyDown(event, entry)}
              >
                <span className="flex size-4 shrink-0 items-center justify-center text-info-text [&>svg]:size-4">
                  <FileExplorerEntryIcon entry={entry} />
                </span>
                <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                {entry.kind === "folder" ? (
                  <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" data-icon-dir="inline" />
                ) : null}
              </Button>
            );
          });
          return group.label ? (
            // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA listbox groups options with role="group"; a fieldset is not a valid listbox child.
            <div key={group.label} role="group" aria-labelledby={labelId} className="grid min-w-0 gap-0.5">
              <Text role="presentation" id={labelId} as="div" size="caption" weight="semibold" tone="muted" className="mb-1 px-2">
                {group.label}
              </Text>
              {options}
            </div>
          ) : (
            <div key="" role="presentation" className="grid min-w-0 gap-0.5">
              {options}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function FileExplorerPreview({ entry, headingLevel }: { entry?: FileExplorerEntry; headingLevel: HeadingLevel }) {
  if (!entry) {
    return (
      <Empty className="h-full rounded-none bg-background/45">
        <EmptyHeader>
          <EmptyMedia>
            <FileIcon />
          </EmptyMedia>
          <EmptyTitle>Select an item</EmptyTitle>
          <EmptyDescription>Choose a file or folder to inspect its details.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full bg-background/45" lockAxis="x">
      <FileExplorerPreviewContent
        entry={entry}
        className="px-6 py-10"
        title={
          <Heading level={headingLevel} size="heading-4" className="mt-4 max-w-full truncate" title={entry.name}>
            {entry.name}
          </Heading>
        }
      />
    </ScrollArea>
  );
}

function FileExplorerPreviewContent({ entry, title, className }: { entry: FileExplorerEntry; title: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-lg flex-col items-center text-center", className)}>
      <div className="flex size-16 items-center justify-center rounded-[var(--radius-panel)] bg-foreground/6 text-info-text shadow-sm ring-1 ring-foreground/8 [&>svg]:size-8">
        <FileExplorerEntryIcon entry={entry} />
      </div>
      {title}
      {entry.description ? (
        <Text as="div" size="caption" tone="muted" className="mt-1">
          {entry.description}
        </Text>
      ) : null}
      {entry.details && entry.details.length > 0 ? (
        <dl className="mt-6 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border/70 pt-4 text-start text-caption">
          {entry.details.map((detail) => (
            <div key={detail.label} className="contents">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="min-w-0 truncate text-end text-foreground">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {entry.preview ? <div className="mt-6 w-full text-start">{entry.preview}</div> : null}
    </div>
  );
}

function FileExplorerSearchResults({
  label,
  status,
  clearSearchLabel,
  results,
  onSelect,
  onOpen,
  onClear,
}: {
  label: string;
  status: string;
  clearSearchLabel: string;
  results: readonly FileExplorerSearchResult[];
  onSelect: (result: FileExplorerSearchResult) => void;
  onOpen: (entry: FileExplorerEntry, path: readonly string[]) => void;
  onClear: () => void;
}) {
  const optionElements = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabStop = Math.min(activeIndex, results.length - 1);

  if (results.length === 0) {
    return (
      <Empty className="h-full rounded-none">
        <EmptyHeader>
          <EmptyMedia>
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>{status}</EmptyTitle>
          <EmptyDescription>Try a shorter file or folder name.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="surface" size="sm" onClick={onClear}>
            {clearSearchLabel}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>, index: number, result: FileExplorerSearchResult) {
    if (event.key === "Enter") {
      event.preventDefault();
      onOpen(result.entry, result.path);
      return;
    }
    const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: results.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = Math.max(0, Math.min(next, results.length - 1));
    setActiveIndex(target);
    optionElements.current[target]?.focus();
  }

  return (
    <ScrollArea className="h-full" lockAxis="x">
      <div className="mx-auto grid w-full max-w-3xl gap-1 p-4">
        <Text as="div" size="caption" tone="muted" className="mb-2 px-2 tabular-nums">
          {status}
        </Text>
        <div role="listbox" aria-label={label} className="grid gap-1">
          {results.map((result, index) => (
            <Button
              key={result.path.join("/")}
              ref={(element) => {
                optionElements.current[index] = element;
              }}
              role="option"
              aria-selected={index === tabStop}
              tabIndex={index === tabStop ? 0 : -1}
              variant="quiet"
              size="lg"
              className="h-auto w-full justify-start gap-3 px-3 py-2 text-start"
              onClick={() => onSelect(result)}
              onDoubleClick={() => onOpen(result.entry, result.path)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index, result)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-foreground/6 text-info-text [&>svg]:size-4">
                <FileExplorerEntryIcon entry={result.entry} />
              </span>
              <span className="min-w-0 flex-1">
                <Text size="label" tone="foreground" className="block truncate">
                  {result.entry.name}
                </Text>
                <Text size="caption" tone="muted" className="block truncate">
                  {result.parents.join(" / ") || "Top level"}
                </Text>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function FileExplorerStatusBar({
  breadcrumbs,
  selectedEntry,
}: {
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  selectedEntry?: FileExplorerEntry;
}) {
  const path = breadcrumbs.map((breadcrumb) => breadcrumb.label).join(" / ");
  const itemCount = selectedEntry?.children?.length ?? 0;
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <footer className="flex h-8 shrink-0 items-center gap-3 border-t border-border/70 bg-card/45 px-3 text-micro text-muted-foreground">
      <span className="min-w-0 flex-1 truncate" title={path}>
        {path}
      </span>
      <span className="shrink-0 tabular-nums">
        {selectedEntry?.kind === "folder" ? itemLabel : (selectedEntry?.name ?? "No selection")}
      </span>
    </footer>
  );
}

function FileExplorerAddressBar({
  breadcrumbs,
  onSelect,
}: {
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  onSelect: (breadcrumb: FileExplorerBreadcrumb) => void;
}) {
  return (
    <Breadcrumb
      aria-label="Current folder"
      className="min-w-0 overflow-hidden rounded-[var(--radius-control)] border bg-background/55 px-2 py-1 shadow-inner"
    >
      <BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden">
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          return (
            <Fragment key={`${breadcrumb.id}:${breadcrumb.path.join("/")}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className="min-w-0">
                {isCurrent ? (
                  <BreadcrumbPage className="min-w-0 truncate" title={breadcrumb.label}>
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<button type="button" />}
                    className="min-w-0 truncate"
                    title={breadcrumb.label}
                    onClick={() => onSelect(breadcrumb)}
                  >
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
