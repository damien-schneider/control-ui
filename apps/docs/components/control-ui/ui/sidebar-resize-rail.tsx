"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSidebar, useSidebarElements, useSidebarSurface } from "@/components/control-ui/ui/sidebar-provider";

const DRAG_THRESHOLD_PX = 5;
const RESIZE_SHIELD_STAMP = { "data-control-ui": "sidebar", "data-control-family": "sidebar", "data-slot": "resize-shield" };
const KEYBOARD_STEP_PX = 10;

export type SidebarResizeRailProps = ComponentProps<"div"> & {
  style?: CSSProperties & SidebarKnobStyle;
};

export function SidebarResizeRail({ className, ref, onPointerDown, onClick, onKeyDown, ...props }: SidebarResizeRailProps) {
  const { open, setOpen, setWidth, toggleSidebar, minWidth, maxWidth, sidebarId } = useSidebar();
  const { wrapperRef, railRef } = useSidebarElements();
  const { side, collapsible } = useSidebarSurface();
  const widthMeasureRef = useRef<HTMLSpanElement>(null);
  const cancelGestureRef = useRef<(() => void) | null>(null);
  const draggedRef = useRef(false);
  const [measuredWidth, setMeasuredWidth] = useState<number>();

  useLayoutEffect(() => {
    const measure = widthMeasureRef.current;
    if (!measure) return;
    const updateMeasuredWidth = () => setMeasuredWidth(Math.round(measure.getBoundingClientRect().width));
    updateMeasuredWidth();
    const observer = new ResizeObserver(updateMeasuredWidth);
    observer.observe(measure);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => cancelGestureRef.current?.(), []);

  function clampWidth(nextWidth: number) {
    return Math.min(maxWidth, Math.max(minWidth, nextWidth));
  }

  function anchoredToLeftEdge(element: Element) {
    return (side === "left") === (getComputedStyle(element).direction !== "rtl");
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    const mountedWrapper = wrapperRef.current;
    const measure = widthMeasureRef.current;
    if (!mountedWrapper || !measure) return;
    const wrapper = mountedWrapper;
    event.preventDefault();
    cancelGestureRef.current?.();
    draggedRef.current = false;
    const handle = event.currentTarget;
    handle.focus({ preventScroll: true, focusVisible: false });
    handle.setPointerCapture(event.pointerId);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const anchoredLeft = anchoredToLeftEdge(handle);
    const sidebarRoot = handle.closest<HTMLElement>('[data-control-family="sidebar"][data-slot="root"]') ?? wrapper;
    const sidebarBounds = sidebarRoot.getBoundingClientRect();
    const initialWidth = measure.getBoundingClientRect().width;
    const previousWidth = sidebarRoot.style.getPropertyValue("--sidebar-width");
    const shield = document.createElement("div");
    for (const [name, value] of Object.entries(RESIZE_SHIELD_STAMP)) shield.setAttribute(name, value);
    const controller = new AbortController();
    let draftWidth = initialWidth;
    const initiallyCollapsed = !open && collapsible !== "none";
    let collapsedDuringDrag = initiallyCollapsed;

    function restoreWidth() {
      sidebarRoot.style.setProperty("--sidebar-width", previousWidth);
    }

    function holdTransitions(held: boolean) {
      if (held) sidebarRoot.style.setProperty("--_sidebar-transition-duration", "0s");
      else sidebarRoot.style.removeProperty("--_sidebar-transition-duration");
    }

    function endGesture() {
      controller.abort();
      shield.remove();
      holdTransitions(false);
      handle.removeAttribute("data-resizing");
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      cancelGestureRef.current = null;
    }

    function cancelGesture() {
      endGesture();
      restoreWidth();
      draggedRef.current = false;
      if (collapsedDuringDrag !== initiallyCollapsed) setOpen(open);
    }
    cancelGestureRef.current = cancelGesture;

    function updateCollapse(cursorWidth: number) {
      const shouldCollapse = collapsible !== "none" && cursorWidth < minWidth;
      if (shouldCollapse !== collapsedDuringDrag) {
        collapsedDuringDrag = shouldCollapse;
        setOpen(!shouldCollapse);
      }
      return shouldCollapse;
    }

    function dragging(pointer: PointerEvent) {
      if (draggedRef.current) return true;
      if (Math.abs(pointer.clientX - startX) <= DRAG_THRESHOLD_PX) return false;
      draggedRef.current = true;
      document.body.append(shield);
      holdTransitions(true);
      handle.setAttribute("data-resizing", "true");
      return true;
    }

    function movePointer(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId || !dragging(pointer)) return;
      const cursorWidth = anchoredLeft ? pointer.clientX - sidebarBounds.left : sidebarBounds.right - pointer.clientX;
      if (updateCollapse(cursorWidth)) return;
      draftWidth = clampWidth(cursorWidth);
      sidebarRoot.style.setProperty("--sidebar-width", `${draftWidth}px`);
    }

    function finishPointer(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId) return;
      endGesture();
      restoreWidth();
      if (draggedRef.current && !collapsedDuringDrag) setWidth(draftWidth);
    }

    function cancelPointer(pointer: PointerEvent) {
      if (pointer.pointerId === pointerId) cancelGesture();
    }

    function cancelWithEscape(keyboard: globalThis.KeyboardEvent) {
      if (keyboard.key !== "Escape") return;
      keyboard.preventDefault();
      cancelGesture();
    }

    window.addEventListener("pointermove", movePointer, { signal: controller.signal });
    window.addEventListener("pointerup", finishPointer, { signal: controller.signal });
    window.addEventListener("pointercancel", cancelPointer, { signal: controller.signal });
    handle.addEventListener("lostpointercapture", cancelPointer, { signal: controller.signal });
    window.addEventListener("blur", cancelGesture, { signal: controller.signal });
    window.addEventListener("keydown", cancelWithEscape, { signal: controller.signal });
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (collapsible !== "none") toggleSidebar();
  }

  function resizeWithArrow(expand: boolean) {
    if (isCollapsed) {
      if (expand) setOpen(true);
      return;
    }
    if (measuredWidth === undefined) return;
    const delta = expand ? KEYBOARD_STEP_PX : -KEYBOARD_STEP_PX;
    setWidth(clampWidth(measuredWidth + delta));
  }

  function expandToWidth(nextWidth: number) {
    if (collapsible !== "none") setOpen(true);
    setWidth(nextWidth);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (collapsible !== "none") toggleSidebar();
        return;
      case "Home":
      case "End":
        event.preventDefault();
        expandToWidth(event.key === "Home" ? minWidth : maxWidth);
        return;
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault();
        resizeWithArrow(event.key === (anchoredToLeftEdge(event.currentTarget) ? "ArrowRight" : "ArrowLeft"));
        return;
    }
  }

  const isCollapsed = !open && collapsible !== "none";
  const widthDescription = measuredWidth === undefined ? undefined : `${measuredWidth} pixels`;
  return useRender({
    defaultTagName: "div",
    ref: [ref ?? null, railRef],
    props: {
      ...props,
      role: "separator",
      "aria-orientation": "vertical",
      "aria-controls": sidebarId,
      "aria-label": props["aria-label"] ?? "Resize sidebar",
      "aria-valuenow": isCollapsed ? 0 : measuredWidth,
      "aria-valuemin": collapsible === "none" ? minWidth : 0,
      "aria-valuemax": maxWidth,
      "aria-valuetext": props["aria-valuetext"] ?? (isCollapsed ? "collapsed" : widthDescription),
      tabIndex: 0,
      "data-control-ui": "sidebar",
      "data-control-family": "sidebar",
      "data-slot": "rail",
      "data-resizable": "",
      "data-resize-ready": measuredWidth === undefined ? undefined : "",
      onPointerDown: handlePointerDown,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      className: cn(
        "absolute inset-y-0 z-(--z-sticky) hidden cursor-col-resize touch-pan-y group-data-[side=left]:-end-1 group-data-[side=right]:-start-1 group-data-[side=left]:group-data-[collapsible=offcanvas]:-end-2 group-data-[side=right]:group-data-[collapsible=offcanvas]:-start-2 sidebar:block",
        className,
      ),
      children: (
        <>
          <span ref={widthMeasureRef} aria-hidden className="pointer-events-none invisible absolute w-(--sidebar-width)" />
          {props.children}
        </>
      ),
    },
  });
}
