import { CANVAS_GRID_GAP } from "@/components/control-ui/lib/canvas-grid";
import {
  boundedTransform,
  clampScale,
  fitTransform,
  type InfiniteCanvasBounds,
  type InfiniteCanvasPoint,
  type InfiniteCanvasTransform,
  revealOffset,
  sameTransform,
  toWorldPoint,
  unionBounds,
  zoomAroundPoint,
} from "@/components/control-ui/lib/infinite-canvas-camera";

export type InfiniteCanvasMoveReason = "pointer" | "pinch" | "wheel" | "keyboard" | "control" | "reveal";

export type InfiniteCanvasMoveDetails = { reason: InfiniteCanvasMoveReason };

export type InfiniteCanvasMoveOptions = { reason?: InfiniteCanvasMoveReason };

export type InfiniteCanvasZoomOptions = InfiniteCanvasMoveOptions & { origin?: InfiniteCanvasPoint };

export type InfiniteCanvasRevealOptions = InfiniteCanvasMoveOptions & { padding?: number; area?: InfiniteCanvasBounds };

export type InfiniteCanvasFitOptions = InfiniteCanvasRevealOptions & { maxScale?: number };

export type InfiniteCanvasTransformUpdate = InfiniteCanvasTransform | ((current: InfiniteCanvasTransform) => InfiniteCanvasTransform);

export type InfiniteCanvasClientPoint = { clientX: number; clientY: number };

export type InfiniteCanvasCamera = {
  getTransform: () => InfiniteCanvasTransform;
  setTransform: (update: InfiniteCanvasTransformUpdate, options?: InfiniteCanvasMoveOptions) => void;
  zoomBy: (factor: number, options?: InfiniteCanvasZoomOptions) => void;
  zoomTo: (scale: number, options?: InfiniteCanvasZoomOptions) => void;
  reset: (options?: InfiniteCanvasMoveOptions) => void;
  fit: (options?: InfiniteCanvasFitOptions) => void;
  fitBounds: (bounds: InfiniteCanvasBounds, options?: InfiniteCanvasFitOptions) => void;
  revealBounds: (bounds: InfiniteCanvasBounds, options?: InfiniteCanvasRevealOptions) => void;
  toWorldPoint: (point: InfiniteCanvasClientPoint) => InfiniteCanvasPoint;
  subscribe: (listener: () => void) => () => void;
};

export type InfiniteCanvasCameraOptions = {
  minScale: number;
  maxScale: number;
  defaultTransform: InfiniteCanvasTransform;
  controlled: boolean;
  onTransformChange?: (transform: InfiniteCanvasTransform, details: InfiniteCanvasMoveDetails) => void;
};

export type InfiniteCanvasCameraStore = InfiniteCanvasCamera & {
  camera: InfiniteCanvasCamera;
  configure: (options: InfiniteCanvasCameraOptions) => void;
  attachRoot: (element: HTMLElement | null) => void;
  attachContent: (element: HTMLElement | null) => void;
  contentElement: () => HTMLElement | null;
  getCommittedTransform: () => InfiniteCanvasTransform;
  limitScale: (scale: number) => number;
  move: (next: InfiniteCanvasTransform, reason: InfiniteCanvasMoveReason, eased?: boolean) => void;
  moveNow: (next: InfiniteCanvasTransform, reason: InfiniteCanvasMoveReason) => void;
  adopt: (next: InfiniteCanvasTransform) => void;
  revealElement: (element: Element) => void;
  toLocalPoint: (point: InfiniteCanvasClientPoint) => InfiniteCanvasPoint;
  dispose: () => void;
};

const EASED_BY_REASON: Record<InfiniteCanvasMoveReason, boolean> = {
  pointer: false,
  pinch: false,
  wheel: false,
  keyboard: true,
  control: true,
  reveal: false,
};
const CAMERA_IDLE_MS = 240;
const DEFAULT_FIT_PADDING_PX = 48;
const DEFAULT_FIT_MAX_SCALE = 1;
const DEFAULT_REVEAL_PADDING_PX = 24;
const MIN_GRID_SPACING_PX = CANVAS_GRID_GAP / 2;

export function infiniteCanvasTransformCss({ x, y, scale }: InfiniteCanvasTransform) {
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

export function infiniteCanvasGridStyle({ x, y, scale }: InfiniteCanvasTransform) {
  let spacing = CANVAS_GRID_GAP * scale;
  while (spacing < MIN_GRID_SPACING_PX) spacing *= 2;
  return { backgroundPosition: `${x}px ${y}px`, backgroundSize: `${spacing}px ${spacing}px` };
}

export function createInfiniteCanvasCamera(
  initial: InfiniteCanvasTransform,
  initialOptions: InfiniteCanvasCameraOptions,
): InfiniteCanvasCameraStore {
  let options = initialOptions;
  let latest = initial;
  let committed = initial;
  let pending: { reason: InfiniteCanvasMoveReason; eased: boolean } | null = null;
  let lastEmitted: { transform: InfiniteCanvasTransform; eased: boolean } | null = null;
  let frame = 0;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let root: HTMLElement | null = null;
  let content: HTMLElement | null = null;
  const listeners = new Set<() => void>();

  function writeTransform() {
    if (content) {
      content.style.transform = infiniteCanvasTransformCss(committed);
      content.dataset.scale = String(committed.scale);
    }
    if (root) Object.assign(root.style, infiniteCanvasGridStyle(committed));
  }

  function markMotion(eased: boolean) {
    const element = root;
    if (!element) return;
    element.toggleAttribute("data-moving", true);
    if (eased) element.setAttribute("data-easing", "true");
    else element.removeAttribute("data-easing");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => element.removeAttribute("data-moving"), CAMERA_IDLE_MS);
  }

  function commit(next: InfiniteCanvasTransform, eased: boolean) {
    committed = next;
    markMotion(eased);
    writeTransform();
    for (const listener of listeners) listener();
  }

  function flush() {
    frame = 0;
    if (!pending) return;
    const { reason, eased } = pending;
    pending = null;
    lastEmitted = { transform: latest, eased };
    if (!options.controlled) commit(latest, eased);
    options.onTransformChange?.(latest, { reason });
  }

  function flushNow() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    flush();
  }

  function move(next: InfiniteCanvasTransform, reason: InfiniteCanvasMoveReason, eased = EASED_BY_REASON[reason]) {
    const bounded = boundedTransform(next, options.minScale, options.maxScale);
    if (!bounded || sameTransform(bounded, latest)) return;
    latest = bounded;
    pending = { reason, eased };
    frame ||= requestAnimationFrame(flush);
  }

  function viewportArea(): InfiniteCanvasBounds {
    return { x: 0, y: 0, width: root?.clientWidth ?? 0, height: root?.clientHeight ?? 0 };
  }

  function toLocalPoint(point: InfiniteCanvasClientPoint): InfiniteCanvasPoint {
    const bounds = root?.getBoundingClientRect();
    return { x: point.clientX - (bounds?.left ?? 0), y: point.clientY - (bounds?.top ?? 0) };
  }

  function contentBounds() {
    if (!content) return null;
    const origin = content.getBoundingClientRect();
    const renderedScale = new DOMMatrixReadOnly(getComputedStyle(content).transform).a || committed.scale;
    const rects: InfiniteCanvasBounds[] = [];
    for (const child of content.children) {
      for (const element of [child, ...child.children]) {
        const bounds = element.getBoundingClientRect();
        if (bounds.width === 0 && bounds.height === 0) continue;
        rects.push({
          x: (bounds.left - origin.left) / renderedScale,
          y: (bounds.top - origin.top) / renderedScale,
          width: bounds.width / renderedScale,
          height: bounds.height / renderedScale,
        });
      }
    }
    return unionBounds(rects);
  }

  function revealScreenBounds(screenBounds: InfiniteCanvasBounds, revealOptions: InfiniteCanvasRevealOptions) {
    const offset = revealOffset(screenBounds, revealOptions.area ?? viewportArea(), revealOptions.padding ?? DEFAULT_REVEAL_PADDING_PX);
    if (offset.x === 0 && offset.y === 0) return;
    move({ ...latest, x: latest.x + offset.x, y: latest.y + offset.y }, revealOptions.reason ?? "control");
  }

  function zoomTo(scale: number, zoomOptions: InfiniteCanvasZoomOptions = {}) {
    const area = viewportArea();
    const origin = zoomOptions.origin ?? { x: area.width / 2, y: area.height / 2 };
    move(zoomAroundPoint(latest, clampScale(scale, options.minScale, options.maxScale), origin), zoomOptions.reason ?? "control");
  }

  function fitBounds(bounds: InfiniteCanvasBounds, fitOptions: InfiniteCanvasFitOptions = {}) {
    const limits = {
      padding: fitOptions.padding ?? DEFAULT_FIT_PADDING_PX,
      minScale: options.minScale,
      maxScale: Math.min(fitOptions.maxScale ?? DEFAULT_FIT_MAX_SCALE, options.maxScale),
    };
    move(fitTransform(bounds, fitOptions.area ?? viewportArea(), limits), fitOptions.reason ?? "control");
  }

  const camera: InfiniteCanvasCamera = {
    getTransform: () => latest,
    setTransform(update, moveOptions = {}) {
      move(typeof update === "function" ? update(latest) : update, moveOptions.reason ?? "control");
    },
    zoomTo,
    zoomBy(factor, zoomOptions = {}) {
      zoomTo(latest.scale * factor, zoomOptions);
    },
    reset(moveOptions = {}) {
      move(options.defaultTransform, moveOptions.reason ?? "control");
    },
    fitBounds,
    fit(fitOptions = {}) {
      const bounds = contentBounds();
      if (bounds) fitBounds(bounds, fitOptions);
      else move(options.defaultTransform, fitOptions.reason ?? "control");
    },
    revealBounds(bounds, revealOptions = {}) {
      const screenBounds = {
        x: latest.x + bounds.x * latest.scale,
        y: latest.y + bounds.y * latest.scale,
        width: bounds.width * latest.scale,
        height: bounds.height * latest.scale,
      };
      revealScreenBounds(screenBounds, revealOptions);
    },
    toWorldPoint: (point) => toWorldPoint(latest, toLocalPoint(point)),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return {
    ...camera,
    camera,
    configure(next) {
      options = next;
    },
    attachRoot(element) {
      root = element;
      writeTransform();
    },
    attachContent(element) {
      content = element;
      writeTransform();
    },
    contentElement: () => content,
    getCommittedTransform: () => committed,
    limitScale: (scale) => clampScale(scale, options.minScale, options.maxScale),
    move,
    moveNow(next, reason) {
      move(next, reason, false);
      flushNow();
    },
    adopt(next) {
      const bounded = boundedTransform(next, options.minScale, options.maxScale);
      if (!bounded) return;
      const echo = lastEmitted && sameTransform(bounded, lastEmitted.transform) ? lastEmitted : null;
      if (!echo) {
        cancelAnimationFrame(frame);
        frame = 0;
        pending = null;
      }
      if (!pending) latest = bounded;
      if (!sameTransform(bounded, committed)) commit(bounded, echo?.eased ?? false);
    },
    revealElement(element) {
      const bounds = element.getBoundingClientRect();
      const origin = toLocalPoint({ clientX: bounds.left, clientY: bounds.top });
      revealScreenBounds({ ...origin, width: bounds.width, height: bounds.height }, { reason: "reveal" });
      flushNow();
    },
    toLocalPoint,
    dispose() {
      flushNow();
      clearTimeout(idleTimer);
    },
  };
}
