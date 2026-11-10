"use client";

import { useState } from "react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/control-ui/ui/menubar";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveMenubarExample() {
  const [last, setLast] = useState<string | null>(null);
  const run = (label: string) => () => setLast(label);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [statusBarVisible, setStatusBarVisible] = useState(false);
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>Document</MenubarLabel>
              <MenubarItem onClick={run("New file")}>
                New file
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={run("Open…")}>
                Open…
                <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Export</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={run("Export PDF")}>PDF</MenubarItem>
                <MenubarItem onClick={run("Export PNG")}>PNG</MenubarItem>
                <MenubarItem onClick={run("Export SVG")}>SVG</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={run("Print")}>
              Print
              <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={run("Undo")}>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={run("Redo")}>
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={run("Cut")}>Cut</MenubarItem>
            <MenubarItem onClick={run("Copy")}>Copy</MenubarItem>
            <MenubarItem onClick={run("Paste")}>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>Panels</MenubarLabel>
              <MenubarCheckboxItem checked={sidebarVisible} onCheckedChange={setSidebarVisible}>
                Sidebar
              </MenubarCheckboxItem>
              <MenubarCheckboxItem checked={statusBarVisible} onCheckedChange={setStatusBarVisible}>
                Status bar
              </MenubarCheckboxItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarLabel>Density</MenubarLabel>
              <MenubarRadioGroup value={density} onValueChange={setDensity}>
                <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
                <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem onClick={run("Zoom in")}>Zoom in</MenubarItem>
            <MenubarItem onClick={run("Zoom out")}>Zoom out</MenubarItem>
            <MenubarItem disabled>Reset zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Text size="caption" tone="muted">
        {last ? `Last action: ${last}` : "No action yet"}
      </Text>
    </div>
  );
}
