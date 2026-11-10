"use client";

import { useState } from "react";

import { Tree, TreeItem, TreeItemContent, TreeItemIndicator, TreeItemLabel, TreeItemTrigger } from "@/components/control-ui/ui/tree";
import { Text } from "@/components/control-ui/ui/typography";

type FileNode = { path: string; name: string; children?: FileNode[] };

const projectFiles: FileNode[] = [
  {
    path: "src",
    name: "src",
    children: [
      { path: "src/app.tsx", name: "app.tsx" },
      { path: "src/routes.ts", name: "routes.ts" },
      {
        path: "src/lib",
        name: "lib",
        children: [
          { path: "src/lib/cn.ts", name: "cn.ts" },
          { path: "src/lib/format.ts", name: "format.ts" },
        ],
      },
    ],
  },
  { path: "package.json", name: "package.json" },
  { path: "README.md", name: "README.md" },
];

function FileTreeItem({ node }: { node: FileNode }) {
  return (
    <TreeItem value={node.path}>
      <TreeItemTrigger>
        <TreeItemIndicator />
        <TreeItemLabel>{node.name}</TreeItemLabel>
      </TreeItemTrigger>
      {node.children ? (
        <TreeItemContent>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} />
          ))}
        </TreeItemContent>
      ) : null}
    </TreeItem>
  );
}

export function PrimitiveTreeMultipleExample() {
  const [selectedPaths, setSelectedPaths] = useState(["src/app.tsx", "src/lib/cn.ts"]);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Tree
        aria-label="Files to stage"
        selectionMode="multiple"
        defaultExpandedValue={["src", "src/lib"]}
        value={selectedPaths}
        onValueChange={setSelectedPaths}
      >
        {projectFiles.map((node) => (
          <FileTreeItem key={node.path} node={node} />
        ))}
      </Tree>
      <Text size="caption" tone="muted" role="status">
        {selectedPaths.length === 0 ? "No files selected" : `${selectedPaths.length} selected: ${selectedPaths.join(", ")}`}
      </Text>
    </div>
  );
}
