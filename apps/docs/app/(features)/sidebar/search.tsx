"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/app/(features)/components/status";
import type { SearchItem } from "@/app/(features)/model/types";
import { matchSearchItems, scoreCommandSearchItem } from "@/app/(features)/registry-api/search";
import { cn } from "@/components/control-ui/lib/cn";
import { floatingSurfaceClasses } from "@/components/control-ui/surface-variants";
import { Badge } from "@/components/control-ui/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/control-ui/ui/command";
import { ToolbarButton, ToolbarInput } from "@/components/control-ui/ui/toolbar";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

export function SidebarSearch({ items, onNavigate }: { items: SearchItem[]; onNavigate: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
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
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function closeSearch() {
    setQuery("");
    inputRef.current?.blur();
  }

  function openItem(item: SearchItem) {
    closeSearch();
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
          {item.kind}
        </Badge>
      </CommandItem>
    );
  }

  return (
    <Command
      className="peer contents"
      filter={scoreCommandSearchItem}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setQuery("");
      }}
    >
      <div className="group/search relative flex min-w-0 flex-[0_0_var(--control-h-sm)] items-center rounded-[var(--toolbar-item-radius-fit)] text-background/70 outline-hidden transition-[flex-basis,background-color,color] duration-[var(--duration-base)] ease-[var(--ease-standard)] focus-within:flex-[1_1_100%] focus-within:bg-background/10 focus-within:text-background hover:bg-background/10 hover:text-background">
        <span className="pointer-events-none absolute inset-y-0 left-0 z-[1] flex w-[var(--control-h-sm)] items-center justify-center">
          <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.7} />
        </span>
        <ToolbarInput
          render={<CommandPrimitive.Input value={query} onValueChange={setQuery} />}
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeSearch();
          }}
          aria-label="Search documentation"
          placeholder="Search documentation..."
          className="relative w-full min-w-0 cursor-text px-[var(--control-h-sm)] opacity-0 transition-opacity duration-[var(--duration-fast)] group-focus-within/search:opacity-100"
        />
        <ToolbarButton
          iconOnly
          aria-label="Close search"
          title="Close search"
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => {
            closeSearch();
            event.currentTarget.blur();
          }}
          className="pointer-events-none invisible absolute inset-y-0 right-0 opacity-0 transition-[opacity,visibility] duration-[var(--duration-fast)] group-focus-within/search:visible group-focus-within/search:pointer-events-auto group-focus-within/search:opacity-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={1.7} />
        </ToolbarButton>

        <div
          data-surface="floating"
          className={cn(
            "pointer-events-none invisible absolute bottom-[calc(100%+0.75rem)] left-1/2 z-50 w-[min(22rem,calc(100vw-1rem))] -translate-x-1/2 translate-y-1 overflow-hidden border-0 p-0 opacity-0 transition-[opacity,transform,visibility] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-focus-within/search:pointer-events-auto group-focus-within/search:visible group-focus-within/search:translate-y-0 group-focus-within/search:opacity-100",
            floatingSurfaceClasses,
          )}
        >
          <CommandList key={query.trim() || "browse"}>
            <CommandEmpty>No results found.</CommandEmpty>
            {searchResults ? (
              <CommandGroup>{searchResults.map(renderItem)}</CommandGroup>
            ) : (
              <>
                <CommandGroup heading="Guides">{guideItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="Skins">{skinItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="Skills">{skillItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="AI">{componentItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="Primitives">{primitiveItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="Support files">{supportItems.map(renderItem)}</CommandGroup>
                <CommandGroup heading="Blocks">{blockItems.map(renderItem)}</CommandGroup>
              </>
            )}
          </CommandList>
        </div>
      </div>
    </Command>
  );
}
