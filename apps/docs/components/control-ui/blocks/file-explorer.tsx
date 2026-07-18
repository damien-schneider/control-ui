"use client";

import { ChevronRightIcon, FileIcon, FolderIcon, SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/control-ui/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/control-ui/ui/input-group";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/control-ui/ui/sidebar";
import {
  type FileExplorerBreadcrumb,
  type FileExplorerColumn,
  type FileExplorerEntry,
  type FileExplorerLocation,
  type FileExplorerSearchResult,
  groupFileExplorerItems,
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
  searchPlaceholder?: string | false;
  layout?: "viewport" | "contained";
};

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
  searchPlaceholder = "Search files",
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

  function selectEntry(entry: FileExplorerEntry, columnIndex: number) {
    changePath([...resolution.validPath.slice(0, columnIndex), entry.id], entry);
  }

  function selectSearchResult(result: FileExplorerSearchResult) {
    changePath(result.path, result.entry);
    changeQuery("");
  }

  function openEntry(entry: FileExplorerEntry, path: readonly string[]) {
    onOpenEntry?.(entry, path);
  }

  return (
    <SidebarProvider
      className={cn("overflow-hidden bg-background text-foreground", contained ? "relative h-full min-h-0" : "h-svh min-h-svh", className)}
      style={{ "--sidebar-width": "14.5rem", ...style } as CSSProperties}
      {...props}
    >
      <FileExplorerSidebar
        locations={locations}
        activeLocationId={activeLocation.id}
        contained={contained}
        sidebarTop={sidebarTop}
        sidebarFooter={sidebarFooter}
        onLocationSelect={changeLocation}
      />

      <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
        <FileExplorerHeader
          location={activeLocation}
          breadcrumbs={resolution.breadcrumbs}
          query={query}
          searchPlaceholder={searchPlaceholder}
          canGoBack={resolution.validPath.length > 0}
          headerActions={headerActions}
          onBack={() => changePath(resolution.validPath.slice(0, -1), resolution.breadcrumbs.at(-2)?.entry)}
          onBreadcrumbSelect={(breadcrumb) => changePath(breadcrumb.path, breadcrumb.entry)}
          onQueryChange={changeQuery}
        />

        <div className="min-h-0 flex-1 overflow-hidden">
          {query.trim() ? (
            <FileExplorerSearchResults query={query} results={searchResults} onSelect={selectSearchResult} onOpen={openEntry} />
          ) : (
            <FileExplorerColumns
              columns={resolution.columns}
              selectedEntry={resolution.selectedEntry}
              selectedPath={resolution.validPath}
              onSelect={selectEntry}
              onOpen={openEntry}
            />
          )}
        </div>

        <FileExplorerStatusBar
          breadcrumbs={resolution.breadcrumbs}
          selectedEntry={resolution.selectedEntry}
          onBreadcrumbSelect={(breadcrumb) => changePath(breadcrumb.path, breadcrumb.entry)}
        />
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
  contained,
  sidebarTop,
  sidebarFooter,
  onLocationSelect,
}: {
  locations: readonly FileExplorerLocation[];
  activeLocationId: string;
  contained: boolean;
  sidebarTop?: ReactNode;
  sidebarFooter?: ReactNode;
  onLocationSelect: (location: FileExplorerLocation) => void;
}) {
  const { setOpenMobile } = useSidebar();
  const groups = groupFileExplorerItems(locations);

  return (
    <Sidebar collapsible="offcanvas" className={contained ? "absolute! inset-y-0! h-full border-r border-sidebar-border" : undefined}>
      {sidebarTop ? (
        <SidebarHeader className="min-h-11 justify-center border-b border-sidebar-border px-3">{sidebarTop}</SidebarHeader>
      ) : null}
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label || "locations"}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((location) => {
                const isActive = location.id === activeLocationId;
                return (
                  <SidebarMenuItem key={location.id}>
                    <SidebarMenuButton
                      size="sm"
                      isActive={isActive}
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => {
                        onLocationSelect(location);
                        setOpenMobile(false);
                      }}
                    >
                      {location.icon ?? <FolderIcon />}
                      <span>{location.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
  breadcrumbs,
  query,
  searchPlaceholder,
  canGoBack,
  headerActions,
  onBack,
  onBreadcrumbSelect,
  onQueryChange,
}: {
  location: FileExplorerLocation;
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  query: string;
  searchPlaceholder: string | false;
  canGoBack: boolean;
  headerActions?: ReactNode;
  onBack: () => void;
  onBreadcrumbSelect: (breadcrumb: FileExplorerBreadcrumb) => void;
  onQueryChange: (value: string) => void;
}) {
  return (
    <header className="shrink-0 border-b border-border/70 bg-card/35">
      <div className="flex h-12 items-center gap-2 px-3">
        <SidebarTrigger size="xs" />
        <Button variant="ghost" size="xs" disabled={!canGoBack} aria-label="Go back" onClick={onBack}>
          <ChevronRightIcon className="size-4 rotate-180" />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-label font-semibold">{location.label}</h1>
        {headerActions ? <div className="hidden shrink-0 items-center gap-1 sm:flex">{headerActions}</div> : null}
        {searchPlaceholder ? (
          <InputGroup size="sm" className="w-36 bg-background/60 md:w-48">
            <InputGroupAddon className="pl-2">
              <SearchIcon className="size-3.5" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
            />
            {query ? (
              <Button variant="ghost" size="xs" iconOnly className="mr-1" aria-label="Clear search" onClick={() => onQueryChange("")}>
                <XIcon className="size-3.5" />
              </Button>
            ) : null}
          </InputGroup>
        ) : null}
      </div>
      <div className="px-3 pb-2">
        <FileExplorerBreadcrumbs breadcrumbs={breadcrumbs} onSelect={onBreadcrumbSelect} variant="address" />
      </div>
    </header>
  );
}

function FileExplorerColumns({
  columns,
  selectedEntry,
  selectedPath,
  onSelect,
  onOpen,
}: {
  columns: readonly FileExplorerColumn[];
  selectedEntry?: FileExplorerEntry;
  selectedPath: readonly string[];
  onSelect: (entry: FileExplorerEntry, columnIndex: number) => void;
  onOpen: (entry: FileExplorerEntry, path: readonly string[]) => void;
}) {
  const paneCount = columns.length + 1;
  const columnSize = `${Math.max(18, Math.floor(68 / paneCount))}%`;

  return (
    <ResizablePanelGroup orientation="horizontal" className="rounded-none border-0 bg-card shadow-none">
      {columns.map((column, columnIndex) => (
        <FileExplorerPanel key={column.id} defaultSize={columnSize} minSize="16%">
          <FileExplorerColumnView
            column={column}
            columnIndex={columnIndex}
            onSelect={onSelect}
            onOpen={(entry) => onOpen(entry, [...selectedPath.slice(0, columnIndex), entry.id])}
          />
        </FileExplorerPanel>
      ))}
      <ResizablePanel defaultSize="32%" minSize="20%">
        <FileExplorerPreview entry={selectedEntry} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function FileExplorerPanel({ children, ...props }: ComponentProps<typeof ResizablePanel>) {
  return (
    <>
      <ResizablePanel {...props}>{children}</ResizablePanel>
      <ResizableHandle />
    </>
  );
}

function FileExplorerColumnView({
  column,
  columnIndex,
  onSelect,
  onOpen,
}: {
  column: FileExplorerColumn;
  columnIndex: number;
  onSelect: (entry: FileExplorerEntry, columnIndex: number) => void;
  onOpen: (entry: FileExplorerEntry) => void;
}) {
  const groups = groupFileExplorerItems(column.entries);

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
      <div className="grid gap-4 p-2">
        {groups.map((group) => (
          <section key={group.label || "files"} className="min-w-0">
            {group.label ? <h2 className="mb-1 px-2 text-caption font-semibold text-muted-foreground">{group.label}</h2> : null}
            <div className="grid gap-0.5">
              {group.items.map((entry) => {
                const isSelected = entry.id === column.selectedId;
                return (
                  <Button
                    key={entry.id}
                    variant="quiet"
                    size="sm"
                    active={isSelected}
                    aria-current={isSelected ? "page" : undefined}
                    className="w-full justify-start gap-2 px-2 text-left"
                    title={entry.name}
                    onClick={() => onSelect(entry, columnIndex)}
                    onDoubleClick={() => onOpen(entry)}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center text-[oklch(0.72_0.14_235)] [&>svg]:size-4">
                      {entry.icon ?? (entry.kind === "folder" ? <FolderIcon /> : <FileIcon className="text-muted-foreground" />)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    {entry.kind === "folder" ? <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" /> : null}
                  </Button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ScrollArea>
  );
}

function FileExplorerPreview({ entry }: { entry?: FileExplorerEntry }) {
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
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-[var(--radius-panel)] bg-foreground/6 text-[oklch(0.72_0.14_235)] shadow-sm ring-1 ring-foreground/8 [&>svg]:size-8">
          {entry.icon ?? (entry.kind === "folder" ? <FolderIcon /> : <FileIcon className="text-muted-foreground" />)}
        </div>
        <h2 className="mt-4 max-w-full truncate text-base font-semibold">{entry.name}</h2>
        {entry.description ? <div className="mt-1 text-caption leading-5 text-muted-foreground">{entry.description}</div> : null}
        {entry.details && entry.details.length > 0 ? (
          <dl className="mt-6 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border/70 pt-4 text-left text-caption">
            {entry.details.map((detail) => (
              <div key={detail.label} className="contents">
                <dt className="text-muted-foreground">{detail.label}</dt>
                <dd className="min-w-0 truncate text-right text-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {entry.preview ? <div className="mt-6 w-full text-left">{entry.preview}</div> : null}
      </div>
    </ScrollArea>
  );
}

function FileExplorerSearchResults({
  query,
  results,
  onSelect,
  onOpen,
}: {
  query: string;
  results: readonly FileExplorerSearchResult[];
  onSelect: (result: FileExplorerSearchResult) => void;
  onOpen: (entry: FileExplorerEntry, path: readonly string[]) => void;
}) {
  if (results.length === 0) {
    return (
      <Empty className="h-full rounded-none">
        <EmptyHeader>
          <EmptyMedia>
            <SearchIcon />
          </EmptyMedia>
          <EmptyTitle>No results for “{query}”</EmptyTitle>
          <EmptyDescription>Try a shorter file or folder name.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full" lockAxis="x">
      <div className="mx-auto grid w-full max-w-3xl gap-1 p-4">
        <div className="mb-2 flex items-center justify-between px-2 text-caption text-muted-foreground">
          <span>
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
          <span>Search: {query}</span>
        </div>
        {results.map((result) => (
          <Button
            key={result.path.join("/")}
            variant="quiet"
            size="lg"
            className="h-auto w-full justify-start gap-3 px-3 py-2 text-left"
            onClick={() => onSelect(result)}
            onDoubleClick={() => onOpen(result.entry, result.path)}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-foreground/6 text-[oklch(0.72_0.14_235)] [&>svg]:size-4">
              {result.entry.icon ?? (result.entry.kind === "folder" ? <FolderIcon /> : <FileIcon className="text-muted-foreground" />)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label text-foreground">{result.entry.name}</span>
              <span className="block truncate text-caption text-muted-foreground">{result.parents.join(" / ") || "Top level"}</span>
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}

function FileExplorerStatusBar({
  breadcrumbs,
  selectedEntry,
  onBreadcrumbSelect,
}: {
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  selectedEntry?: FileExplorerEntry;
  onBreadcrumbSelect: (breadcrumb: FileExplorerBreadcrumb) => void;
}) {
  return (
    <footer className="flex h-8 shrink-0 items-center gap-3 border-t border-border/70 bg-card/45 px-3">
      <FileExplorerBreadcrumbs breadcrumbs={breadcrumbs} onSelect={onBreadcrumbSelect} variant="status" />
      <span className="ml-auto shrink-0 text-micro text-muted-foreground">
        {selectedEntry?.kind === "folder" ? `${selectedEntry.children?.length ?? 0} items` : (selectedEntry?.name ?? "No selection")}
      </span>
    </footer>
  );
}

function FileExplorerBreadcrumbs({
  breadcrumbs,
  onSelect,
  variant,
}: {
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  onSelect: (breadcrumb: FileExplorerBreadcrumb) => void;
  variant: "address" | "status";
}) {
  return (
    <nav
      aria-label={variant === "address" ? "Current folder" : "Selected path"}
      className={cn(
        "min-w-0 flex-1 overflow-hidden",
        variant === "address" && "rounded-[var(--radius-control)] border bg-background/55 px-2 py-1 shadow-inner",
      )}
    >
      <ol
        className={cn(
          "flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden text-caption text-muted-foreground",
          variant === "status" && "text-micro",
        )}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          return (
            <li key={`${breadcrumb.id}:${breadcrumb.path.join("/")}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" /> : null}
              <button
                type="button"
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "min-w-0 truncate rounded-[var(--radius-popup-item)] px-1 py-0.5 text-muted-foreground outline-none transition hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20",
                  isCurrent && "text-foreground",
                )}
                onClick={() => onSelect(breadcrumb)}
              >
                {breadcrumb.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
