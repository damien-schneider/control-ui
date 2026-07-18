"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";

export function PrimitiveTabsExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTab value="preview">Preview</TabsTab>
          <TabsTab value="code">Code</TabsTab>
          <TabsTab value="usage">Usage</TabsTab>
        </TabsList>
        <TabsPanel value="preview" className="pt-3 text-sm text-muted-foreground">
          Rendered output of the component.
        </TabsPanel>
        <TabsPanel value="code" className="pt-3 text-sm text-muted-foreground">
          The source you install and own.
        </TabsPanel>
        <TabsPanel value="usage" className="pt-3 text-sm text-muted-foreground">
          How to map runner data into props.
        </TabsPanel>
      </Tabs>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTab value="all">All</TabsTab>
          <TabsTab value="mine">Mine</TabsTab>
          <TabsTab value="archived">Archived</TabsTab>
        </TabsList>
      </Tabs>
    </div>
  );
}
