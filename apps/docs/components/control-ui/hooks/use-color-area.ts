"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export type ColorAreaOffset = { x: number; y: number };
export type ColorAreaRect = { width: number; height: number };

export type ColorAreaPointer = {
  areaRef: RefObject<HTMLDivElement | null>;
  dragging: boolean;
  onPointerDown: (event: ReactPointerEvent) => void;
};

// pointer-drag for 2D color surfaces (sat/value area + hue/sat wheel); uses window listeners rather
// than pointer capture so pointerdown can emit immediately and the gated effect can own cleanup
// tracks window pointermove/up + suppresses text selection; caller owns pixel→color mapping, hook only reports offset
export function useColorArea(onChange: (offset: ColorAreaOffset, rect: ColorAreaRect) => void): ColorAreaPointer {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const emitDragChange = useEffectEvent(onChange);

  useEffect(() => {
    if (!dragging) return;

    function emit(clientX: number, clientY: number) {
      const el = areaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      emitDragChange({ x: clientX - rect.left, y: clientY - rect.top }, { width: rect.width, height: rect.height });
    }
    function onMove(event: globalThis.PointerEvent) {
      emit(event.clientX, event.clientY);
    }
    function onUp() {
      setDragging(false);
    }

    const previousSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = previousSelect;
    };
  }, [dragging]);

  function onPointerDown(event: ReactPointerEvent) {
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
