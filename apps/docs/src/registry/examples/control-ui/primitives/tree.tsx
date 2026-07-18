"use client";

import { Tree, TreeItem, TreeItemContent, TreeItemIndicator, TreeItemLabel, TreeItemTrigger } from "@/components/control-ui/ui/tree";

export function PrimitiveTreeExample() {
  return (
    <Tree
      aria-label="Project files"
      indicator="slide"
      defaultExpandedValue={["src", "src/lib"]}
      defaultValue={["src/app.tsx"]}
      className="w-full max-w-xs text-sm"
    >
      <TreeItem value="src">
        <TreeItemTrigger>
          <TreeItemIndicator />
          <TreeItemLabel>src</TreeItemLabel>
        </TreeItemTrigger>
        <TreeItemContent>
          <TreeItem value="src/app.tsx">
            <TreeItemTrigger>
              <TreeItemIndicator />
              <TreeItemLabel>app.tsx</TreeItemLabel>
            </TreeItemTrigger>
          </TreeItem>
          <TreeItem value="src/lib">
            <TreeItemTrigger>
              <TreeItemIndicator />
              <TreeItemLabel>lib</TreeItemLabel>
            </TreeItemTrigger>
            <TreeItemContent>
              <TreeItem value="src/lib/cn.ts">
                <TreeItemTrigger>
                  <TreeItemIndicator />
                  <TreeItemLabel>cn.ts</TreeItemLabel>
                </TreeItemTrigger>
              </TreeItem>
              <TreeItem value="src/lib/format.ts">
                <TreeItemTrigger>
                  <TreeItemIndicator />
                  <TreeItemLabel>format.ts</TreeItemLabel>
                </TreeItemTrigger>
              </TreeItem>
            </TreeItemContent>
          </TreeItem>
        </TreeItemContent>
      </TreeItem>
      <TreeItem value="README.md">
        <TreeItemTrigger>
          <TreeItemIndicator />
          <TreeItemLabel>README.md</TreeItemLabel>
        </TreeItemTrigger>
      </TreeItem>
    </Tree>
  );
}
