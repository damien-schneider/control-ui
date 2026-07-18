"use client";

import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";

import type { TableOfContentsProps, TableOfContentsVariant } from "@/components/control-ui/contracts";
import { TrackHighlight } from "@/components/control-ui/extensions/track-highlight";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

const DETECTION_MARGIN = "-80px 0px -20% 0px";
const indentByDepth = ["pl-3", "pl-5", "pl-7", "pl-9", "pl-11", "pl-14"] as const;

// Row selectors highlight engine resolves in track; state = one moving band, not per-row border that snaps.
const TOC_ITEM_SELECTOR = '[data-control-ui="table-of-contents"][data-slot="item"]';
const TOC_ACTIVE_SELECTOR = '[data-control-ui="table-of-contents"][data-slot="item"][data-active]';

// Rows only shift own text color; trail/background moved to shared highlight band below so indicator can grow/glide between ranges.
const tableOfContentsItemClass =
  "block py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none motion-reduce:transition-none data-[active]:text-foreground";

// Moving band rests on union of active rows, transitions 4 insets (inline, engine-written) via --duration-* tokens — kill-switch collapses to instant snap free.
// Each edge = one inset, so growing range's top never drags its bottom (and vice-versa).
// `trail` = inner bar, `background` = filled band, `both` layers them.
// ring-0/shadow-none strip the extension's default pill chrome — the ToC band is a flat wash/trail, not a card.
const tableOfContentsHighlightVariant = cva("ring-0 shadow-none duration-[var(--duration-base)] ease-[var(--ease-emphasized)]", {
  variants: {
    variant: {
      background: "rounded-md bg-foreground/4",
      trail: "rounded-none bg-transparent",
      both: "rounded-md bg-foreground/4",
    },
  },
  defaultVariants: {
    variant: "both",
  },
});

const tableOfContentsTrailClass = "absolute inset-y-0 left-0 w-0.5 rounded-full bg-foreground";

function getScrollContainer(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) return node;
    node = node.parentElement;
  }
  return null;
}

export function useVisibleSections(ids: string[]): string[] {
  const [visibleState, setVisibleState] = useState<{ idsKey: string; visibleIds: string[] }>({ idsKey: "", visibleIds: [] });
  const idsKey = ids.join("|");

  useEffect(() => {
    const idList = idsKey ? idsKey.split("|") : [];
    const elements = idList.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const order = new Map(elements.map((el, index) => [el.id, index]));
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setVisibleState({
          idsKey,
          visibleIds: [...visible].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)),
        });
      },
      { root: getScrollContainer(elements[0]), rootMargin: DETECTION_MARGIN, threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [idsKey]);

  return visibleState.idsKey === idsKey ? visibleState.visibleIds : [];
}

type TocNode = Omit<TableOfContentsProps["items"][number], "children" | "level"> & {
  depth: number;
  level: number;
  children?: TocNode[];
};

function collectLevels(items: TableOfContentsProps["items"], fallbackLevel = 2): number[] {
  return items.flatMap((item) => {
    const level = item.level ?? fallbackLevel;
    return [level, ...collectLevels(item.children ?? [], level + 1)];
  });
}

function normalizeItems(items: TableOfContentsProps["items"], baseLevel: number, fallbackLevel = 2, nestingDepth = 0): TocNode[] {
  return items.map((item) => {
    const level = item.level ?? fallbackLevel;
    const depth = Math.max(nestingDepth, Math.max(0, level - baseLevel));
    const nestedItems = item.children;
    const children =
      nestedItems && nestedItems.length > 0 ? normalizeItems(nestedItems, baseLevel, level + 1, nestingDepth + 1) : undefined;

    return {
      ...item,
      level,
      depth,
      children,
    };
  });
}

function flattenItems(items: TocNode[]): TocNode[] {
  return items.flatMap((item) => [item, ...flattenItems(item.children ?? [])]);
}

function itemIndentClass(depth: number) {
  return indentByDepth[Math.min(depth, indentByDepth.length - 1)];
}

function activeIdsInRange(visibleIds: string[], targetIds: string[]) {
  let firstIndex = targetIds.length;
  let lastIndex = -1;

  for (const id of visibleIds) {
    const index = targetIds.indexOf(id);
    if (index < 0) continue;
    firstIndex = Math.min(firstIndex, index);
    lastIndex = Math.max(lastIndex, index);
  }

  if (lastIndex < 0) return new Set<string>();
  return new Set(targetIds.slice(firstIndex, lastIndex + 1));
}

export function TableOfContents({ items, label = "On this page", variant = "both", className, ...props }: TableOfContentsProps) {
  const baseLevel = Math.min(...collectLevels(items), 2);
  const normalizedItems = normalizeItems(items, baseLevel);
  const flatItems = flattenItems(normalizedItems);
  const targetIds = flatItems.map((item) => item.href.replace(/^#/, ""));
  const visibleIds = useVisibleSections(targetIds);
  const activeSet = activeIdsInRange(visibleIds, targetIds);

  if (items.length === 0) return null;

  return (
    <nav
      data-control-ui="table-of-contents"
      data-slot="root"
      data-variant={variant}
      aria-label={label}
      className={cn(
        "sticky top-6 rounded-2xl border border-border/70 bg-card/80 p-4 text-sm shadow-sm backdrop-blur",
        skinSlot("table-of-contents", "root", {}),
        className,
      )}
      {...props}
    >
      <p className="mb-3 text-xs font-medium text-muted-foreground">{label}</p>
      {/* `relative isolate` scopes stacking: rail at -z-20, band at -z-10 (above rail, behind text) — nothing leaks onto nav's portals. */}
      <div data-control-ui="table-of-contents" data-slot="track" className="relative isolate">
        <span
          aria-hidden
          data-control-ui="table-of-contents"
          data-slot="rail"
          className="pointer-events-none absolute inset-y-0 left-0 -z-20 w-px bg-border/60"
        />
        <TrackHighlight
          itemSelector={TOC_ITEM_SELECTOR}
          activeSelector={TOC_ACTIVE_SELECTOR}
          range
          followHover={false}
          className={tableOfContentsHighlightVariant({ variant })}
        >
          {variant !== "background" && (
            <div aria-hidden data-control-ui="table-of-contents" data-slot="trail" className={tableOfContentsTrailClass} />
          )}
        </TrackHighlight>
        <TocList items={normalizedItems} activeSet={activeSet} variant={variant} root />
      </div>
    </nav>
  );
}

function TocList({
  items,
  activeSet,
  variant,
  root = false,
}: {
  items: TocNode[];
  activeSet: Set<string>;
  variant: TableOfContentsVariant;
  root?: boolean;
}) {
  return (
    <ul
      data-control-ui="table-of-contents"
      data-slot="list"
      data-nested={root ? undefined : "true"}
      className={cn(root && skinSlot("table-of-contents", "list", {}))}
    >
      {items.map((item) => {
        const targetId = item.href.replace(/^#/, "");
        const isActive = activeSet.has(targetId);

        return (
          <li key={item.href}>
            <a
              data-control-ui="table-of-contents"
              data-slot="item"
              data-active={isActive || undefined}
              data-variant={variant}
              data-level={item.level}
              data-depth={item.depth}
              aria-current={isActive ? "location" : undefined}
              href={item.href}
              className={cn(
                tableOfContentsItemClass,
                item.depth === 0 && "font-medium",
                itemIndentClass(item.depth),
                skinSlot("table-of-contents", "item", { active: isActive, variant }),
              )}
            >
              {item.label}
            </a>
            {item.children && <TocList items={item.children} activeSet={activeSet} variant={variant} />}
          </li>
        );
      })}
    </ul>
  );
}
