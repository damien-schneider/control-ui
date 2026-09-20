"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SidebarKnobStyle } from "@/components/control-ui/knob-contracts/sidebar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSidebar, useSidebarElements, useSidebarSurface } from "@/components/control-ui/ui/sidebar-provider";

const DRAG_THRESHOLD_PX = 5;
const KEYBOARD_STEP_PX = 10;

export type SidebarResizeRailProps = ComponentProps<"div"> & {
  style?: CSSProperties & SidebarKnobStyle;
};

export function SidebarResizeRail({ className, ref, onPointerDown, onClick, onKeyDown, ...props }: SidebarResizeRailProps) {
  const { open, setOpen, setWidth, toggleSidebar, minWidth, maxWidth } = useSidebar();
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
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const wrapperBounds = wrapper.getBoundingClientRect();
    const initialWidth = measure.getBoundingClientRect().width;
    const previousWidth = wrapper.style.getPropertyValue("--sidebar-width");
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const controller = new AbortController();
    let draftWidth = initialWidth;
    const initiallyCollapsed = !open && collapsible !== "none";
    let collapsedDuringDrag = initiallyCollapsed;

    function restoreWidth() {
      wrapper.style.setProperty("--sidebar-width", previousWidth);
    }

    function endGesture() {
      controller.abort();
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      wrapper.removeAttribute("data-resizing");
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

    function movePointer(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId) return;
      const withinClickDistance = Math.abs(pointer.clientX - startX) <= DRAG_THRESHOLD_PX;
      if (!draggedRef.current && withinClickDistance) return;
      draggedRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      wrapper.setAttribute("data-resizing", "true");
      handle.setAttribute("data-resizing", "true");
      const cursorWidth = side === "left" ? pointer.clientX - wrapperBounds.left : wrapperBounds.right - pointer.clientX;
      if (updateCollapse(cursorWidth)) return;
      draftWidth = clampWidth(cursorWidth);
      wrapper.style.setProperty("--sidebar-width", `${draftWidth}px`);
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
        resizeWithArrow(event.key === (side === "left" ? "ArrowRight" : "ArrowLeft"));
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
      "aria-label": props["aria-label"] ?? "Resize sidebar",
      "aria-valuenow": isCollapsed ? 0 : measuredWidth,
      "aria-valuemin": collapsible === "none" ? minWidth : 0,
      "aria-valuemax": maxWidth,
      "aria-valuetext": isCollapsed ? "collapsed" : widthDescription,
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
        "absolute inset-y-0 z-20 hidden cursor-col-resize touch-pan-y outline-hidden group-data-[side=left]:-right-1 group-data-[side=right]:-left-1 group-data-[side=left]:group-data-[collapsible=offcanvas]:-right-2 group-data-[side=right]:group-data-[collapsible=offcanvas]:-left-2 lg:block",
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
