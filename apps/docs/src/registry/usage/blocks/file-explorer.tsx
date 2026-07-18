"use client";

import { FileExplorerBlock, type FileExplorerLocation } from "@/components/control-ui/blocks/file-explorer";

const locations: readonly FileExplorerLocation[] = [
  {
    id: "workspace",
    label: "Workspace",
    group: "Locations",
    entries: [
      {
        id: "src",
        name: "src",
        kind: "folder",
        children: [
          { id: "app", name: "app.tsx", kind: "file" },
          { id: "styles", name: "styles.css", kind: "file" },
        ],
      },
      { id: "readme", name: "README.md", kind: "file" },
    ],
  },
];

export default function FileExplorerPage() {
  return <FileExplorerBlock locations={locations} defaultActiveLocationId="workspace" defaultSelectedPath={["src"]} />;
}
