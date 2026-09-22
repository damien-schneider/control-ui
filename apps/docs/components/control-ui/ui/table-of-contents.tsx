"use client";

import type { ComponentProps, CSSProperties, ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { TableOfContentsKnobStyle } from "@/components/control-ui/knob-contracts/table-of-contents-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type TocItem = {
  href: string;
  label: string;
  level?: number;
  children?: TocItem[];
};

export const tableOfContentsVariants = ["range", "progress"] as const;

export type TableOfContentsVariant = (typeof tableOfContentsVariants)[number];

export type TableOfContentsProps = Omit<Omit<ComponentProps<"nav">, "children">, "style"> & {
  style?: CSSProperties & TableOfContentsKnobStyle;
} & {
  items: TocItem[];
  label?: string;
  variant?: TableOfContentsVariant;
  indicator?: ReactNode;
};

const DETECTION_MARGIN = "-80px 0px -20% 0px";

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
    const firstElement = elements[0];
    if (!firstElement) return;

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
      { root: getScrollContainer(firstElement), rootMargin: DETECTION_MARGIN, threshold: 0 },
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

type TocItemStyle = CSSProperties & { "--_toc-depth": number };

type RailStop = { top: number; center: number; bottom: number };

type RailGeometry = { path: string; length: number; stops: Map<string, RailStop> };

type ItemElements = Map<string, HTMLElement>;

type RailPoint = { x: number; y: number };

type TrailStyle = CSSProperties & Record<`--_toc-${string}`, string>;

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

function findActiveItems(visibleIds: string[], flatItems: TocNode[], targetIds: string[]): TocNode[] {
  const indexes = visibleIds.map((id) => targetIds.indexOf(id)).filter((index) => index >= 0);
  if (indexes.length === 0) return [];
  return flatItems.slice(Math.min(...indexes), Math.max(...indexes) + 1);
}

function readLengthKnob(style: CSSStyleDeclaration, knob: `--cui-table-of-contents-${string}`) {
  return Number.parseFloat(style.getPropertyValue(knob)) || 0;
}

function inDocumentOrder([, a]: [string, HTMLElement], [, b]: [string, HTMLElement]) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function measureRail(track: HTMLElement, itemElements: ItemElements): RailGeometry {
  const style = getComputedStyle(track);
  const indentSize = readLengthKnob(style, "--cui-table-of-contents-item-indent-size");
  const strokeInset =
    Math.max(readLengthKnob(style, "--cui-table-of-contents-rail-size"), readLengthKnob(style, "--cui-table-of-contents-trail-size")) / 2;
  const isRtl = style.direction === "rtl";
  const points: RailPoint[] = [];
  let length = 0;

  const lineTo = (x: number, y: number) => {
    const previous = points.at(-1);
    if (previous) length += Math.hypot(x - previous.x, y - previous.y);
    points.push({ x, y });
    return length;
  };

  const stops = new Map<string, RailStop>();
  for (const [href, item] of [...itemElements].sort(inDocumentOrder)) {
    const inlineOffset = Number(item.dataset.depth) * indentSize + strokeInset;
    const x = isRtl ? track.clientWidth - inlineOffset : inlineOffset;
    const top = item.offsetTop;
    const previous = points.at(-1);
    const topStop = lineTo(previous?.x ?? x, top);
    if (previous && previous.x !== x) lineTo(x, top + Math.min(indentSize, item.offsetHeight / 2));
    stops.set(href, { top: topStop, center: lineTo(x, top + item.offsetHeight / 2), bottom: lineTo(x, top + item.offsetHeight) });
  }

  return { path: points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(""), length, stops };
}

function useRailGeometry(trackRef: RefObject<HTMLElement | null>, itemElements: ItemElements) {
  const [rail, setRail] = useState<RailGeometry | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setRail(measureRail(track, itemElements));
    const resizeObserver = new ResizeObserver(measure);
    const mutationObserver = new MutationObserver(measure);
    resizeObserver.observe(track);
    mutationObserver.observe(track, { subtree: true, childList: true, attributeFilter: ["data-depth"] });
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [trackRef, itemElements]);

  return rail;
}

function trailStyle(rail: RailGeometry, activeItems: TocNode[], variant: TableOfContentsVariant): TrailStyle {
  const firstStop = rail.stops.get(activeItems[0]?.href ?? "");
  const lastStop = rail.stops.get(activeItems.at(-1)?.href ?? "");
  const start = variant === "progress" ? 0 : (firstStop?.top ?? 0);
  const end = variant === "progress" ? (firstStop?.center ?? 0) : (lastStop?.bottom ?? 0);

  return {
    "--_toc-rail-length": `${rail.length}px`,
    "--_toc-trail-start": `${start}px`,
    "--_toc-trail-length": `${Math.max(0, end - start)}px`,
    "--_toc-indicator-distance": `${firstStop?.center ?? 0}px`,
  };
}

export function TableOfContents({
  items,
  label = "On this page",
  variant = "range",
  indicator,
  className,
  style,
  ...props
}: TableOfContentsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [itemElements] = useState<ItemElements>(() => new Map());
  const baseLevel = Math.min(...collectLevels(items), 2);
  const normalizedItems = normalizeItems(items, baseLevel);
  const flatItems = flattenItems(normalizedItems);
  const targetIds = flatItems.map((item) => item.href.replace(/^#/, ""));
  const visibleIds = useVisibleSections(targetIds);
  const activeItems = findActiveItems(visibleIds, flatItems, targetIds);
  const activeHrefs = new Set(activeItems.map((item) => item.href));
  const rail = useRailGeometry(trackRef, itemElements);
  const hasActiveSection = activeItems.length > 0;

  if (items.length === 0) return null;

  return (
    <nav
      data-control-ui="table-of-contents"
      data-control-family="table-of-contents"
      data-slot="root"
      data-variant={variant}
      aria-label={label}
      className={cn("sticky top-6", className)}
      style={style}
      {...props}
    >
      <p data-control-ui="table-of-contents" data-control-family="table-of-contents" data-slot="label">
        {label}
      </p>
      <div
        ref={trackRef}
        data-control-ui="table-of-contents"
        data-control-family="table-of-contents"
        data-slot="track"
        className="relative"
        style={rail ? trailStyle(rail, activeItems, variant) : undefined}
      >
        {rail && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <path data-control-ui="table-of-contents" data-control-family="table-of-contents" data-slot="rail" d={rail.path} />
            <path
              data-control-ui="table-of-contents"
              data-control-family="table-of-contents"
              data-slot="trail"
              data-visible={hasActiveSection || undefined}
              d={rail.path}
            />
          </svg>
        )}
        <TocList items={normalizedItems} activeHrefs={activeHrefs} itemElements={itemElements} root />
        {rail && indicator && (
          <span
            aria-hidden
            data-control-ui="table-of-contents"
            data-control-family="table-of-contents"
            data-slot="indicator"
            data-visible={hasActiveSection || undefined}
            className="pointer-events-none absolute top-0 left-0"
            style={{ offsetPath: `path("${rail.path}")` }}
          >
            {indicator}
          </span>
        )}
      </div>
    </nav>
  );
}

function TocList({
  items,
  activeHrefs,
  itemElements,
  root = false,
}: {
  items: TocNode[];
  activeHrefs: Set<string>;
  itemElements: ItemElements;
  root?: boolean;
}) {
  return (
    <ul
      data-control-ui="table-of-contents"
      data-control-family="table-of-contents"
      data-slot="list"
      data-nested={root ? undefined : "true"}
    >
      {items.map((item) => {
        const isActive = activeHrefs.has(item.href);
        const itemStyle: TocItemStyle = { "--_toc-depth": item.depth };

        return (
          <li key={item.href}>
            <a
              ref={(element) => {
                if (!element) return;
                itemElements.set(item.href, element);
                return () => {
                  itemElements.delete(item.href);
                };
              }}
              data-control-ui="table-of-contents"
              data-control-family="table-of-contents"
              data-slot="item"
              data-active={isActive || undefined}
              data-level={item.level}
              data-depth={item.depth}
              aria-current={isActive ? "location" : undefined}
              href={item.href}
              className="block"
              style={itemStyle}
            >
              {item.label}
            </a>
            {item.children && <TocList items={item.children} activeHrefs={activeHrefs} itemElements={itemElements} />}
          </li>
        );
      })}
    </ul>
  );
}
