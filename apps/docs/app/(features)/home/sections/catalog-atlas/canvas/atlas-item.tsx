"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IntentLink } from "@/app/(features)/client/intent-link";
import { PreviewFrame } from "@/app/(features)/components/preview-frame";
import { CatalogGalleryItemPreview } from "@/app/(features)/components/previews";
import type { ComponentItem } from "@/app/(features)/home/home-content";
import { annotationTagClassName } from "@/app/(features)/home/shared/annotation-tag";
import type { IntegrationId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { InfiniteCanvasItem } from "@/components/control-ui/ui/infinite-canvas";
import { Text } from "@/components/control-ui/ui/typography";
import { ATLAS_LABEL_HEIGHT, ATLAS_TILE, type AtlasNode, type AtlasSize, isAtlasFeaturedId } from "../atlas-layout";
import { FeaturedPreview } from "./featured-previews";

const SELECTION_OUTSET = 8;

const cornerClassNames = ["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-right-1 -bottom-1"];

function SelectionFrame() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<AtlasSize | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() =>
      setSize({ width: frame.offsetWidth - SELECTION_OUTSET * 2, height: frame.offsetHeight - SELECTION_OUTSET * 2 }),
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-1 rounded-sm border-[1.5px] border-info"
      style={{ inset: -SELECTION_OUTSET }}
    >
      {cornerClassNames.map((corner) => (
        <span key={corner} className={cn("absolute size-2 border-[1.5px] border-info bg-background", corner)} />
      ))}
      {size ? (
        <span className={cn(annotationTagClassName, "absolute top-full left-1/2 mt-2 h-4.5 -translate-x-1/2 px-1.5")}>
          <Text size="micro" mono numeric className="whitespace-nowrap">
            {size.width} × {size.height}
          </Text>
        </span>
      ) : null}
    </div>
  );
}

function TilePreview({ item, live, integration }: { item: ComponentItem; live: boolean; integration: IntegrationId }) {
  return (
    <div
      inert
      className="overflow-hidden rounded-xl border border-border bg-card [content-visibility:auto]"
      style={{ height: ATLAS_TILE.height }}
    >
      {live ? (
        <div className={cn("grid size-full place-items-center p-5 [zoom:0.8]", item.previewClassName)}>
          <PreviewFrame layout={item.previewLayout}>
            <CatalogGalleryItemPreview item={item} integration={integration} />
          </PreviewFrame>
        </div>
      ) : (
        <div className="grid size-full place-items-center px-6 text-center">
          <Text size="display" tone="muted" className="text-balance">
            {item.name}
          </Text>
        </div>
      )}
    </div>
  );
}

export function AtlasItem({
  node,
  live,
  selected,
  integration,
  onSelect,
}: {
  node: AtlasNode;
  live: boolean;
  selected: boolean;
  integration: IntegrationId;
  onSelect: (id: string) => void;
}) {
  const { item, featured } = node;

  return (
    <InfiniteCanvasItem x={node.x} y={node.y} style={{ width: node.width }} className={cn("grid", !featured && "pointer-events-none")}>
      <div className="flex min-w-0 items-start justify-between gap-3" style={{ height: ATLAS_LABEL_HEIGHT }}>
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(item.id)}
          className={cn(
            "pointer-events-auto min-w-0 cursor-default truncate rounded-sm outline-none transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            selected ? "text-info-text" : "text-muted-foreground",
          )}
        >
          <Text size="caption" mono>
            {item.name}
          </Text>
        </button>
        {selected ? (
          <IntentLink
            href={item.href}
            className="pointer-events-auto inline-flex shrink-0 items-center gap-0.5 rounded-sm text-info-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Text size="caption" mono>
              Docs
            </Text>
            <ArrowUpRightIcon aria-hidden="true" className="size-3" />
          </IntentLink>
        ) : null}
      </div>
      <div className="relative min-w-0">
        {selected ? <SelectionFrame /> : null}
        {featured && isAtlasFeaturedId(item.id) ? (
          <FeaturedPreview id={item.id} />
        ) : (
          <TilePreview item={item} live={live} integration={integration} />
        )}
      </div>
    </InfiniteCanvasItem>
  );
}
