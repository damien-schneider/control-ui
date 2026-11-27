"use client";

import { Tree, TreeItem, TreeItemContent, TreeItemIndicator, TreeItemLabel, TreeItemTrigger } from "@/components/control-ui/ui/tree";

export function PrimitiveTreeOpenAndExpandExample() {
  return (
    <Tree aria-label="Handbook pages" indicator="slide" defaultValue={["onboarding"]} className="w-full max-w-xs">
      <TreeItem value="onboarding" expandOnClick={false}>
        <TreeItemTrigger>
          <TreeItemIndicator />
          <TreeItemLabel>Onboarding</TreeItemLabel>
        </TreeItemTrigger>
        <TreeItemContent>
          <TreeItem value="onboarding/first-week">
            <TreeItemTrigger>
              <TreeItemIndicator />
              <TreeItemLabel>First week</TreeItemLabel>
            </TreeItemTrigger>
          </TreeItem>
          <TreeItem value="onboarding/tools">
            <TreeItemTrigger>
              <TreeItemIndicator />
              <TreeItemLabel>Tools</TreeItemLabel>
            </TreeItemTrigger>
          </TreeItem>
        </TreeItemContent>
      </TreeItem>
      <TreeItem value="engineering" expandOnClick={false}>
        <TreeItemTrigger>
          <TreeItemIndicator />
          <TreeItemLabel>Engineering</TreeItemLabel>
        </TreeItemTrigger>
        <TreeItemContent>
          <TreeItem value="engineering/reviews">
            <TreeItemTrigger>
              <TreeItemIndicator />
              <TreeItemLabel>Code reviews</TreeItemLabel>
            </TreeItemTrigger>
          </TreeItem>
        </TreeItemContent>
      </TreeItem>
    </Tree>
  );
}
