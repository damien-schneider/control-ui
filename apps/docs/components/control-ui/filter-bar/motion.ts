"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function filterMotionEnabled(element: HTMLElement) {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--duration-fast")) > 0
  );
}

function animateMovement(element: HTMLElement, before: DOMRect, after: DOMRect, duration: number, easing: string) {
  const x = before.left - after.left;
  const y = before.top - after.top;
  if (Math.abs(x) < 1 && Math.abs(y) < 1) return null;
  return element.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" }], { duration, easing });
}

function animateLayout(
  elements: Map<string, HTMLElement>,
  before: Map<string, DOMRect>,
  after: Map<string, DOMRect>,
  animations: Map<string, Animation>,
  duration: number,
  easing: string,
) {
  for (const [key, bounds] of after) {
    const origin = before.get(key);
    const element = elements.get(key);
    if (!origin || !element) continue;
    const animation = animateMovement(element, origin, bounds, duration, easing);
    if (animation) animations.set(key, animation);
  }
}

export function useFilterBarMotion() {
  const rootRef = useRef<HTMLFieldSetElement>(null);
  const [motion] = useState(() => {
    const elements = new Map<string, HTMLElement>();
    const animations = new Map<string, Animation>();
    let captured: Map<string, DOMRect> | null = null;

    function measure() {
      return new Map([...elements].map(([key, element]) => [key, element.getBoundingClientRect()]));
    }

    function cancel() {
      for (const animation of animations.values()) animation.cancel();
      animations.clear();
    }

    return {
      register(key: string, element: HTMLElement | null) {
        if (element) elements.set(key, element);
        else elements.delete(key);
      },
      capture() {
        captured = measure();
      },
      cancel,
      play() {
        const root = rootRef.current;
        if (!root || !filterMotionEnabled(root)) {
          cancel();
          captured = null;
          return;
        }
        if (!captured) return;
        const origin = captured;
        captured = null;
        cancel();
        const next = measure();
        const computed = getComputedStyle(root);
        const duration = Number.parseFloat(computed.getPropertyValue("--duration-fast"));
        const easing = computed.getPropertyValue("--ease-standard").trim();
        animateLayout(elements, origin, next, animations, duration, easing);
      },
    };
  });

  useLayoutEffect(() => motion.play());
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function cancelReducedMotion() {
      if (media.matches) motion.cancel();
    }
    media.addEventListener("change", cancelReducedMotion);
    return () => {
      media.removeEventListener("change", cancelReducedMotion);
      motion.cancel();
    };
  }, [motion]);
  return { rootRef, ...motion };
}
