"use client";

import {
  AppWindowIcon,
  Clock3Icon,
  CloudIcon,
  Columns3Icon,
  DownloadIcon,
  FileCode2Icon,
  FileJsonIcon,
  FileTextIcon,
  FolderGit2Icon,
  Grid2X2Icon,
  HardDriveIcon,
  HomeIcon,
  ImageIcon,
  ListIcon,
  MonitorIcon,
  MoreHorizontalIcon,
  Music2Icon,
  Share2Icon,
  TagIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { FileExplorerBlock, type FileExplorerLocation } from "@/components/control-ui/blocks/file-explorer";
import { Button } from "@/components/control-ui/ui/button";
import { ButtonGroup } from "@/components/control-ui/ui/button-group";

const projectFiles = [
  {
    id: "readme",
    name: "README.md",
    kind: "file" as const,
    icon: <FileTextIcon className="text-[oklch(0.72_0.14_235)]" />,
    description: "Markdown document",
    details: [
      { label: "Size", value: "8 KB" },
      { label: "Modified", value: "Today, 10:42" },
      { label: "Kind", value: "Markdown" },
    ],
    preview: (
      <div className="overflow-hidden rounded-[var(--radius-panel)] border bg-card text-left shadow-sm">
        <div className="border-b px-4 py-2 text-caption font-medium text-muted-foreground">README.md</div>
        <div className="space-y-3 p-4">
          <h3 className="text-base font-semibold">Control UI</h3>
          <p className="text-caption leading-5 text-muted-foreground">
            An owned-source component registry for polished agent interfaces, complete blocks, and swappable skins.
          </p>
          <div className="rounded-[var(--radius-control)] bg-foreground/6 px-3 py-2 font-mono text-micro text-foreground">
            bun run validate
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "apps",
    name: "apps",
    kind: "folder" as const,
    children: [
      {
        id: "docs",
        name: "docs",
        kind: "folder" as const,
        children: [
          { id: "app", name: "app", kind: "folder" as const, children: [] },
          { id: "registry", name: "registry", kind: "folder" as const, children: [] },
        ],
      },
    ],
  },
  {
    id: "packages",
    name: "packages",
    kind: "folder" as const,
    children: [{ id: "skills", name: "skills", kind: "folder" as const, children: [] }],
  },
  {
    id: "package-json",
    name: "package.json",
    kind: "file" as const,
    icon: <FileJsonIcon className="text-[oklch(0.76_0.16_75)]" />,
    description: "JSON document",
    details: [
      { label: "Size", value: "2 KB" },
      { label: "Modified", value: "Yesterday" },
    ],
  },
  {
    id: "biome",
    name: "biome.json",
    kind: "file" as const,
    icon: <FileCode2Icon className="text-[oklch(0.73_0.16_300)]" />,
    description: "Configuration file",
  },
];

const locations: readonly FileExplorerLocation[] = [
  {
    id: "recents",
    label: "Recents",
    group: "Shortcuts",
    icon: <Clock3Icon />,
    entries: [
      { id: "design", name: "design-notes.md", kind: "file", group: "Today" },
      { id: "report", name: "registry-report.json", kind: "file", group: "Yesterday" },
    ],
  },
  {
    id: "shared",
    label: "Shared",
    group: "Shortcuts",
    icon: <UsersIcon />,
    entries: [{ id: "team", name: "Team files", kind: "folder", children: [] }],
  },
  {
    id: "applications",
    label: "Applications",
    group: "Favorites",
    icon: <AppWindowIcon />,
    entries: [{ id: "control-ui-app", name: "Control UI.app", kind: "file" }],
  },
  {
    id: "desktop",
    label: "Desktop",
    group: "Favorites",
    icon: <MonitorIcon />,
    entries: [{ id: "screenshots", name: "Screenshots", kind: "folder", children: [] }],
  },
  {
    id: "downloads",
    label: "Downloads",
    group: "Favorites",
    icon: <DownloadIcon />,
    entries: [{ id: "archive", name: "control-ui.zip", kind: "file" }],
  },
  {
    id: "pictures",
    label: "Pictures",
    group: "Favorites",
    icon: <ImageIcon />,
    entries: [{ id: "previews", name: "Component previews", kind: "folder", children: [] }],
  },
  {
    id: "music",
    label: "Music",
    group: "Favorites",
    icon: <Music2Icon />,
    entries: [],
  },
  {
    id: "github",
    label: "GitHub",
    group: "Favorites",
    icon: <FolderGit2Icon />,
    entries: [
      { id: "control-ui", name: "control-ui", kind: "folder", children: projectFiles },
      { id: "mastra", name: "mastra", kind: "folder", children: [] },
      { id: "platform", name: "platform", kind: "folder", children: [] },
      { id: "one-rec", name: "one-rec", kind: "folder", children: [] },
      { id: "website", name: "mastra-website", kind: "folder", children: [] },
    ],
  },
  {
    id: "icloud",
    label: "iCloud Drive",
    group: "Locations",
    icon: <CloudIcon />,
    entries: [{ id: "documents", name: "Documents", kind: "folder", children: [] }],
  },
  {
    id: "home",
    label: "damien",
    group: "Locations",
    icon: <HomeIcon />,
    entries: [
      { id: "resolve", name: "DaVinci Resolve Media", kind: "folder", group: "Previous 30 Days", children: [] },
      { id: "slack-export", name: "daniel-slack-export.json", kind: "file", group: "June" },
      { id: "screen-studio", name: "Screen Studio Projects", kind: "folder", group: "April", children: [] },
      { id: "splice", name: "Splice", kind: "folder", group: "March", children: [] },
      { id: "clawd", name: "clawd", kind: "folder", group: "February", children: [] },
    ],
  },
  {
    id: "computer",
    label: "Damien’s MacBook Pro",
    group: "Locations",
    icon: <HardDriveIcon />,
    entries: [{ id: "macintosh", name: "Macintosh HD", kind: "folder", children: [] }],
  },
];

export function FileExplorerExample() {
  return (
    <div className="h-[min(720px,80vh)] min-h-150 w-full overflow-hidden rounded-[var(--radius-panel)] border bg-background shadow-md">
      <FileExplorerBlock
        layout="contained"
        locations={locations}
        defaultActiveLocationId="github"
        defaultSelectedPath={["control-ui", "readme"]}
        headerActions={<FinderActions />}
        sidebarFooter={
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Trash2Icon className="size-4" />
            Trash
          </Button>
        }
      />
    </div>
  );
}

function FinderActions() {
  return (
    <>
      <ButtonGroup aria-label="View mode">
        <Button variant="surface" size="xs" aria-label="Grid view" disabled>
          <Grid2X2Icon className="size-3.5" />
        </Button>
        <Button variant="surface" size="xs" aria-label="List view" disabled>
          <ListIcon className="size-3.5" />
        </Button>
        <Button variant="surface" size="xs" active aria-label="Column view">
          <Columns3Icon className="size-3.5" />
        </Button>
      </ButtonGroup>
      <Button variant="ghost" size="sm" iconOnly aria-label="Share" disabled>
        <Share2Icon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="sm" iconOnly aria-label="Tags" disabled>
        <TagIcon className="size-3.5" />
      </Button>
      <Button variant="ghost" size="sm" iconOnly aria-label="More actions" disabled>
        <MoreHorizontalIcon className="size-3.5" />
      </Button>
    </>
  );
}
