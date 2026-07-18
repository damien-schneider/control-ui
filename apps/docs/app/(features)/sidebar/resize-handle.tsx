"use client";

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/components/control-ui/lib/cn";
import { useSidebar } from "@/components/control-ui/ui/sidebar";

// Continuous width on top of shadcn's fixed --sidebar-width. Icon-collapse (click/Cmd+B) stays owned by useSidebar(); this adds cursor-driven width between collapsed/expanded, matching Mastra Studio's resize handle.
const MIN_WIDTH = 224; // 14rem — below this, drag snaps to icon-collapse
const MAX_WIDTH = 420;
const DRAG_THRESHOLD = 5; // px before a press counts as drag, not click-to-toggle
const KEYBOARD_STEP = 10;
const WIDTH_VAR = "--sidebar-width";
const WIDTH_STORAGE_KEY = "control-ui-docs:sidebar-width";
const WRAPPER_SELECTOR = '[data-control-ui="sidebar"][data-slot="wrapper"]';
const CONTAINER_SELECTOR = '[data-control-ui="sidebar"][data-slot="container"]';

// SidebarProvider seeds --sidebar-width (16rem) before mount; this is only fallback for computing/clamping — first paint matches its inline value.
const FALLBACK_WIDTH = 256;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function clampWidth(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));
}

function readStoredWidth(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? clampWidth(parsed) : null;
  } catch {
    return null;
  }
}

function writeStoredWidth(value: number) {
  try {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(value));
  } catch {
    // Private mode / quota — width won't persist across visits.
  }
}

function beginResize(handle: HTMLElement, wrapper: HTMLElement | null) {
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  handle.setAttribute("data-resizing", "true");
  wrapper?.setAttribute("data-resizing", "true");
}

function updateCollapsedState(cursorWidth: number, collapsed: boolean, setOpen: (open: boolean) => void): boolean {
  if (cursorWidth < MIN_WIDTH) {
    if (!collapsed) setOpen(false);
    return true;
  }
  if (collapsed) setOpen(true);
  return false;
}

export function DocsSidebarResizeHandle({ className }: { className?: string }) {
  const { state, open, setOpen, toggleSidebar, isMobile } = useSidebar();
  const handleRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const widthRef = useRef(FALLBACK_WIDTH);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const isCollapsed = state === "collapsed";

  // Hydrate persisted width onto live CSS var before paint, so a returning visitor's width never flashes shadcn's 16rem default.
  useIsomorphicLayoutEffect(() => {
    const stored = readStoredWidth();
    if (stored === null) return;
    widthRef.current = stored;
    setWidth(stored);
    handleRef.current?.closest<HTMLElement>(WRAPPER_SELECTOR)?.style.setProperty(WIDTH_VAR, `${stored}px`);
  }, []);

  function commitWidth(next: number) {
    const clamped = clampWidth(next);
    widthRef.current = clamped;
    setWidth(clamped);
    handleRef.current?.closest<HTMLElement>(WRAPPER_SELECTOR)?.style.setProperty(WIDTH_VAR, `${clamped}px`);
    writeStoredWidth(clamped);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();

    draggedRef.current = false;
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // Pointer already gone.
    }

    // WYSIWYG resize: width = cursor X relative to sidebar's left edge, captured once (container doesn't move during gesture).
    const container = handle.closest<HTMLElement>(CONTAINER_SELECTOR);
    const wrapper = handle.closest<HTMLElement>(WRAPPER_SELECTOR);
    const sidebarLeft = container ? container.getBoundingClientRect().left : 0;
    const startX = event.clientX;
    // Local, not a ref: scoped to this single gesture's closures, reset every pointerdown.
    let collapsedDuringDrag = !open;

    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;

    const onMove = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      if (!draggedRef.current && Math.abs(dx) <= DRAG_THRESHOLD) return;
      if (!draggedRef.current) {
        draggedRef.current = true;
        beginResize(handle, wrapper);
      }

      const cursorWidth = ev.clientX - sidebarLeft;
      collapsedDuringDrag = updateCollapsedState(cursorWidth, collapsedDuringDrag, setOpen);
      if (collapsedDuringDrag) return;

      // Ref + direct DOM write only — no React state here, fires on every pointermove.
      const clamped = clampWidth(cursorWidth);
      widthRef.current = clamped;
      wrapper?.style.setProperty(WIDTH_VAR, `${clamped}px`);
    };

    const cleanup = (ev?: globalThis.PointerEvent) => {
      if (ev && ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      handle.removeAttribute("data-resizing");
      wrapper?.removeAttribute("data-resizing");
      // Commit once, at gesture end — dragged-below-min case already handed off to shadcn's collapse mechanics, no width to persist.
      if (draggedRef.current && !collapsedDuringDrag) {
        setWidth(widthRef.current);
        writeStoredWidth(widthRef.current);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", cleanup);
    window.addEventListener("pointercancel", cleanup);
  }

  function onClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    toggleSidebar();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        toggleSidebar();
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (isCollapsed) return;
        commitWidth(widthRef.current - KEYBOARD_STEP);
        return;
      case "ArrowRight":
        event.preventDefault();
        if (isCollapsed) {
          setOpen(true);
          return;
        }
        commitWidth(widthRef.current + KEYBOARD_STEP);
        return;
      case "Home":
        event.preventDefault();
        setOpen(true);
        commitWidth(MIN_WIDTH);
        return;
      case "End":
        event.preventDefault();
        setOpen(true);
        commitWidth(MAX_WIDTH);
        return;
      default:
        return;
    }
  }

  // Mobile renders through the stock Sheet — no in-flow width to resize.
  if (isMobile) return null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA "window splitter" pattern needs pointer/keyboard handlers and focus, which <hr> can't carry.
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={isCollapsed ? undefined : width}
      aria-valuemin={isCollapsed ? undefined : MIN_WIDTH}
      aria-valuemax={isCollapsed ? undefined : MAX_WIDTH}
      aria-valuetext={isCollapsed ? "collapsed" : `${width} pixels`}
      aria-label={`Resize sidebar. Arrow keys to resize, Enter to ${isCollapsed ? "expand" : "collapse"}.`}
      tabIndex={0}
      data-slot="sidebar-rail"
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "group/resize absolute inset-y-0 z-20 hidden w-2 cursor-col-resize touch-none items-center justify-center outline-hidden sm:flex",
        "group-data-[side=left]:-right-1 group-data-[side=right]:-left-1",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block h-3/4 w-px bg-linear-to-b from-transparent via-foreground/25 to-transparent opacity-0 transition-all duration-150 ease-out motion-reduce:transition-none",
          "group-hover/resize:opacity-100 group-focus-visible/resize:opacity-100 group-focus-visible/resize:via-ring",
          "group-data-[resizing=true]/resize:opacity-100 group-data-[resizing=true]/resize:via-foreground/45",
        )}
      />
    </div>
  );
}
