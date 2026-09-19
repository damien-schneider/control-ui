"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { StatusBadge } from "@/app/(features)/components/status";
import type { ActivePageId, SearchItem } from "@/app/(features)/model/types";
import { matchSearchItems, scoreCommandSearchItem } from "@/app/(features)/registry-api/search";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/control-ui/ui/command";
import type { SidebarMode } from "./types";
import { useSidebarNavigation } from "./use-sidebar-navigation";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

const DocsSearchContext = createContext<(() => void) | undefined>(undefined);

export function DocsSearchTrigger() {
  const openSearch = use(DocsSearchContext);
  if (!openSearch) throw new Error("DocsSearchTrigger must render inside DocsSearchProvider.");

  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label="Search documentation"
      title="Search documentation"
      aria-keyshortcuts="Meta+K Control+K"
      onClick={openSearch}
      data-docs-sidebar-search=""
    >
      <HugeiconsIcon aria-hidden icon={Search01Icon} size={16} strokeWidth={1.7} />
    </Button>
  );
}

// The mobile sidebar unmounts with its sheet, so the dialog and its shortcut live in the shell instead of the header.
export function DocsSearchProvider({
  active,
  items,
  lastSectionMode,
  onLastSectionModeChange,
  children,
}: {
  active: ActivePageId;
  items: SearchItem[];
  lastSectionMode: SidebarMode | null;
  onLastSectionModeChange: (mode: SidebarMode) => void;
  children: ReactNode;
}) {
  const { onNavigate } = useSidebarNavigation({ active, searchItems: items, lastSectionMode, onLastSectionModeChange });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const guideItems = items.filter((item) => item.kind === "Guide");
  const skillItems = items.filter((item) => item.kind === "Skill");
  const skinItems = items.filter((item) => item.kind === "Skin");
  const componentItems = items.filter((item) => item.kind === "Agent");
  const primitiveItems = items.filter((item) => item.kind === "Primitive");
  const supportItems = items.filter((item) => item.kind === "Hook" || item.kind === "Util");
  const blockItems = items.filter((item) => item.kind === "Block");
  const searchResults = query.trim() ? matchSearchItems(items, query) : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCommandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === "/" && !isTypingTarget(event.target);
      if (!isCommandK && !isSlash) return;
      event.preventDefault();
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  }

  function openItem(item: SearchItem) {
    changeOpen(false);
    router.push(item.href);
    onNavigate();
  }

  function renderItem(item: SearchItem) {
    return (
      <CommandItem key={item.id} value={item.id} keywords={[item.name, item.kind, item.summary]} onSelect={() => openItem(item)}>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{item.name}</div>
          <div className="truncate text-label text-muted-foreground">{item.summary}</div>
        </div>
        {item.status ? <StatusBadge status={item.status} compact /> : null}
        <Badge variant="outline" size="sm">
          {item.kind === "Block" ? "Use case" : item.kind}
        </Badge>
      </CommandItem>
    );
  }

  return (
    <DocsSearchContext value={() => setOpen(true)}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={changeOpen}
        title="Search documentation"
        description="Search guides, components, primitives, and patterns."
        commandProps={{ filter: scoreCommandSearchItem }}
      >
        <CommandInput value={query} onValueChange={setQuery} aria-label="Search documentation" placeholder="Search documentation..." />
        <CommandList key={query.trim() || "browse"}>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults ? (
            <CommandGroup>{searchResults.map(renderItem)}</CommandGroup>
          ) : (
            <>
              <CommandGroup heading="Guides">{guideItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Skins">{skinItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Practices">{skillItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Components">{componentItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Primitives">{primitiveItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Support files">{supportItems.map(renderItem)}</CommandGroup>
              <CommandGroup heading="Templates & patterns">{blockItems.map(renderItem)}</CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </DocsSearchContext>
  );
}
