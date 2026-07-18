import type { ReactNode } from "react";

export type FileExplorerEntryDetail = {
  label: string;
  value: ReactNode;
};

export type FileExplorerEntry = {
  id: string;
  name: string;
  kind: "file" | "folder";
  group?: string;
  icon?: ReactNode;
  description?: ReactNode;
  details?: readonly FileExplorerEntryDetail[];
  preview?: ReactNode;
  children?: readonly FileExplorerEntry[];
};

export type FileExplorerLocation = {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  entries: readonly FileExplorerEntry[];
};

export type FileExplorerColumn = {
  id: string;
  label: string;
  entries: readonly FileExplorerEntry[];
  selectedId?: string;
};

export type FileExplorerBreadcrumb = {
  id: string;
  label: string;
  path: readonly string[];
  entry?: FileExplorerEntry;
};

export type FileExplorerResolution = {
  columns: readonly FileExplorerColumn[];
  breadcrumbs: readonly FileExplorerBreadcrumb[];
  selectedEntry?: FileExplorerEntry;
  validPath: readonly string[];
};

export type FileExplorerSearchResult = {
  entry: FileExplorerEntry;
  path: readonly string[];
  parents: readonly string[];
};

export function resolveFileExplorer(location: FileExplorerLocation, selectedPath: readonly string[]): FileExplorerResolution {
  const columns: FileExplorerColumn[] = [];
  const breadcrumbs: FileExplorerBreadcrumb[] = [{ id: location.id, label: location.label, path: [] }];
  const validPath: string[] = [];
  let entries = location.entries;
  let selectedEntry: FileExplorerEntry | undefined;
  let columnLabel = location.label;

  for (let depth = 0; ; depth += 1) {
    const selectedId = selectedPath[depth];
    const selected = selectedId ? entries.find((entry) => entry.id === selectedId) : undefined;

    columns.push({
      id: depth === 0 ? `location:${location.id}` : `folder:${validPath[depth - 1]}`,
      label: columnLabel,
      entries,
      selectedId: selected?.id,
    });

    if (!selected) break;

    selectedEntry = selected;
    validPath.push(selected.id);
    breadcrumbs.push({ id: selected.id, label: selected.name, path: [...validPath], entry: selected });

    if (selected.kind !== "folder") break;
    entries = selected.children ?? [];
    columnLabel = selected.name;
  }

  return { columns, breadcrumbs, selectedEntry, validPath };
}

export function groupFileExplorerItems<T extends { group?: string }>(items: readonly T[]) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const label = item.group ?? "";
    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }

  return [...groups].map(([label, groupedItems]) => ({ label, items: groupedItems }));
}

export function searchFileExplorer(location: FileExplorerLocation, query: string): readonly FileExplorerSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return [];

  const results: FileExplorerSearchResult[] = [];

  function visit(entries: readonly FileExplorerEntry[], path: readonly string[], parents: readonly string[]) {
    for (const entry of entries) {
      const entryPath = [...path, entry.id];
      if (entry.name.toLocaleLowerCase().includes(normalizedQuery)) results.push({ entry, path: entryPath, parents });
      if (entry.kind === "folder" && entry.children) visit(entry.children, entryPath, [...parents, entry.name]);
    }
  }

  visit(location.entries, [], []);
  return results;
}
