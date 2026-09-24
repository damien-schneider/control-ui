"use client";

import { CircleIcon, FrameIcon, MousePointer2Icon, SquareIcon, TypeIcon } from "lucide-react";
import type { ComponentProps, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
  type InfiniteCanvasTransform,
} from "@/components/control-ui/ui/infinite-canvas";
import { ResizableFloatingPanel } from "@/components/control-ui/ui/resizable";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import {
  createDesignCanvasLayer,
  type DesignCanvasLayer,
  type DesignCanvasLayerKind,
  type DesignCanvasPoint,
  type DesignCanvasTool,
  designCanvasFillColor,
  drawnDesignCanvasBounds,
} from "./design-canvas-data";
import { DesignCanvasInspector } from "./design-canvas-inspector";

export type { DesignCanvasFill, DesignCanvasLayer, DesignCanvasLayerKind, DesignCanvasTool } from "./design-canvas-data";

export type DesignCanvasBlockProps = Omit<ComponentProps<"div">, "children" | "defaultValue" | "onChange"> & {
  layers?: readonly DesignCanvasLayer[];
  defaultLayers?: readonly DesignCanvasLayer[];
  onLayersChange?: (layers: DesignCanvasLayer[]) => void;
  selectedLayerId?: string | null;
  defaultSelectedLayerId?: string | null;
  onSelectedLayerIdChange?: (layerId: string | null) => void;
  defaultTransform?: InfiniteCanvasTransform;
  layout?: "viewport" | "contained";
};

const TOOLS: readonly { tool: DesignCanvasTool; label: string; shortcut: string; icon: ReactNode }[] = [
  { tool: "move", label: "Move", shortcut: "V", icon: <MousePointer2Icon /> },
  { tool: "frame", label: "Frame", shortcut: "F", icon: <FrameIcon /> },
  { tool: "rectangle", label: "Rectangle", shortcut: "R", icon: <SquareIcon /> },
  { tool: "ellipse", label: "Ellipse", shortcut: "O", icon: <CircleIcon /> },
  { tool: "text", label: "Text", shortcut: "T", icon: <TypeIcon /> },
];

const LAYER_ICONS: Record<DesignCanvasLayerKind, ReactNode> = {
  frame: <FrameIcon />,
  rectangle: <SquareIcon />,
  ellipse: <CircleIcon />,
  text: <TypeIcon />,
};

const NUDGE_DIRECTIONS: Partial<Record<string, { x: number; y: number }>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const DEFAULT_TRANSFORM: InfiniteCanvasTransform = { x: 0, y: 0, scale: 1 };
const CLICK_TOLERANCE_PX = 4;

type DesignCanvasDraft = {
  kind: DesignCanvasLayerKind;
  pointerId: number;
  start: DesignCanvasPoint;
  end: DesignCanvasPoint;
  clickTolerance: number;
};

function newLayerId(kind: DesignCanvasLayerKind) {
  return `${kind}-${Math.random().toString(36).slice(2, 8)}`;
}

function toolForShortcut(key: string) {
  return TOOLS.find((entry) => entry.shortcut === key.toUpperCase())?.tool;
}

function layerFromDraft(draft: DesignCanvasDraft, id: string) {
  return createDesignCanvasLayer(draft.kind, drawnDesignCanvasBounds(draft.kind, draft.start, draft.end, draft.clickTolerance), id);
}

export function DesignCanvasBlock({
  layers,
  defaultLayers = [],
  onLayersChange,
  selectedLayerId,
  defaultSelectedLayerId = null,
  onSelectedLayerIdChange,
  defaultTransform = DEFAULT_TRANSFORM,
  layout = "viewport",
  className,
  ...props
}: DesignCanvasBlockProps) {
  const [internalLayers, setInternalLayers] = useState<readonly DesignCanvasLayer[]>(defaultLayers);
  const [internalSelectedLayerId, setInternalSelectedLayerId] = useState(defaultSelectedLayerId);
  const transformRef = useRef(defaultTransform);
  const [tool, setTool] = useState<DesignCanvasTool>("move");
  const [draft, setDraft] = useState<DesignCanvasDraft | null>(null);
  const currentLayers = layers ?? internalLayers;
  const currentSelectedLayerId = selectedLayerId === undefined ? internalSelectedLayerId : selectedLayerId;
  const selectedLayer = currentLayers.find((layer) => layer.id === currentSelectedLayerId);

  function changeLayers(next: DesignCanvasLayer[]) {
    if (layers === undefined) setInternalLayers(next);
    onLayersChange?.(next);
  }

  function selectLayer(layerId: string | null) {
    if (selectedLayerId === undefined) setInternalSelectedLayerId(layerId);
    onSelectedLayerIdChange?.(layerId);
  }

  function replaceLayer(next: DesignCanvasLayer) {
    changeLayers(currentLayers.map((layer) => (layer.id === next.id ? next : layer)));
  }

  function worldPointAt(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const { x, y, scale } = transformRef.current;
    return { x: (event.clientX - bounds.left - x) / scale, y: (event.clientY - bounds.top - y) / scale };
  }

  function beginDrawOrDeselect(event: PointerEvent<HTMLElement>) {
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    if (tool === "move") {
      selectLayer(null);
      return;
    }
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = worldPointAt(event);
    setDraft({
      kind: tool,
      pointerId: event.pointerId,
      start: point,
      end: point,
      clickTolerance: CLICK_TOLERANCE_PX / transformRef.current.scale,
    });
  }

  function resizeDraft(event: PointerEvent<HTMLElement>) {
    if (draft?.pointerId !== event.pointerId) return;
    setDraft({ ...draft, end: worldPointAt(event) });
  }

  function commitDraft(event: PointerEvent<HTMLElement>) {
    if (draft?.pointerId !== event.pointerId) return;
    const layer = layerFromDraft(draft, newLayerId(draft.kind));
    setDraft(null);
    changeLayers([...currentLayers, layer]);
    selectLayer(layer.id);
    setTool("move");
  }

  function cancelDraft(event: PointerEvent<HTMLElement>) {
    if (draft?.pointerId === event.pointerId) setDraft(null);
  }

  function editSelectedLayerWithKey(event: KeyboardEvent<HTMLElement>) {
    if (!selectedLayer) return false;
    const nudge = NUDGE_DIRECTIONS[event.key];
    if (event.key === "Delete" || event.key === "Backspace") {
      changeLayers(currentLayers.filter((layer) => layer.id !== selectedLayer.id));
      selectLayer(null);
    } else if (nudge) {
      const distance = event.shiftKey ? 10 : 1;
      replaceLayer({ ...selectedLayer, x: selectedLayer.x + nudge.x * distance, y: selectedLayer.y + nudge.y * distance });
    } else return false;
    return true;
  }

  function handleShortcut(event: KeyboardEvent<HTMLElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const shortcutTool = toolForShortcut(event.key);
    if (shortcutTool) setTool(shortcutTool);
    else if (event.key === "Escape") {
      setDraft(null);
      setTool("move");
      selectLayer(null);
    } else if (!editSelectedLayerWithKey(event)) return;
    event.preventDefault();
  }

  return (
    <div
      className={cn(
        "@container/design-canvas relative isolate overflow-hidden bg-background text-foreground",
        layout === "contained" ? "h-full min-h-0" : "h-svh",
        className,
      )}
      {...props}
    >
      <InfiniteCanvas
        aria-label="Design canvas"
        defaultTransform={defaultTransform}
        onTransformChange={(next) => {
          transformRef.current = next;
        }}
        data-tool={tool}
        className={cn("size-full", tool !== "move" && "cursor-crosshair")}
        style={{
          "--cui-infinite-canvas-radius": "0px",
          "--cui-infinite-canvas-border-color": "transparent",
          "--cui-infinite-canvas-background": "var(--muted)",
        }}
        onPointerDown={beginDrawOrDeselect}
        onPointerMove={resizeDraft}
        onPointerUp={commitDraft}
        onPointerCancel={cancelDraft}
        onKeyDown={handleShortcut}
      >
        <InfiniteCanvasContent className={cn(tool !== "move" && "[&>*]:pointer-events-none")}>
          {currentLayers.map((layer) => (
            <DesignCanvasLayerNode
              key={layer.id}
              layer={layer}
              selected={layer.id === currentSelectedLayerId}
              onSelect={() => selectLayer(layer.id)}
              onLayerChange={replaceLayer}
            />
          ))}
          {draft ? <DesignCanvasLayerNode layer={layerFromDraft(draft, "draft")} selected /> : null}
        </InfiniteCanvasContent>
        <InfiniteCanvasControls className="top-3 right-auto bottom-auto left-3 @4xl/design-canvas:left-1/2 @4xl/design-canvas:-translate-x-1/2" />
      </InfiniteCanvas>

      <ResizableFloatingPanel side="left" defaultSize={224} minSize={180} maxSize={360} className="hidden @4xl/design-canvas:flex">
        <aside aria-label="Layers" className="flex min-h-0 flex-1 flex-col">
          <h2 className="flex h-11 shrink-0 items-center border-b px-3 text-caption font-medium">Layers</h2>
          <ScrollArea className="min-h-0 flex-1">
            <ul className="flex flex-col gap-0.5 p-2">
              {currentLayers.toReversed().map((layer) => (
                <li key={layer.id}>
                  <Button
                    variant="ghost"
                    size="sm"
                    active={layer.id === currentSelectedLayerId}
                    aria-pressed={layer.id === currentSelectedLayerId}
                    className="w-full justify-start [&_svg]:size-3.5 [&_svg]:text-muted-foreground"
                    onClick={() => selectLayer(layer.id)}
                  >
                    {LAYER_ICONS[layer.kind]}
                    <span className="truncate">{layer.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>
      </ResizableFloatingPanel>

      <ResizableFloatingPanel defaultSize={280} minSize={256} maxSize={440} className="hidden @xl/design-canvas:flex">
        <aside aria-label="Properties" className="flex min-h-0 flex-1 flex-col">
          <h2 className="flex h-11 shrink-0 items-center border-b px-3 text-caption font-medium">
            <span className="truncate">{selectedLayer?.name ?? "Design"}</span>
          </h2>
          <ScrollArea className="min-h-0 flex-1">
            <DesignCanvasInspector layer={selectedLayer} onLayerChange={replaceLayer} />
          </ScrollArea>
        </aside>
      </ResizableFloatingPanel>

      <DesignCanvasToolbar tool={tool} onToolChange={setTool} />
    </div>
  );
}

type DesignCanvasLayerNodeProps = {
  layer: DesignCanvasLayer;
  selected: boolean;
  onSelect?: () => void;
  onLayerChange?: (layer: DesignCanvasLayer) => void;
};

function DesignCanvasLayerNode({ layer, selected, onSelect, onLayerChange }: DesignCanvasLayerNodeProps) {
  const fillColor = designCanvasFillColor(layer.fill);
  return (
    <InfiniteCanvasItem
      x={layer.x}
      y={layer.y}
      aria-label={layer.name}
      data-selected={selected || undefined}
      className="outline-primary data-selected:outline-2"
      style={{ width: layer.width, height: layer.height, rotate: `${layer.rotation}deg`, opacity: layer.opacity / 100 }}
      onPointerDown={onSelect}
      onPositionChange={onLayerChange && ((position) => onLayerChange({ ...layer, x: Math.round(position.x), y: Math.round(position.y) }))}
    >
      {layer.kind === "frame" ? (
        <span className="absolute bottom-full left-0 mb-1 whitespace-nowrap text-caption text-muted-foreground">{layer.name}</span>
      ) : null}
      {layer.kind === "text" ? (
        <p className="size-full overflow-hidden text-2xl leading-8 whitespace-nowrap" style={{ color: fillColor }}>
          {layer.text}
        </p>
      ) : (
        <div className="size-full" style={{ background: fillColor, borderRadius: layer.kind === "ellipse" ? "50%" : layer.cornerRadius }} />
      )}
      {selected ? (
        <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-sm bg-primary px-1 text-[10px] leading-4 whitespace-nowrap text-primary-foreground tabular-nums">
          {layer.width} × {layer.height}
        </span>
      ) : null}
    </InfiniteCanvasItem>
  );
}

function DesignCanvasToolbar({ tool, onToolChange }: { tool: DesignCanvasTool; onToolChange: (tool: DesignCanvasTool) => void }) {
  return (
    <TooltipProvider>
      <Toolbar
        variant="floating"
        aria-label="Design tools"
        className="absolute bottom-4 left-4 w-max @4xl/design-canvas:left-1/2 @4xl/design-canvas:-translate-x-1/2"
      >
        <ToolbarGroup aria-label="Tools">
          {TOOLS.map((entry) => (
            <Tooltip key={entry.tool}>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label={entry.label}
                    iconOnly
                    aria-pressed={tool === entry.tool}
                    data-pressed={tool === entry.tool ? "" : undefined}
                    onClick={() => onToolChange(entry.tool)}
                  />
                }
              >
                {entry.icon}
              </TooltipTrigger>
              <TooltipContent>
                {entry.label} · {entry.shortcut}
              </TooltipContent>
            </Tooltip>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
