"use client";

import { type UIEvent, useEffect, useEffectEvent, useRef, useState } from "react";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { InfiniteCanvas, InfiniteCanvasContent } from "@/components/control-ui/ui/infinite-canvas";
import {
  ATLAS_DEFAULT_VIEW,
  type AtlasNode,
  type AtlasSize,
  type AtlasView,
  atlasBounds,
  atlasFeaturedIds,
  nodeIdsWithin,
  visibleWorld,
} from "../atlas-layout";
import { AtlasItem } from "./atlas-item";
import { AtlasMinimap } from "./atlas-minimap";
import { type AtlasTool, AtlasToolbar } from "./atlas-toolbar";

const LIVE_PREVIEW_MIN_SCALE = 0.5;
const LIVE_PREVIEW_MARGIN = 240;
const FIT_PADDING = 32;
const FALLBACK_MIN_SCALE = 0.05;

function fitScale(world: AtlasSize, viewport: AtlasSize) {
  return Math.min((viewport.width - FIT_PADDING * 2) / world.width, (viewport.height - FIT_PADDING * 2) / world.height);
}

export function AtlasCanvas({
  nodes,
  inView,
  onInViewChange,
}: {
  nodes: readonly AtlasNode[];
  inView: ReadonlySet<string>;
  onInViewChange: (ids: string[]) => void;
}) {
  const integration = useDocsIntegration();
  const rootRef = useRef<HTMLElement | null>(null);
  const view = useRef<AtlasView>(ATLAS_DEFAULT_VIEW);
  const [viewport, setViewport] = useState<AtlasSize | null>(null);
  const [live, setLive] = useState<ReadonlySet<string>>(() => new Set(atlasFeaturedIds));
  const [selectedId, setSelectedId] = useState<string | null>(atlasFeaturedIds[0] ?? null);
  const [tool, setTool] = useState<AtlasTool>("pointer");
  const [touchUnlocked, setTouchUnlocked] = useState(false);
  const bounds = atlasBounds(nodes);

  function track(nextView: AtlasView, size: AtlasSize) {
    const area = visibleWorld(nextView, size);
    onInViewChange(nodeIdsWithin(nodes, area));
    if (nextView.scale < LIVE_PREVIEW_MIN_SCALE) return;
    const near = nodeIdsWithin(nodes, area, LIVE_PREVIEW_MARGIN);
    setLive((current) => (near.every((id) => current.has(id)) ? current : new Set([...current, ...near])));
  }

  const trackResize = useEffectEvent((size: AtlasSize) => track(view.current, size));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => {
      const size = { width: root.clientWidth, height: root.clientHeight };
      setViewport(size);
      trackResize(size);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  function discardScrollWithoutFocus(event: UIEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root || event.target !== root || root.contains(document.activeElement)) return;
    root.scrollTo(0, 0);
    event.stopPropagation();
  }

  return (
    <div className="relative size-full" onScrollCapture={discardScrollWithoutFocus}>
      <InfiniteCanvas
        ref={rootRef}
        chrome="embedded"
        aria-label="Component atlas. Drag to pan, pinch or Ctrl + scroll to zoom."
        className="size-full"
        defaultTransform={ATLAS_DEFAULT_VIEW}
        minScale={viewport ? Math.min(LIVE_PREVIEW_MIN_SCALE, fitScale(bounds, viewport) * 0.9) : FALLBACK_MIN_SCALE}
        panOnDrag={tool === "hand" ? "anywhere" : "background"}
        panOnWheel={false}
        onTransformChange={(next) => {
          view.current = next;
          if (viewport) track(next, viewport);
        }}
      >
        <InfiniteCanvasContent>
          {nodes.map((node) => (
            <AtlasItem
              key={node.item.id}
              node={node}
              live={live.has(node.item.id)}
              selected={selectedId === node.item.id}
              integration={integration}
              onSelect={setSelectedId}
            />
          ))}
        </InfiniteCanvasContent>
        {viewport ? (
          <AtlasMinimap
            nodes={nodes}
            bounds={bounds}
            inView={inView}
            viewport={viewport}
            className="absolute top-4 right-4 z-1 hidden @3xl/home:block"
          />
        ) : null}
        <AtlasToolbar
          tool={tool}
          onToolChange={setTool}
          bounds={bounds}
          total={nodes.length}
          className="absolute bottom-4 left-1/2 z-1 -translate-x-1/2"
        />
      </InfiniteCanvas>
      {touchUnlocked ? (
        <Button
          size="sm"
          variant="surface"
          className="absolute top-3 right-3 hidden pointer-coarse:inline-flex"
          onClick={() => setTouchUnlocked(false)}
        >
          Done
        </Button>
      ) : (
        <button
          type="button"
          className="absolute inset-0 hidden touch-pan-y place-items-end justify-center pb-20 outline-none pointer-coarse:grid"
          onClick={() => setTouchUnlocked(true)}
        >
          <Badge size="md">Tap to pan and zoom</Badge>
        </button>
      )}
    </div>
  );
}
