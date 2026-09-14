"use client";

import type { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { useRef, useState } from "react";

type SwitchGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  startProgress: number;
  travel: number;
  direction: number;
  dragged: boolean;
  released: boolean;
  canceled: boolean;
};

const dragThresholdPx = 3;

function switchDragProgress(gesture: SwitchGesture, clientX: number) {
  const deltaX = (clientX - gesture.startX) * gesture.direction;
  return Math.max(0, Math.min(1, gesture.startProgress + deltaX / gesture.travel));
}

function isSwitchLocked(root: HTMLElement) {
  return root.hasAttribute("data-disabled") || root.hasAttribute("data-readonly");
}

export function useSwitchDrag() {
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const gestureRef = useRef<SwitchGesture | null>(null);

  function cancelDrag(gesture: SwitchGesture) {
    gesture.canceled = true;
    setDragProgress(null);
  }

  const dragProps: Pick<
    SwitchPrimitive.Root.Props,
    "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onLostPointerCapture" | "onClick" | "onKeyDown"
  > = {
    onPointerDown(event) {
      const root = event.currentTarget;
      const canDrag = event.isPrimary && event.button === 0 && !isSwitchLocked(root);
      if (!canDrag || !thumbRef.current) return;
      setDragProgress(null);
      const styles = getComputedStyle(root);
      const travel =
        root.clientWidth - Number.parseFloat(styles.paddingLeft) - Number.parseFloat(styles.paddingRight) - thumbRef.current.offsetWidth;
      if (travel <= 0) return;
      const progress = root.hasAttribute("data-checked") ? 1 : 0;
      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startProgress: progress,
        travel,
        direction: styles.direction === "rtl" ? -1 : 1,
        dragged: false,
        released: false,
        canceled: false,
      };
      root.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId || gesture.released) return;
      const root = event.currentTarget;
      if (gesture.canceled || isSwitchLocked(root)) {
        cancelDrag(gesture);
        return;
      }
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (!gesture.dragged) {
        if (Math.abs(deltaY) > Math.max(dragThresholdPx, Math.abs(deltaX))) {
          cancelDrag(gesture);
          return;
        }
        if (Math.abs(deltaX) < dragThresholdPx) return;
        gesture.dragged = true;
      }
      setDragProgress(switchDragProgress(gesture, event.clientX));
    },
    onPointerUp(event) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      gesture.released = true;
      setDragProgress(null);
      if (!gesture.dragged || gesture.canceled) return;
      const root = event.currentTarget;
      const requestedChecked = switchDragProgress(gesture, event.clientX) >= 0.5;
      const shouldToggle = requestedChecked !== root.hasAttribute("data-checked") && !isSwitchLocked(root);
      gesture.canceled = true;
      if (shouldToggle) root.click();
    },
    onPointerCancel(event) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      cancelDrag(gesture);
    },
    onLostPointerCapture(event) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId || gesture.released) return;
      cancelDrag(gesture);
    },
    onKeyDown(event) {
      if (event.key !== "Escape" || !gestureRef.current) return;
      cancelDrag(gestureRef.current);
    },
    onClick(event) {
      if (event.detail === 0) return;
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (gesture?.canceled) {
        event.preventDefault();
        event.stopPropagation();
        event.preventBaseUIHandler();
      }
    },
  };

  return { thumbRef, dragProps, dragProgress };
}
