// biome-ignore-all lint/a11y/noNoninteractiveTabindex: Infinite Canvas is a composite pan-and-zoom widget with documented keyboard commands.
"use client";

import { useRender } from "@base-ui/react/use-render";
import { GripVerticalIcon, MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEventHandler,
  PointerEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { createContext, use, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { InfiniteCanvasKnobStyle } from "@/components/control-ui/knob-contracts/infinite-canvas-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import type { InfiniteCanvasPoint, InfiniteCanvasTransform } from "@/components/control-ui/lib/infinite-canvas-camera";
import {
  createInfiniteCanvasCamera,
  type InfiniteCanvasCamera,
  type InfiniteCanvasCameraStore,
  type InfiniteCanvasMoveDetails,
  infiniteCanvasGridStyle,
  infiniteCanvasTransformCss,
} from "@/components/control-ui/lib/infinite-canvas-camera-store";
import {
  ARROW_KEY_DIRECTIONS,
  attachInfiniteCanvasNavigation,
  INFINITE_CANVAS_KEY_SHORTCUTS,
  type InfiniteCanvasNavigation,
  type InfiniteCanvasNavigationOptions,
  type InfiniteCanvasPanOnDrag,
  keyboardStep,
  runInfiniteCanvasKeyCommand,
} from "@/components/control-ui/lib/infinite-canvas-navigation";
import { Button } from "@/components/control-ui/ui/button";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/control-ui/ui/toolbar";

export type {
  InfiniteCanvasBounds,
  InfiniteCanvasPoint,
  InfiniteCanvasTransform,
} from "@/components/control-ui/lib/infinite-canvas-camera";
export type {
  InfiniteCanvasCamera,
  InfiniteCanvasFitOptions,
  InfiniteCanvasMoveDetails,
  InfiniteCanvasMoveOptions,
  InfiniteCanvasMoveReason,
  InfiniteCanvasRevealOptions,
  InfiniteCanvasTransformUpdate,
  InfiniteCanvasZoomOptions,
} from "@/components/control-ui/lib/infinite-canvas-camera-store";
export type { InfiniteCanvasPanOnDrag } from "@/components/control-ui/lib/infinite-canvas-navigation";

export type InfiniteCanvasProps = Omit<ComponentProps<"section">, "onChange" | "onWheel" | "style"> & {
  transform?: InfiniteCanvasTransform;
  defaultTransform?: InfiniteCanvasTransform;
  onTransformChange?: (transform: InfiniteCanvasTransform, details: InfiniteCanvasMoveDetails) => void;
  minScale?: number;
  maxScale?: number;
  panOnDrag?: InfiniteCanvasPanOnDrag;
  keyboardNavigation?: boolean;
  onWheel?: (event: WheelEvent) => void;
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasContentProps = Omit<ComponentProps<"div">, "ref" | "style"> & {
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasItemProps = Omit<ComponentProps<"div">, "style"> & {
  x: number;
  y: number;
  onPositionChange?: (position: InfiniteCanvasPoint) => void;
  movableItemLabel?: string;
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasItemHandleProps = ComponentProps<typeof Button> & {
  onPositionChange: (position: InfiniteCanvasPoint) => void;
};

export type InfiniteCanvasControlsProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  style?: CSSProperties & InfiniteCanvasKnobStyle;
};

export type InfiniteCanvasContextValue = InfiniteCanvasCamera & { minScale: number; maxScale: number };

type InfiniteCanvasStoreContextValue = { store: InfiniteCanvasCameraStore; initialTransform: InfiniteCanvasTransform };

type InfiniteCanvasDragHandlers<Element extends HTMLElement> = {
  onPointerDown?: PointerEventHandler<Element>;
  onPointerMove?: PointerEventHandler<Element>;
  onPointerUp?: PointerEventHandler<Element>;
  onPointerCancel?: PointerEventHandler<Element>;
  onLostPointerCapture?: PointerEventHandler<Element>;
  onKeyDown?: KeyboardEventHandler<Element>;
};

type InfiniteCanvasItemDragSession = { pointerId: number; startWorld: InfiniteCanvasPoint; startPosition: InfiniteCanvasPoint };

const DEFAULT_TRANSFORM: InfiniteCanvasTransform = { x: 0, y: 0, scale: 1 };
const DEFAULT_MIN_SCALE = 0.35;
const DEFAULT_MAX_SCALE = 2.5;
const CONTROL_ZOOM_FACTOR = 1.2;
const ITEM_KEY_SHORTCUTS = "ArrowLeft ArrowRight ArrowUp ArrowDown";

const InfiniteCanvasContext = createContext<InfiniteCanvasContextValue | null>(null);
const InfiniteCanvasStoreContext = createContext<InfiniteCanvasStoreContextValue | null>(null);
const InfiniteCanvasItemContext = createContext<InfiniteCanvasPoint | null>(null);

function selectScale(transform: InfiniteCanvasTransform) {
  return transform.scale;
}

export function useInfiniteCanvas() {
  const context = use(InfiniteCanvasContext);
  if (!context) throw new Error("useInfiniteCanvas must be used within InfiniteCanvas");
  return context;
}

function useInfiniteCanvasStore() {
  const context = use(InfiniteCanvasStoreContext);
  if (!context) throw new Error("InfiniteCanvas parts must be used within InfiniteCanvas");
  return context;
}

export function useInfiniteCanvasTransform(): InfiniteCanvasTransform;
export function useInfiniteCanvasTransform<Selected>(select: (transform: InfiniteCanvasTransform) => Selected): Selected;
export function useInfiniteCanvasTransform<Selected>(select?: (transform: InfiniteCanvasTransform) => Selected) {
  const { store, initialTransform } = useInfiniteCanvasStore();
  return useSyncExternalStore(
    store.subscribe,
    () => (select ? select(store.getCommittedTransform()) : store.getCommittedTransform()),
    () => (select ? select(initialTransform) : initialTransform),
  );
}

export function InfiniteCanvas({
  transform,
  defaultTransform = DEFAULT_TRANSFORM,
  onTransformChange,
  minScale: minScaleProp = DEFAULT_MIN_SCALE,
  maxScale: maxScaleProp = DEFAULT_MAX_SCALE,
  panOnDrag = "background",
  keyboardNavigation = true,
  ref,
  className,
  children,
  style,
  onPointerDown,
  onWheel,
  onKeyDown,
  "aria-label": ariaLabel = "Infinite canvas",
  "aria-keyshortcuts": ariaKeyShortcuts,
  ...props
}: InfiniteCanvasProps) {
  const minScale = minScaleProp > 0 ? minScaleProp : DEFAULT_MIN_SCALE;
  const maxScale = Math.max(minScale, maxScaleProp);
  const cameraOptions = { minScale, maxScale, defaultTransform, controlled: transform !== undefined, onTransformChange };
  const [initialTransform] = useState(() => transform ?? defaultTransform);
  const [store] = useState(() => createInfiniteCanvasCamera(initialTransform, cameraOptions));
  const rootRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<InfiniteCanvasNavigation | null>(null);
  const navigationOptionsRef = useRef<InfiniteCanvasNavigationOptions>({ panOnDrag, onWheel });
  const controlledX = transform?.x;
  const controlledY = transform?.y;
  const controlledScale = transform?.scale;

  useLayoutEffect(() => {
    store.configure(cameraOptions);
    navigationOptionsRef.current = { panOnDrag, onWheel };
    navigationRef.current?.syncPanReady();
  });

  useLayoutEffect(() => {
    if (controlledX === undefined || controlledY === undefined || controlledScale === undefined) return;
    store.adopt({ x: controlledX, y: controlledY, scale: controlledScale });
  }, [store, controlledX, controlledY, controlledScale]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    store.attachRoot(root);
    const navigation = attachInfiniteCanvasNavigation(root, store, () => navigationOptionsRef.current);
    navigationRef.current = navigation;
    return () => {
      navigation.detach();
      navigationRef.current = null;
      store.dispose();
      store.attachRoot(null);
    };
  }, [store]);

  const context = useMemo(() => ({ ...store.camera, minScale, maxScale }), [store, minScale, maxScale]);
  const storeContext = useMemo(() => ({ store, initialTransform }), [store, initialTransform]);

  function beginBackgroundPan(event: ReactPointerEvent<HTMLElement>) {
    onPointerDown?.(event);
    navigationRef.current?.beginBackgroundPan(event.nativeEvent);
  }

  function navigateWithKeyboard(event: ReactKeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (!keyboardNavigation || event.defaultPrevented || event.target !== event.currentTarget) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (runInfiniteCanvasKeyCommand(store, event.key, event.shiftKey)) event.preventDefault();
  }

  const keyShortcuts = [keyboardNavigation ? INFINITE_CANVAS_KEY_SHORTCUTS : "", ariaKeyShortcuts].filter(Boolean).join(" ");

  const root = useRender({
    defaultTagName: "section",
    ref: [ref ?? null, rootRef],
    props: {
      tabIndex: 0,
      ...props,
      "data-control-ui": "infinite-canvas",
      "data-control-family": "infinite-canvas",
      "data-slot": "root",
      "aria-label": ariaLabel,
      role: "application",
      "aria-keyshortcuts": keyShortcuts || undefined,
      className: cn("relative isolate overflow-hidden overscroll-none touch-none data-panning:select-none", className),
      style: { ...style, ...infiniteCanvasGridStyle(initialTransform) },
      onPointerDown: beginBackgroundPan,
      onKeyDown: navigateWithKeyboard,
      children,
    },
  });

  return (
    <InfiniteCanvasStoreContext.Provider value={storeContext}>
      <InfiniteCanvasContext.Provider value={context}>{root}</InfiniteCanvasContext.Provider>
    </InfiniteCanvasStoreContext.Provider>
  );
}

export function InfiniteCanvasContent({ className, style, ...props }: InfiniteCanvasContentProps) {
  const { store, initialTransform } = useInfiniteCanvasStore();
  return (
    <div
      ref={store.attachContent}
      {...props}
      data-control-ui="infinite-canvas"
      data-control-family="infinite-canvas"
      data-slot="content"
      data-scale={initialTransform.scale}
      className={cn("absolute top-0 left-0 h-0 w-0", className)}
      style={{ ...style, transform: infiniteCanvasTransformCss(initialTransform) }}
    />
  );
}

function useInfiniteCanvasItemDrag<Element extends HTMLElement>(
  position: InfiniteCanvasPoint,
  onPositionChange: ((position: InfiniteCanvasPoint) => void) | undefined,
  handlers: InfiniteCanvasDragHandlers<Element>,
) {
  const canvas = useInfiniteCanvas();
  const dragRef = useRef<InfiniteCanvasItemDragSession | null>(null);
  const [dragging, setDragging] = useState(false);

  function finishDrag(event: ReactPointerEvent<Element>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDragging(false);
  }

  const dragHandlers: Required<InfiniteCanvasDragHandlers<Element>> = {
    onPointerDown(event) {
      handlers.onPointerDown?.(event);
      if (event.defaultPrevented || !onPositionChange || !event.isPrimary || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { pointerId: event.pointerId, startWorld: canvas.toWorldPoint(event), startPosition: position };
      setDragging(true);
    },
    onPointerMove(event) {
      handlers.onPointerMove?.(event);
      const drag = dragRef.current;
      if (event.defaultPrevented || drag?.pointerId !== event.pointerId) return;
      const world = canvas.toWorldPoint(event);
      onPositionChange?.({
        x: drag.startPosition.x + world.x - drag.startWorld.x,
        y: drag.startPosition.y + world.y - drag.startWorld.y,
      });
    },
    onPointerUp(event) {
      handlers.onPointerUp?.(event);
      finishDrag(event);
    },
    onPointerCancel(event) {
      handlers.onPointerCancel?.(event);
      finishDrag(event);
    },
    onLostPointerCapture(event) {
      handlers.onLostPointerCapture?.(event);
      finishDrag(event);
    },
    onKeyDown(event) {
      handlers.onKeyDown?.(event);
      if (event.defaultPrevented || !onPositionChange || event.target !== event.currentTarget) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const direction = ARROW_KEY_DIRECTIONS[event.key];
      if (!direction) return;
      event.preventDefault();
      const step = keyboardStep(event.shiftKey) / canvas.getTransform().scale;
      onPositionChange({ x: position.x + direction.x * step, y: position.y + direction.y * step });
    },
  };

  return { dragging, dragHandlers };
}

export function InfiniteCanvasItem({
  x,
  y,
  onPositionChange,
  movableItemLabel = "Movable item",
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  ...props
}: InfiniteCanvasItemProps) {
  const position = useMemo(() => ({ x, y }), [x, y]);
  const { dragging, dragHandlers } = useInfiniteCanvasItemDrag(position, onPositionChange, {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onKeyDown,
  });
  const movable = onPositionChange
    ? { role: "group", "aria-roledescription": movableItemLabel, "aria-keyshortcuts": ITEM_KEY_SHORTCUTS, tabIndex: 0 }
    : null;

  return (
    <InfiniteCanvasItemContext.Provider value={position}>
      <div
        {...movable}
        {...props}
        {...dragHandlers}
        data-control-ui="infinite-canvas"
        data-control-family="infinite-canvas"
        data-slot="item"
        data-dragging={dragging || undefined}
        className={cn("absolute", onPositionChange && "touch-none select-none", className)}
        style={{ ...style, left: x, top: y }}
      />
    </InfiniteCanvasItemContext.Provider>
  );
}

export function InfiniteCanvasItemHandle({
  onPositionChange,
  className,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  "aria-label": ariaLabel = "Move item",
  ...props
}: InfiniteCanvasItemHandleProps) {
  const position = use(InfiniteCanvasItemContext);
  if (!position) throw new Error("InfiniteCanvasItemHandle must be used within InfiniteCanvasItem");
  const { dragging, dragHandlers } = useInfiniteCanvasItemDrag(position, onPositionChange, {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onKeyDown,
  });
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      iconOnly
      aria-label={ariaLabel}
      aria-keyshortcuts={ITEM_KEY_SHORTCUTS}
      {...props}
      {...dragHandlers}
      data-dragging={dragging || undefined}
      className={cn("touch-none", className)}
    >
      {children ?? <GripVerticalIcon />}
    </Button>
  );
}

export function InfiniteCanvasControls({ className, ...props }: InfiniteCanvasControlsProps) {
  const canvas = useInfiniteCanvas();
  const scale = useInfiniteCanvasTransform(selectScale);
  const percentage = Math.round(scale * 100);
  return (
    <div
      data-control-ui="infinite-canvas"
      data-control-family="infinite-canvas"
      data-slot="controls"
      className={cn("absolute z-40", className)}
      {...props}
    >
      <Toolbar variant="floating" aria-label="Canvas view">
        <ToolbarButton
          iconOnly
          disabled={scale <= canvas.minScale}
          aria-label="Zoom out"
          onClick={() => canvas.zoomBy(1 / CONTROL_ZOOM_FACTOR)}
        >
          <MinusIcon />
        </ToolbarButton>
        <ToolbarButton className="tabular-nums" aria-label={`Reset canvas zoom, currently ${percentage}%`} onClick={() => canvas.reset()}>
          {percentage}%
        </ToolbarButton>
        <ToolbarButton iconOnly disabled={scale >= canvas.maxScale} aria-label="Zoom in" onClick={() => canvas.zoomBy(CONTROL_ZOOM_FACTOR)}>
          <PlusIcon />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton iconOnly aria-label="Fit view" onClick={() => canvas.fit()}>
          <MaximizeIcon />
        </ToolbarButton>
      </Toolbar>
    </div>
  );
}
