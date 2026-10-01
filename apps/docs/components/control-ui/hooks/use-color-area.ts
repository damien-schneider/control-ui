"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export type ColorAreaOffset = { x: number; y: number };
export type ColorAreaRect = { width: number; height: number };

export type ColorAreaPointer<Element extends HTMLElement> = {
  areaRef: RefObject<Element | null>;
  dragging: boolean;
  onPointerDown: (event: ReactPointerEvent) => void;
};

// window listeners rather than pointer capture, so pointerdown can emit immediately and gated effect owns cleanup
export function useColorArea<Element extends HTMLElement = HTMLDivElement>(
  onChange: (offset: ColorAreaOffset, rect: ColorAreaRect) => void,
  targetRef?: RefObject<Element | null>,
): ColorAreaPointer<Element> {
  const ownRef = useRef<Element | null>(null);
  const areaRef = targetRef ?? ownRef;
  const [dragging, setDragging] = useState(false);
  const emitDragChange = useEffectEvent(onChange);

  useEffect(() => {
    if (!dragging) return;

    function onMove(event: globalThis.PointerEvent) {
      const el = areaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      emitDragChange({ x: event.clientX - rect.left, y: event.clientY - rect.top }, { width: rect.width, height: rect.height });
    }
    function onEnd() {
      setDragging(false);
    }

    const previousSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      document.body.style.userSelect = previousSelect;
    };
  }, [dragging, areaRef]);

  function onPointerDown(event: ReactPointerEvent) {
    if (event.button !== 0) return;
    const el = areaRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      onChange({ x: event.clientX - rect.left, y: event.clientY - rect.top }, { width: rect.width, height: rect.height });
    }
    setDragging(true);
    event.preventDefault();
  }

  return { areaRef, dragging, onPointerDown };
}
