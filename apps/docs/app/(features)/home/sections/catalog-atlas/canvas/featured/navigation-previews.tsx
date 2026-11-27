"use client";

import { FileIcon, FolderIcon, FolderOpenIcon, type LucideIcon, PlusIcon, SearchIcon, SettingsIcon, SunMoonIcon } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/control-ui/ui/command";
import { Kbd, KbdGroup } from "@/components/control-ui/ui/kbd";
import { Tree, TreeItem, TreeItemContent, TreeItemIndicator, TreeItemLabel, TreeItemTrigger } from "@/components/control-ui/ui/tree";
import { Text } from "@/components/control-ui/ui/typography";
import { PreviewPanel } from "./preview-panel";

const suggestions: readonly { value: string; label: string; icon: LucideIcon; keys: readonly string[] }[] = [
  { value: "new-conversation", label: "New conversation", icon: PlusIcon, keys: ["⌘", "N"] },
  { value: "search-components", label: "Search components", icon: SearchIcon, keys: ["⌘", "K"] },
  { value: "toggle-theme", label: "Toggle theme", icon: SunMoonIcon, keys: ["⌘", "⇧", "L"] },
  { value: "open-settings", label: "Open settings", icon: SettingsIcon, keys: ["⌘", ","] },
];

const NO_SELECTION_SO_MOUNT_DOES_NOT_SCROLL_THE_PAGE = "none";

export function CommandPreview() {
  return (
    <Command defaultValue={NO_SELECTION_SO_MOUNT_DOES_NOT_SCROLL_THE_PAGE} className="w-full">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Suggestions">
          {suggestions.map(({ value, label, icon: Icon, keys }) => (
            <CommandItem key={value} value={value} keywords={[label]}>
              <Icon aria-hidden="true" />
              {label}
              <CommandShortcut>
                <KbdGroup>
                  {keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const componentFiles = ["color-picker.tsx", "emoji-picker.tsx", "tree.tsx"];

function TreeGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Text tone="muted" className="flex shrink-0">
      <Icon aria-hidden="true" className="size-4" />
    </Text>
  );
}

function FileItem({ value, name }: { value: string; name: string }) {
  return (
    <TreeItem value={value}>
      <TreeItemTrigger>
        <TreeItemIndicator />
        <TreeGlyph icon={FileIcon} />
        <TreeItemLabel>{name}</TreeItemLabel>
      </TreeItemTrigger>
    </TreeItem>
  );
}

export function TreePreview() {
  const [expanded, setExpanded] = useState(["src", "src/components"]);

  return (
    <PreviewPanel className="p-1.5">
      <Tree
        aria-label="Project files"
        expandedValue={expanded}
        onExpandedChange={setExpanded}
        defaultValue={["src/components/color-picker.tsx"]}
        className="w-full"
      >
        <TreeItem value="src">
          <TreeItemTrigger>
            <TreeItemIndicator />
            <TreeGlyph icon={expanded.includes("src") ? FolderOpenIcon : FolderIcon} />
            <TreeItemLabel>src</TreeItemLabel>
          </TreeItemTrigger>
          <TreeItemContent>
            <TreeItem value="src/components">
              <TreeItemTrigger>
                <TreeItemIndicator />
                <TreeGlyph icon={expanded.includes("src/components") ? FolderOpenIcon : FolderIcon} />
                <TreeItemLabel>components</TreeItemLabel>
              </TreeItemTrigger>
              <TreeItemContent>
                {componentFiles.map((name) => (
                  <FileItem key={name} value={`src/components/${name}`} name={name} />
                ))}
              </TreeItemContent>
            </TreeItem>
            <TreeItem value="src/lib">
              <TreeItemTrigger>
                <TreeItemIndicator />
                <TreeGlyph icon={expanded.includes("src/lib") ? FolderOpenIcon : FolderIcon} />
                <TreeItemLabel>lib</TreeItemLabel>
              </TreeItemTrigger>
              <TreeItemContent>
                <FileItem value="src/lib/cn.ts" name="cn.ts" />
              </TreeItemContent>
            </TreeItem>
          </TreeItemContent>
        </TreeItem>
        <FileItem value="package.json" name="package.json" />
      </Tree>
    </PreviewPanel>
  );
}
