"use client";

import type { KeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  clampSidebarWidth,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_VAR,
  writeStoredSidebarWidth,
} from "@/app/(features)/sidebar/width";
import { useSidebar } from "@/components/control-ui/ui/sidebar";

const DRAG_THRESHOLD_PX = 5;
const KEYBOARD_STEP = 10;

function beginResize(handle: HTMLElement, wrapper: HTMLElement | null) {
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  handle.setAttribute("data-resizing", "true");
  wrapper?.setAttribute("data-resizing", "true");
}

function updateCollapsedState(cursorWidth: number, collapsed: boolean, setOpen: (open: boolean) => void): boolean {
  if (cursorWidth < MIN_SIDEBAR_WIDTH) {
    if (!collapsed) setOpen(false);
    return true;
  }
  if (collapsed) setOpen(true);
  return false;
}

type DocsSidebarResizeHandleProps = {
  initialWidth: number | null;
  resizeHandleRef: RefObject<HTMLDivElement | null>;
  sidebarWrapperRef: RefObject<HTMLDivElement | null>;
};

export function DocsSidebarResizeHandle({ initialWidth, resizeHandleRef, sidebarWrapperRef }: DocsSidebarResizeHandleProps) {
  const { state, open, setOpen, toggleSidebar, isMobile } = useSidebar();
  const draggedRef = useRef(false);
  const endGestureRef = useRef<((restoreWidth: boolean) => void) | null>(null);
  const widthRef = useRef<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (isMobile) endGestureRef.current?.(true);
  }, [isMobile]);

  useEffect(() => () => endGestureRef.current?.(false), []);

  function commitWidth(next: number) {
    const clamped = clampSidebarWidth(next);
    widthRef.current = clamped;
    setWidth(clamped);
    sidebarWrapperRef.current?.style.setProperty(SIDEBAR_WIDTH_VAR, `${clamped}px`);
    writeStoredSidebarWidth(clamped);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isMobile || event.button !== 0) return;
    event.preventDefault();

    endGestureRef.current?.(true);
    draggedRef.current = false;
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // pointer already gone
    }

    const wrapper = sidebarWrapperRef.current;
    const sidebarLeft = wrapper?.getBoundingClientRect().left ?? 0;
    const startX = event.clientX;
    const committedWidth = widthRef.current ?? initialWidth;
    let collapsedDuringDrag = !open;

    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    const controller = new AbortController();

    const restoreCommittedWidth = () => {
      if (committedWidth === null) return;
      widthRef.current = committedWidth;
      setWidth(committedWidth);
      wrapper?.style.setProperty(SIDEBAR_WIDTH_VAR, `${committedWidth}px`);
    };

    const endGesture = (restoreWidth: boolean) => {
      controller.abort();
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      handle.removeAttribute("data-resizing");
      wrapper?.removeAttribute("data-resizing");
      if (restoreWidth) restoreCommittedWidth();
      if (endGestureRef.current === endGesture) endGestureRef.current = null;
    };
    endGestureRef.current = endGesture;

    const onMove = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dx = ev.clientX - startX;
      if (!draggedRef.current && Math.abs(dx) <= DRAG_THRESHOLD_PX) return;
      if (!draggedRef.current) {
        draggedRef.current = true;
        beginResize(handle, wrapper);
      }

      const cursorWidth = ev.clientX - sidebarLeft;
      collapsedDuringDrag = updateCollapsedState(cursorWidth, collapsedDuringDrag, setOpen);
      if (collapsedDuringDrag) return;
      // pointermove hot path — direct DOM write, no React render
      const clamped = clampSidebarWidth(cursorWidth);
      widthRef.current = clamped;
      wrapper?.style.setProperty(SIDEBAR_WIDTH_VAR, `${clamped}px`);
    };

    const persistResizedWidth = () => {
      const resizedWidth = widthRef.current;
      if (resizedWidth === null) return;
      setWidth(resizedWidth);
      writeStoredSidebarWidth(resizedWidth);
    };

    const finishGesture = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const wasDragged = draggedRef.current;
      const shouldRestoreWidth = ev.type === "pointercancel" || collapsedDuringDrag;
      endGesture(false);
      if (!wasDragged) return;
      if (ev.type === "pointercancel") draggedRef.current = false;
      if (shouldRestoreWidth) {
        restoreCommittedWidth();
        return;
      }

      persistResizedWidth();
    };

    window.addEventListener("pointermove", onMove, { signal: controller.signal });
    window.addEventListener("pointerup", finishGesture, { signal: controller.signal });
    window.addEventListener("pointercancel", finishGesture, { signal: controller.signal });
  }

  function onClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    toggleSidebar();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentWidth = widthRef.current ?? initialWidth;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        toggleSidebar();
        return;
      case "ArrowLeft":
        event.preventDefault();
        if (isCollapsed || currentWidth === null) return;
        commitWidth(currentWidth - KEYBOARD_STEP);
        return;
      case "ArrowRight":
        event.preventDefault();
        if (isCollapsed) {
          setOpen(true);
          return;
        }
        if (currentWidth !== null) commitWidth(currentWidth + KEYBOARD_STEP);
        return;
      case "Home":
        event.preventDefault();
        setOpen(true);
        commitWidth(MIN_SIDEBAR_WIDTH);
        return;
      case "End":
        event.preventDefault();
        setOpen(true);
        commitWidth(MAX_SIDEBAR_WIDTH);
        return;
      default:
        return;
    }
  }

  if (isMobile) return null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA "window splitter" pattern needs pointer/keyboard handlers and focus, which <hr> can't carry.
    <div
      ref={resizeHandleRef}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={isCollapsed ? MIN_SIDEBAR_WIDTH : (width ?? initialWidth ?? MIN_SIDEBAR_WIDTH)}
      aria-valuemin={MIN_SIDEBAR_WIDTH}
      aria-valuemax={MAX_SIDEBAR_WIDTH}
      aria-valuetext={isCollapsed ? "collapsed" : `${width ?? initialWidth ?? MIN_SIDEBAR_WIDTH} pixels`}
      aria-label={
        isCollapsed ? "Resize sidebar. Right arrow or Enter to expand." : "Resize sidebar. Arrow keys to resize, Enter to collapse."
      }
      tabIndex={0}
      data-slot="sidebar-rail"
      data-resize-ready={initialWidth === null ? undefined : ""}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="group/resize absolute inset-y-0 z-20 hidden w-2 cursor-col-resize touch-none items-center justify-center outline-hidden group-data-[side=left]:-right-1 group-data-[side=right]:-left-1 group-data-[side=left]:group-data-[collapsible=offcanvas]:-right-2 group-data-[side=right]:group-data-[collapsible=offcanvas]:-left-2 lg:flex"
    >
      <span
        aria-hidden
        className="pointer-events-none block h-3/4 w-px bg-linear-to-b from-transparent via-foreground/25 to-transparent opacity-0 transition-[opacity,--tw-gradient-via] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none group-hover/resize:opacity-100 group-focus-visible/resize:opacity-100 group-focus-visible/resize:via-ring group-data-[resizing=true]/resize:opacity-100 group-data-[resizing=true]/resize:via-foreground/45"
      />
    </div>
  );
}
