import {
  type InfiniteCanvasPoint,
  type InfiniteCanvasTransform,
  pinchTransform,
  wheelDeltaMultiplier,
  wheelDeltaPixels,
  zoomAroundPoint,
} from "@/components/control-ui/lib/infinite-canvas-camera";
import type { InfiniteCanvasCameraStore } from "@/components/control-ui/lib/infinite-canvas-camera-store";

export type InfiniteCanvasPanOnDrag = "background" | "anywhere" | "never";

export type InfiniteCanvasNavigationOptions = {
  panOnDrag: InfiniteCanvasPanOnDrag;
  onWheel?: (event: WheelEvent) => void;
};

export type InfiniteCanvasNavigation = {
  beginBackgroundPan: (event: PointerEvent) => void;
  syncPanReady: () => void;
  detach: () => void;
};

type PanGesture = {
  kind: "pan";
  pointerId: number;
  button: number;
  explicit: boolean;
  moved: boolean;
  startPointer: InfiniteCanvasPoint;
  startTransform: InfiniteCanvasTransform;
};

type PinchGesture = {
  kind: "pinch";
  pointerIds: readonly number[];
  startDistance: number;
  startMidpoint: InfiniteCanvasPoint;
  startTransform: InfiniteCanvasTransform;
};

type NavigationGesture = PanGesture | PinchGesture;

export const INFINITE_CANVAS_KEY_SHORTCUTS = "ArrowLeft ArrowRight ArrowUp ArrowDown + - 0 1";

export const ARROW_KEY_DIRECTIONS: Partial<Record<string, InfiniteCanvasPoint>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const KEYBOARD_ZOOM_FACTORS: Partial<Record<string, number>> = { "+": 1.15, "=": 1.15, "-": 1 / 1.15 };
const KEYBOARD_STEP_PX = 32;
const WHEEL_ZOOM_SPEED = 0.004;
const MAX_WHEEL_ZOOM_DELTA = 50;
const NOTCHED_WHEEL_DELTA = 40;
const CLICK_SLOP_PX = 3;
const MIDDLE_BUTTON = 1;
const SCROLLABLE_OVERFLOW = /auto|scroll|overlay/;
const SPACE_CONSUMING_ROLES = [
  "button",
  "checkbox",
  "combobox",
  "menuitem",
  "option",
  "radio",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
];
const SPACE_CONSUMING_TARGET = [
  "input",
  "textarea",
  "select",
  "button",
  "a[href]",
  "[contenteditable]:not([contenteditable='false'])",
  ...SPACE_CONSUMING_ROLES.map((role) => `[role='${role}']`),
].join(", ");

export function keyboardStep(shiftKey: boolean) {
  return shiftKey ? KEYBOARD_STEP_PX * 3 : KEYBOARD_STEP_PX;
}

export function runInfiniteCanvasKeyCommand(camera: InfiniteCanvasCameraStore, key: string, shiftKey: boolean) {
  const direction = ARROW_KEY_DIRECTIONS[key];
  if (direction) {
    const current = camera.getTransform();
    const step = keyboardStep(shiftKey);
    camera.move({ ...current, x: current.x - direction.x * step, y: current.y - direction.y * step }, "keyboard");
    return true;
  }
  const zoomFactor = KEYBOARD_ZOOM_FACTORS[key];
  if (zoomFactor) camera.zoomBy(zoomFactor, { reason: "keyboard" });
  else if (key === "0") camera.reset({ reason: "keyboard" });
  else if (key === "1") camera.fit({ reason: "keyboard" });
  else return false;
  return true;
}

function canScrollFurther(element: Element, delta: InfiniteCanvasPoint) {
  if (element.scrollHeight <= element.clientHeight && element.scrollWidth <= element.clientWidth) return false;
  const { overflowX, overflowY } = getComputedStyle(element);
  const verticalRoom = delta.y < 0 ? element.scrollTop > 0 : Math.ceil(element.scrollTop + element.clientHeight) < element.scrollHeight;
  const horizontalRoom = delta.x < 0 ? element.scrollLeft > 0 : Math.ceil(element.scrollLeft + element.clientWidth) < element.scrollWidth;
  return (
    (delta.y !== 0 && SCROLLABLE_OVERFLOW.test(overflowY) && verticalRoom) ||
    (delta.x !== 0 && SCROLLABLE_OVERFLOW.test(overflowX) && horizontalRoom)
  );
}

function nestedScrollerConsumes(target: EventTarget | null, root: HTMLElement, delta: InfiniteCanvasPoint) {
  for (let element = target instanceof Element ? target : null; element && element !== root; element = element.parentElement) {
    if (canScrollFurther(element, delta)) return true;
  }
  return false;
}

function gesturePointerIds(active: NavigationGesture) {
  return active.kind === "pan" ? [active.pointerId] : active.pointerIds;
}

function clickAfterGesture(ended: NavigationGesture) {
  if (ended.kind === "pinch") return "click";
  if (!(ended.explicit || ended.moved)) return null;
  return ended.button === MIDDLE_BUTTON ? "auxclick" : "click";
}

function gestureScale(event: Event) {
  return "scale" in event && typeof event.scale === "number" ? event.scale : null;
}

function gestureClientPoint(event: Event) {
  if (!("clientX" in event && "clientY" in event)) return null;
  const { clientX, clientY } = event;
  return typeof clientX === "number" && typeof clientY === "number" ? { clientX, clientY } : null;
}

export function attachInfiniteCanvasNavigation(
  root: HTMLElement,
  camera: InfiniteCanvasCameraStore,
  readOptions: () => InfiniteCanvasNavigationOptions,
): InfiniteCanvasNavigation {
  const listeners = new AbortController();
  const { signal } = listeners;
  const touches = new Map<number, InfiniteCanvasPoint>();
  let gesture: NavigationGesture | null = null;
  let spaceHeld = false;
  let safariPinchStartScale: number | null = null;
  let suppressedClick: string | null = null;
  let suppressedClickTimer: ReturnType<typeof setTimeout> | undefined;
  let pointerFocus = false;
  let pointerFocusTimer: ReturnType<typeof setTimeout> | undefined;

  function syncPanReady() {
    root.toggleAttribute("data-pan-ready", spaceHeld || readOptions().panOnDrag === "anywhere");
  }

  function suppressNextClick(type: "click" | "auxclick") {
    suppressedClick = type;
    clearTimeout(suppressedClickTimer);
    suppressedClickTimer = setTimeout(() => {
      suppressedClick = null;
    });
  }

  function startPan(event: PointerEvent, explicit: boolean) {
    root.setPointerCapture(event.pointerId);
    root.toggleAttribute("data-panning", true);
    gesture = {
      kind: "pan",
      pointerId: event.pointerId,
      button: event.button,
      explicit,
      moved: false,
      startPointer: { x: event.clientX, y: event.clientY },
      startTransform: camera.getTransform(),
    };
  }

  function startPinch() {
    const [first, second] = [...touches.entries()];
    if (!(first && second)) return;
    for (const [pointerId] of [first, second]) {
      if (!root.hasPointerCapture(pointerId)) root.setPointerCapture(pointerId);
    }
    root.toggleAttribute("data-panning", true);
    gesture = {
      kind: "pinch",
      pointerIds: [first[0], second[0]],
      startDistance: Math.max(1, Math.hypot(first[1].x - second[1].x, first[1].y - second[1].y)),
      startMidpoint: camera.toLocalPoint({ clientX: (first[1].x + second[1].x) / 2, clientY: (first[1].y + second[1].y) / 2 }),
      startTransform: camera.getTransform(),
    };
  }

  function involvesPointer(pointerId: number) {
    return gesture !== null && gesturePointerIds(gesture).includes(pointerId);
  }

  function finishGesture() {
    const ended = gesture;
    if (!ended) return;
    gesture = null;
    root.removeAttribute("data-panning");
    for (const pointerId of gesturePointerIds(ended)) {
      if (root.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId);
    }
    const click = clickAfterGesture(ended);
    if (click) suppressNextClick(click);
  }

  function claim(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function isNavigableTarget(target: EventTarget | null) {
    return target === root || (target instanceof Node && camera.contentElement()?.contains(target) === true);
  }

  function markPointerFocus() {
    pointerFocus = true;
    clearTimeout(pointerFocusTimer);
    pointerFocusTimer = setTimeout(() => {
      pointerFocus = false;
    });
  }

  function claimsTouchPinch(event: PointerEvent) {
    if (event.pointerType !== "touch") return false;
    if (event.isPrimary) touches.clear();
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.size < 2) return false;
    claim(event);
    if (touches.size === 2) startPinch();
    return true;
  }

  function isExplicitPan(event: PointerEvent) {
    if (!isNavigableTarget(event.target)) return false;
    if (event.button === MIDDLE_BUTTON) return true;
    return event.button === 0 && (spaceHeld || readOptions().panOnDrag === "anywhere");
  }

  function claimNavigationPointer(event: PointerEvent) {
    markPointerFocus();
    if (claimsTouchPinch(event) || gesture || !event.isPrimary || !isExplicitPan(event)) return;
    claim(event);
    startPan(event, true);
  }

  function followPointer(event: PointerEvent) {
    if (touches.has(event.pointerId)) touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!(gesture && involvesPointer(event.pointerId))) return;
    if (gesture.kind === "pan") {
      const deltaX = event.clientX - gesture.startPointer.x;
      const deltaY = event.clientY - gesture.startPointer.y;
      if (Math.hypot(deltaX, deltaY) > CLICK_SLOP_PX) gesture.moved = true;
      const { startTransform } = gesture;
      camera.move({ ...startTransform, x: startTransform.x + deltaX, y: startTransform.y + deltaY }, "pointer");
      return;
    }
    const [first, second] = gesture.pointerIds.map((pointerId) => touches.get(pointerId));
    if (!(first && second)) return;
    const midpoint = camera.toLocalPoint({ clientX: (first.x + second.x) / 2, clientY: (first.y + second.y) / 2 });
    const ratio = Math.hypot(first.x - second.x, first.y - second.y) / gesture.startDistance;
    const nextScale = camera.limitScale(gesture.startTransform.scale * ratio);
    camera.move(pinchTransform(gesture.startTransform, gesture.startMidpoint, midpoint, nextScale), "pinch");
  }

  function releasePointer(event: PointerEvent) {
    touches.delete(event.pointerId);
    if (involvesPointer(event.pointerId)) finishGesture();
  }

  function zoomWithWheel(event: WheelEvent) {
    event.preventDefault();
    if (safariPinchStartScale !== null) return;
    const current = camera.getTransform();
    const zoomDelta = event.deltaY * wheelDeltaMultiplier(event.deltaMode, root.clientHeight);
    const boundedDelta = Math.min(Math.max(zoomDelta, -MAX_WHEEL_ZOOM_DELTA), MAX_WHEEL_ZOOM_DELTA);
    const nextScale = camera.limitScale(current.scale * Math.exp(-boundedDelta * WHEEL_ZOOM_SPEED));
    camera.move(zoomAroundPoint(current, nextScale, camera.toLocalPoint(event)), "wheel", Math.abs(zoomDelta) >= NOTCHED_WHEEL_DELTA);
  }

  function handleWheel(event: WheelEvent) {
    readOptions().onWheel?.(event);
    if (event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey) {
      zoomWithWheel(event);
      return;
    }
    const delta = wheelDeltaPixels(event, root.clientHeight);
    if (nestedScrollerConsumes(event.target, root, delta)) return;
    event.preventDefault();
    const current = camera.getTransform();
    camera.move({ ...current, x: current.x - delta.x, y: current.y - delta.y }, "wheel");
  }

  function startSafariPinch(event: Event) {
    event.preventDefault();
    safariPinchStartScale = camera.getTransform().scale;
  }

  function followSafariPinch(event: Event) {
    event.preventDefault();
    const scale = gestureScale(event);
    if (safariPinchStartScale === null || scale === null || gesture?.kind === "pinch") return;
    const clientPoint = gestureClientPoint(event);
    const origin = clientPoint ? camera.toLocalPoint(clientPoint) : { x: root.clientWidth / 2, y: root.clientHeight / 2 };
    camera.move(zoomAroundPoint(camera.getTransform(), camera.limitScale(safariPinchStartScale * scale), origin), "pinch");
  }

  function endSafariPinch(event: Event) {
    event.preventDefault();
    safariPinchStartScale = null;
  }

  function armSpacePan(event: KeyboardEvent) {
    if (event.code !== "Space") return;
    if (spaceHeld) {
      event.preventDefault();
      return;
    }
    if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    const { target } = event;
    if (target instanceof HTMLElement && (target.isContentEditable || target.matches(SPACE_CONSUMING_TARGET))) return;
    if (!(root.contains(document.activeElement) || root.matches(":hover"))) return;
    event.preventDefault();
    spaceHeld = true;
    syncPanReady();
  }

  function disarmSpacePan(event: KeyboardEvent) {
    if (event.code !== "Space" || !spaceHeld) return;
    spaceHeld = false;
    syncPanReady();
  }

  function releaseHeldInput() {
    spaceHeld = false;
    safariPinchStartScale = null;
    touches.clear();
    finishGesture();
    syncPanReady();
  }

  function swallowClickAfterPan(event: MouseEvent) {
    if (event.type !== suppressedClick) return;
    suppressedClick = null;
    event.preventDefault();
    event.stopPropagation();
  }

  function revealKeyboardFocus(event: FocusEvent) {
    if (pointerFocus || !(event.target instanceof Element)) return;
    if (camera.contentElement()?.contains(event.target)) camera.revealElement(event.target);
  }

  function absorbNativeScroll() {
    const { scrollLeft, scrollTop } = root;
    if (scrollLeft === 0 && scrollTop === 0) return;
    root.scrollTo(0, 0);
    const current = camera.getTransform();
    camera.moveNow({ ...current, x: current.x - scrollLeft, y: current.y - scrollTop }, "reveal");
  }

  root.addEventListener("pointerdown", claimNavigationPointer, { capture: true, signal });
  root.addEventListener("pointermove", followPointer, { capture: true, signal });
  root.addEventListener("pointerup", releasePointer, { capture: true, signal });
  root.addEventListener("pointercancel", releasePointer, { capture: true, signal });
  root.addEventListener(
    "lostpointercapture",
    (event) => {
      if (event.target === root && involvesPointer(event.pointerId)) finishGesture();
    },
    { signal },
  );
  root.addEventListener("click", swallowClickAfterPan, { capture: true, signal });
  root.addEventListener("auxclick", swallowClickAfterPan, { capture: true, signal });
  root.addEventListener(
    "mousedown",
    (event) => {
      if (event.button === MIDDLE_BUTTON && isNavigableTarget(event.target)) event.preventDefault();
    },
    { signal },
  );
  root.addEventListener("wheel", handleWheel, { passive: false, signal });
  root.addEventListener("gesturestart", startSafariPinch, { signal });
  root.addEventListener("gesturechange", followSafariPinch, { signal });
  root.addEventListener("gestureend", endSafariPinch, { signal });
  root.addEventListener("focusin", revealKeyboardFocus, { signal });
  root.addEventListener("scroll", absorbNativeScroll, { signal });
  window.addEventListener("keydown", armSpacePan, { signal });
  window.addEventListener("keyup", disarmSpacePan, { signal });
  window.addEventListener("blur", releaseHeldInput, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") releaseHeldInput();
    },
    { signal },
  );
  syncPanReady();

  return {
    beginBackgroundPan(event) {
      if (gesture || event.defaultPrevented || event.target !== root || !event.isPrimary || event.button !== 0) return;
      if (readOptions().panOnDrag === "background") startPan(event, false);
    },
    syncPanReady,
    detach() {
      listeners.abort();
      clearTimeout(suppressedClickTimer);
      clearTimeout(pointerFocusTimer);
      releaseHeldInput();
      root.removeAttribute("data-pan-ready");
    },
  };
}
