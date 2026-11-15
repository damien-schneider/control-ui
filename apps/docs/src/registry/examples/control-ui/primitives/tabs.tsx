"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";

const editorFiles = [
  { name: "index.tsx", description: "Application entry point." },
  { name: "tabs.tsx", description: "Browser-style tabs with connected corners." },
  { name: "theme.css", description: "Token-driven tab surfaces." },
];

function ClosableEditorTabs() {
  const [openFiles, setOpenFiles] = useState(editorFiles);
  const [activeFile, setActiveFile] = useState("tabs.tsx");

  const closeFile = (name: string) => {
    const index = openFiles.findIndex((file) => file.name === name);
    const remaining = openFiles.filter((file) => file.name !== name);
    setOpenFiles(remaining);
    if (name === activeFile) setActiveFile(remaining[Math.min(index, remaining.length - 1)]?.name ?? "");
  };

  if (openFiles.length === 0) {
    return (
      <Button
        variant="surface"
        className="self-start"
        onClick={() => {
          setOpenFiles(editorFiles);
          setActiveFile("tabs.tsx");
        }}
      >
        Reopen files
      </Button>
    );
  }

  return (
    <Tabs value={activeFile} onValueChange={setActiveFile}>
      <TabsList variant="browser" aria-label="Open files">
        {openFiles.map((file) => (
          <TabsTab key={file.name} value={file.name} onClose={() => closeFile(file.name)} closeLabel={`Close ${file.name}`}>
            {file.name}
          </TabsTab>
        ))}
      </TabsList>
      {openFiles.map((file) => (
        <TabsPanel key={file.name} value={file.name}>
          {file.description}
        </TabsPanel>
      ))}
    </Tabs>
  );
}

const releaseChannels = ["Stable", "Release candidate", "Beta", "Canary", "Nightly", "Experimental", "Long-term support"];

export function PrimitiveTabsExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-7">
      <Tabs defaultValue="preview">
        <TabsList aria-label="Document view">
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

      <Tabs defaultValue="Stable">
        <TabsList scrollable aria-label="Release channels">
          {releaseChannels.map((channel) => (
            <TabsTab key={channel} value={channel}>
              {channel}
            </TabsTab>
          ))}
        </TabsList>
        {releaseChannels.map((channel) => (
          <TabsPanel key={channel} value={channel}>
            Builds published to the {channel.toLowerCase()} channel.
          </TabsPanel>
        ))}
      </Tabs>

      <ClosableEditorTabs />
    </div>
  );
}
