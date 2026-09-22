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
        <TabsPanel value="preview">Rendered output of the component.</TabsPanel>
        <TabsPanel value="code">The source you install and own.</TabsPanel>
        <TabsPanel value="usage">How to map runner data into props.</TabsPanel>
      </Tabs>

      <Tabs defaultValue="audio" orientation="vertical">
        <TabsList activateOnFocus aria-label="Settings sections">
          <TabsTab value="audio">Audio</TabsTab>
          <TabsTab value="video">Video</TabsTab>
          <TabsTab value="export" disabled>
            Export
          </TabsTab>
        </TabsList>
        <TabsPanel value="audio">Microphone and output volume.</TabsPanel>
        <TabsPanel value="video">Camera and recording quality.</TabsPanel>
      </Tabs>

      <Tabs defaultValue="tabs.tsx">
        <TabsList variant="browser">
          <TabsTab value="index.tsx">index.tsx</TabsTab>
          <TabsTab value="tabs.tsx">tabs.tsx</TabsTab>
          <TabsTab value="theme.css">theme.css</TabsTab>
        </TabsList>
        <TabsPanel value="index.tsx">Application entry point.</TabsPanel>
        <TabsPanel value="tabs.tsx">Browser-style tabs with connected corners.</TabsPanel>
        <TabsPanel value="theme.css">Token-driven tab surfaces.</TabsPanel>
      </Tabs>
    </div>
  );
}
