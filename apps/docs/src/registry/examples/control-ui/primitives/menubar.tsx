"use client";

import { useState } from "react";

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/control-ui/ui/menubar";

export function PrimitiveMenubarExample() {
  const [last, setLast] = useState<string | null>(null);
  const run = (label: string) => () => setLast(label);

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
            <MenubarItem onClick={run("Zoom in")}>Zoom in</MenubarItem>
            <MenubarItem onClick={run("Zoom out")}>Zoom out</MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>Reset zoom</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <span className="text-[11px] text-muted-foreground">{last ? `Last action: ${last}` : "No action yet"}</span>
    </div>
  );
}
