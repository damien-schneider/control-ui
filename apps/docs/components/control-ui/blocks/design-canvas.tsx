"use client";

import { CircleIcon, FrameIcon, LayersIcon, MousePointer2Icon, SlidersHorizontalIcon, SquareIcon, TypeIcon } from "lucide-react";
import type { ComponentProps, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/control-ui/ui/drawer";
import {
  InfiniteCanvas,
  InfiniteCanvasContent,
  InfiniteCanvasControls,
  InfiniteCanvasItem,
  type InfiniteCanvasTransform,
} from "@/components/control-ui/ui/infinite-canvas";
import { ResizableFloatingPanel } from "@/components/control-ui/ui/resizable";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import { Text } from "@/components/control-ui/ui/typography";
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
  layersLabel?: string;
  propertiesLabel?: string;
  openLayersLabel?: string;
  openPropertiesLabel?: string;
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
const DELETE_KEYS = new Set(["Delete", "Backspace"]);
const CANVAS_KEY_SHORTCUTS = `${TOOLS.map((entry) => entry.shortcut).join(" ")} Enter Delete Backspace Escape`;
const LAYER_KEY_SHORTCUTS = "Enter Space ArrowLeft ArrowRight ArrowUp ArrowDown Delete Backspace";

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
  layersLabel = "Layers",
  propertiesLabel = "Properties",
  openLayersLabel = "Show layers",
  openPropertiesLabel = "Show properties",
  className,
  ...props
}: DesignCanvasBlockProps) {
  const [internalLayers, setInternalLayers] = useState<readonly DesignCanvasLayer[]>(defaultLayers);
  const [internalSelectedLayerId, setInternalSelectedLayerId] = useState(defaultSelectedLayerId);
  const transformRef = useRef(defaultTransform);
  const [tool, setTool] = useState<DesignCanvasTool>("move");
  const [draft, setDraft] = useState<DesignCanvasDraft | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
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

  function addLayer(layer: DesignCanvasLayer) {
    changeLayers([...currentLayers, layer]);
    selectLayer(layer.id);
    setTool("move");
  }

  function toWorldPoint(local: DesignCanvasPoint) {
    const { x, y, scale } = transformRef.current;
    return { x: (local.x - x) / scale, y: (local.y - y) / scale };
  }

  function worldPointAt(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return toWorldPoint({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  }

  function addLayerAtViewportCenter(kind: DesignCanvasLayerKind, canvas: HTMLElement) {
    const center = toWorldPoint({ x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 });
    const bounds = drawnDesignCanvasBounds(kind, center, center, CLICK_TOLERANCE_PX / transformRef.current.scale);
    addLayer(createDesignCanvasLayer(kind, bounds, newLayerId(kind)));
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
    setDraft(null);
    addLayer(layerFromDraft(draft, newLayerId(draft.kind)));
  }

  function cancelDraft(event: PointerEvent<HTMLElement>) {
    if (draft?.pointerId === event.pointerId) setDraft(null);
  }

  function editLayerWithKey(layer: DesignCanvasLayer, event: KeyboardEvent<HTMLElement>) {
    const nudge = NUDGE_DIRECTIONS[event.key];
    if (DELETE_KEYS.has(event.key)) {
      changeLayers(currentLayers.filter((entry) => entry.id !== layer.id));
      if (layer.id === currentSelectedLayerId) selectLayer(null);
    } else if (nudge) {
      const distance = event.shiftKey ? 10 : 1;
      replaceLayer({ ...layer, x: layer.x + nudge.x * distance, y: layer.y + nudge.y * distance });
    } else return false;
    return true;
  }

  function handleLayerKey(layer: DesignCanvasLayer, event: KeyboardEvent<HTMLElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter" || event.key === " ") selectLayer(layer.id);
    else if (!editLayerWithKey(layer, event)) return;
    event.preventDefault();
    if (DELETE_KEYS.has(event.key)) {
      event.currentTarget.closest<HTMLElement>('[data-control-family="infinite-canvas"][data-slot="root"]')?.focus();
    }
  }

  function handleShortcut(event: KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const shortcutTool = toolForShortcut(event.key);
    if (shortcutTool) setTool(shortcutTool);
    else if (event.key === "Escape") {
      setDraft(null);
      setTool("move");
      selectLayer(null);
    } else if (event.key === "Enter" && tool !== "move" && event.target === event.currentTarget) {
      addLayerAtViewportCenter(tool, event.currentTarget);
    } else if (!selectedLayer || !editLayerWithKey(selectedLayer, event)) return;
    event.preventDefault();
  }

  const layerList = <DesignCanvasLayerList layers={currentLayers} selectedLayerId={currentSelectedLayerId} onSelect={selectLayer} />;
  const inspector = <DesignCanvasInspector layer={selectedLayer} onLayerChange={replaceLayer} />;
  const propertiesTitle = selectedLayer?.name ?? "Design";

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
        aria-keyshortcuts={CANVAS_KEY_SHORTCUTS}
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
              onKeyDown={(event) => handleLayerKey(layer, event)}
              onLayerChange={replaceLayer}
            />
          ))}
          {draft ? <DesignCanvasLayerNode layer={layerFromDraft(draft, "draft")} selected /> : null}
        </InfiniteCanvasContent>
        <InfiniteCanvasControls className="start-3 end-auto top-3 bottom-auto w-max @4xl/design-canvas:inset-x-0 @4xl/design-canvas:mx-auto" />
      </InfiniteCanvas>

      <ResizableFloatingPanel side="left" defaultSize={224} minSize={180} maxSize={360} className="hidden @4xl/design-canvas:flex">
        <DesignCanvasPanel label={layersLabel} title={layersLabel}>
          {layerList}
        </DesignCanvasPanel>
      </ResizableFloatingPanel>

      <ResizableFloatingPanel defaultSize={280} minSize={256} maxSize={440} className="hidden @xl/design-canvas:flex">
        <DesignCanvasPanel label={propertiesLabel} title={propertiesTitle}>
          {inspector}
        </DesignCanvasPanel>
      </ResizableFloatingPanel>

      <Drawer side="left" open={layersOpen} onOpenChange={setLayersOpen}>
        <DrawerContent side="left" className="gap-0 p-0">
          <DesignCanvasPanel label={layersLabel} title={layersLabel} inDrawer>
            {layerList}
          </DesignCanvasPanel>
        </DrawerContent>
      </Drawer>

      <Drawer side="right" open={propertiesOpen} onOpenChange={setPropertiesOpen}>
        <DrawerContent side="right" className="gap-0 p-0">
          <DesignCanvasPanel label={propertiesLabel} title={propertiesTitle} inDrawer>
            {inspector}
          </DesignCanvasPanel>
        </DrawerContent>
      </Drawer>

      <TooltipProvider>
        <Toolbar
          variant="floating"
          aria-label="Design tools"
          className="absolute start-4 bottom-4 w-max @4xl/design-canvas:inset-x-0 @4xl/design-canvas:mx-auto"
        >
          <ToolbarGroup aria-label="Tools">
            {TOOLS.map((entry) => (
              <DesignCanvasToolbarButton
                key={entry.tool}
                label={entry.label}
                hint={`${entry.label} · ${entry.shortcut}`}
                pressed={tool === entry.tool}
                onClick={() => setTool(entry.tool)}
              >
                {entry.icon}
              </DesignCanvasToolbarButton>
            ))}
          </ToolbarGroup>
          <ToolbarSeparator className="@4xl/design-canvas:hidden" />
          <ToolbarGroup className="@4xl/design-canvas:hidden">
            <DesignCanvasToolbarButton
              label={openLayersLabel}
              hint={openLayersLabel}
              aria-haspopup="dialog"
              aria-expanded={layersOpen}
              onClick={() => setLayersOpen(true)}
            >
              <LayersIcon />
            </DesignCanvasToolbarButton>
            <DesignCanvasToolbarButton
              label={openPropertiesLabel}
              hint={openPropertiesLabel}
              aria-haspopup="dialog"
              aria-expanded={propertiesOpen}
              className="@xl/design-canvas:hidden"
              onClick={() => setPropertiesOpen(true)}
            >
              <SlidersHorizontalIcon />
            </DesignCanvasToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </TooltipProvider>
    </div>
  );
}

type DesignCanvasPanelProps = {
  label: string;
  title: string;
  inDrawer?: boolean;
  children: ReactNode;
};

function DesignCanvasPanel({ label, title, inDrawer = false, children }: DesignCanvasPanelProps) {
  const titleClassName = "flex h-11 shrink-0 items-center border-b px-3 text-caption font-medium";
  const titleText = (
    <span className="truncate" title={title}>
      {title}
    </span>
  );
  return (
    <aside aria-label={label} className="flex min-h-0 flex-1 flex-col">
      {inDrawer ? <DrawerTitle className={titleClassName}>{titleText}</DrawerTitle> : <h2 className={titleClassName}>{titleText}</h2>}
      <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
    </aside>
  );
}

type DesignCanvasLayerListProps = {
  layers: readonly DesignCanvasLayer[];
  selectedLayerId: string | null;
  onSelect: (layerId: string) => void;
};

function DesignCanvasLayerList({ layers, selectedLayerId, onSelect }: DesignCanvasLayerListProps) {
  return (
    <ul className="flex flex-col gap-0.5 p-2">
      {layers.toReversed().map((layer) => (
        <li key={layer.id}>
          <Button
            variant="ghost"
            size="sm"
            active={layer.id === selectedLayerId}
            aria-pressed={layer.id === selectedLayerId}
            className="w-full justify-start [&_svg]:size-3.5 [&_svg]:text-muted-foreground"
            onClick={() => onSelect(layer.id)}
          >
            {LAYER_ICONS[layer.kind]}
            <span className="truncate" title={layer.name}>
              {layer.name}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

type DesignCanvasLayerNodeProps = {
  layer: DesignCanvasLayer;
  selected: boolean;
  onSelect?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onLayerChange?: (layer: DesignCanvasLayer) => void;
};

function DesignCanvasLayerNode({ layer, selected, onSelect, onKeyDown, onLayerChange }: DesignCanvasLayerNodeProps) {
  const fillColor = designCanvasFillColor(layer.fill);
  const interactive = onSelect !== undefined;
  return (
    <InfiniteCanvasItem
      x={layer.x}
      y={layer.y}
      aria-label={layer.name}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-keyshortcuts={interactive ? LAYER_KEY_SHORTCUTS : undefined}
      data-selected={selected || undefined}
      className="outline-primary data-selected:outline-2"
      style={{ width: layer.width, height: layer.height, rotate: `${layer.rotation}deg`, opacity: layer.opacity / 100 }}
      onPointerDown={onSelect}
      onKeyDown={onKeyDown}
      onPositionChange={onLayerChange && ((position) => onLayerChange({ ...layer, x: Math.round(position.x), y: Math.round(position.y) }))}
    >
      {layer.kind === "frame" ? (
        <span className="absolute start-0 bottom-full mb-1 whitespace-nowrap text-caption text-muted-foreground">{layer.name}</span>
      ) : null}
      {layer.kind === "text" ? (
        <Text as="p" size="heading-2" weight="normal" className="size-full overflow-hidden whitespace-nowrap" style={{ color: fillColor }}>
          {layer.text}
        </Text>
      ) : (
        <div className="size-full" style={{ background: fillColor, borderRadius: layer.kind === "ellipse" ? "50%" : layer.cornerRadius }} />
      )}
      {selected ? (
        <span className="absolute inset-x-0 top-full mx-auto mt-1.5 w-max rounded-sm bg-primary px-1 text-micro whitespace-nowrap text-primary-foreground tabular-nums">
          {layer.width} × {layer.height}
        </span>
      ) : null}
    </InfiniteCanvasItem>
  );
}

type DesignCanvasToolbarButtonProps = Omit<ComponentProps<typeof ToolbarButton>, "aria-label" | "children"> & {
  label: string;
  hint: string;
  pressed?: boolean;
  children: ReactNode;
};

function DesignCanvasToolbarButton({ label, hint, pressed, children, ...props }: DesignCanvasToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<ToolbarButton {...props} aria-label={label} iconOnly aria-pressed={pressed} data-pressed={pressed ? "" : undefined} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
