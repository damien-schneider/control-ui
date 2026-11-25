"use client";

import type { ComponentProps, KeyboardEvent, PointerEvent as ReactPointerEvent, WheelEvent } from "react";
import { useEffect, useRef } from "react";
import { useChatWorkspace, useChatWorkspaceElements } from "@/components/control-ui/chat-workspace-state";
import { cn } from "@/components/control-ui/lib/cn";

const DRAG_THRESHOLD_PX = 5;
const KEYBOARD_STEP_PX = 16;
const KEYBOARD_LARGE_STEP_PX = 64;
const RESIZE_SHIELD_STAMP = { "data-control-ui": "chat-workspace", "data-control-family": "chat-workspace", "data-slot": "resize-shield" };

export type ChatWorkspaceResizeHandleProps = Omit<
  ComponentProps<"div">,
  "role" | "aria-orientation" | "aria-valuenow" | "aria-valuemin" | "aria-valuemax" | "aria-controls"
>;

function scrollWhatLiesBeneath(event: WheelEvent<HTMLDivElement>) {
  const beneath = document.elementsFromPoint(event.clientX, event.clientY).find((element) => !event.currentTarget.contains(element));
  beneath?.closest("[data-scroll-area-viewport]")?.scrollBy({ left: event.deltaX, top: event.deltaY });
}

export function ChatWorkspaceResizeHandle({
  className,
  onPointerDown,
  onKeyDown,
  onWheel,
  "aria-label": ariaLabel = "Resize chat panel",
  ...props
}: ChatWorkspaceResizeHandleProps) {
  const { presentation, side, panelId, panelWidth, minPanelWidth, maxPanelWidth, setPanelWidth, clampPanelWidth } = useChatWorkspace();
  const { panelRef } = useChatWorkspaceElements();
  const cancelGestureRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelGestureRef.current?.(), []);

  if (presentation !== "docked") return null;

  const widenSign = side === "right" ? -1 : 1;

  function startGesture(event: ReactPointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    const panel = panelRef.current;
    if (event.defaultPrevented || event.button !== 0 || !panel) return;
    event.preventDefault();
    cancelGestureRef.current?.();
    const handle = event.currentTarget;
    handle.focus({ preventScroll: true, focusVisible: false });
    handle.setPointerCapture(event.pointerId);
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = panel.getBoundingClientRect().width;
    const shield = document.createElement("div");
    for (const [name, value] of Object.entries(RESIZE_SHIELD_STAMP)) shield.setAttribute(name, value);
    const controller = new AbortController();
    let dragged = false;
    let draftWidth = startWidth;

    function endGesture() {
      controller.abort();
      shield.remove();
      handle.removeAttribute("data-resizing");
      if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      cancelGestureRef.current = null;
    }

    function cancelGesture() {
      endGesture();
      if (dragged && panel) panel.style.inlineSize = `${startWidth}px`;
    }
    cancelGestureRef.current = cancelGesture;

    function dragging(pointer: PointerEvent) {
      if (dragged) return true;
      if (Math.abs(pointer.clientX - startX) <= DRAG_THRESHOLD_PX) return false;
      dragged = true;
      document.body.append(shield);
      handle.setAttribute("data-resizing", "");
      return true;
    }

    function movePointer(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId || !dragging(pointer) || !panel) return;
      draftWidth = clampPanelWidth(startWidth + widenSign * (pointer.clientX - startX));
      panel.style.inlineSize = `${draftWidth}px`;
    }

    function finishPointer(pointer: PointerEvent) {
      if (pointer.pointerId !== pointerId) return;
      endGesture();
      if (dragged) setPanelWidth(draftWidth);
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

  function keyboardWidth(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP_PX : KEYBOARD_STEP_PX;
    if (event.key === "ArrowLeft") return panelWidth - widenSign * step;
    if (event.key === "ArrowRight") return panelWidth + widenSign * step;
    if (event.key === "Home") return minPanelWidth;
    if (event.key === "End") return maxPanelWidth;
    return undefined;
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const next = keyboardWidth(event);
    if (next === undefined) return;
    event.preventDefault();
    setPanelWidth(clampPanelWidth(next));
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: focusable window splitter needs pointer and key handlers an <hr> cannot carry
    <div
      {...props}
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation="vertical"
      aria-controls={panelId}
      aria-valuenow={panelWidth}
      aria-valuemin={minPanelWidth}
      aria-valuemax={maxPanelWidth}
      data-control-ui="chat-workspace"
      data-control-family="chat-workspace"
      data-slot="resize-handle"
      className={cn("absolute inset-y-0 touch-none select-none", className)}
      onPointerDown={startGesture}
      onKeyDown={resizeWithKeyboard}
      onWheel={(event) => {
        onWheel?.(event);
        if (!event.defaultPrevented) scrollWhatLiesBeneath(event);
      }}
    />
  );
}
