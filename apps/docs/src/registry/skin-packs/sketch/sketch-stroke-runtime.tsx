"use client";

import { useEffect } from "react";
import { sketchStrokeImage } from "./sketch-stroke";

const outlineCandidates = "[data-control-family][data-slot], [data-control-family][data-control='true']";
const outlineEvents = ["focusin", "focusout", "pointerover", "pointerout", "transitionend"] as const;

function readOutlinePaint(style: CSSStyleDeclaration) {
  const outlineColor = style.getPropertyValue("--sketch-outline-color").trim();
  const outlineWidth = Number.parseFloat(style.getPropertyValue("--sketch-outline-width"));
  if (outlineColor && outlineWidth > 0) return { color: outlineColor, width: outlineWidth };
  if (outlineColor) return null;

  const borderWidths = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth];
  const borderColors = [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor];
  const borderStyles = [style.borderTopStyle, style.borderRightStyle, style.borderBottomStyle, style.borderLeftStyle];
  const hasUniformBorder =
    borderWidths.every((width) => width === style.borderTopWidth && Number.parseFloat(width) > 0) &&
    borderColors.every((color) => color === style.borderTopColor) &&
    borderStyles.every((borderStyle) => borderStyle === "solid");
  if (!hasUniformBorder) return null;
  return { color: style.borderTopColor, width: Number.parseFloat(style.borderTopWidth) };
}

export function SketchStrokeRuntime() {
  useEffect(() => {
    const previousStyles = new Map<HTMLElement, { image: string; borderWidth: string; slice: string }>();
    let scheduledFrame = 0;

    function restoreOutline(control: HTMLElement) {
      const previousStyle = previousStyles.get(control);
      if (!previousStyle) return;
      if (previousStyle.image) control.style.setProperty("--sketch-outline-image", previousStyle.image);
      else control.style.removeProperty("--sketch-outline-image");
      if (previousStyle.borderWidth) control.style.setProperty("--sketch-recipe-outline-width", previousStyle.borderWidth);
      else control.style.removeProperty("--sketch-recipe-outline-width");
      if (previousStyle.slice) control.style.setProperty("--sketch-outline-slice", previousStyle.slice);
      else control.style.removeProperty("--sketch-outline-slice");
      previousStyles.delete(control);
      resizeObserver.unobserve(control);
    }

    function drawOutline(control: HTMLElement) {
      const style = getComputedStyle(control);
      const paint = readOutlinePaint(style);
      if (!paint) {
        restoreOutline(control);
        return;
      }
      if (!previousStyles.has(control)) {
        previousStyles.set(control, {
          image: control.style.getPropertyValue("--sketch-outline-image"),
          borderWidth: control.style.getPropertyValue("--sketch-recipe-outline-width"),
          slice: control.style.getPropertyValue("--sketch-outline-slice"),
        });
        resizeObserver.observe(control);
      }
      const width = control.offsetWidth;
      const height = control.offsetHeight;
      if (width < 8 || height < 8) return;
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      const nearSquare = Math.abs(width - height) < Math.min(width, height) * 0.2;
      const oval = nearSquare && radius >= Math.min(width, height) / 2;
      const image = sketchStrokeImage(width, height, radius, paint.color, oval, paint.width);
      if (control.style.getPropertyValue("--sketch-outline-image") !== image) {
        control.style.setProperty("--sketch-outline-image", image);
        control.style.setProperty("--sketch-recipe-outline-width", "0px");
        control.style.setProperty("--sketch-outline-slice", String(Math.ceil(Math.max(4, paint.width * 2 + 1))));
      }
    }

    function syncOutlines() {
      for (const control of document.body.querySelectorAll<HTMLElement>(outlineCandidates)) {
        if (control.closest("[data-skin]")?.getAttribute("data-skin") !== "sketch") continue;
        drawOutline(control);
      }
      removeStaleOutlines();
    }

    function removeStaleOutlines() {
      for (const control of previousStyles.keys()) {
        const hasSketchSkin = control.closest("[data-skin]")?.getAttribute("data-skin") === "sketch";
        const hasOutline = control.isConnected && control.matches(outlineCandidates) && hasSketchSkin;
        if (!hasOutline) restoreOutline(control);
      }
    }

    function scheduleOutlines() {
      if (scheduledFrame) return;
      scheduledFrame = requestAnimationFrame(() => {
        scheduledFrame = 0;
        syncOutlines();
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        if (target instanceof HTMLElement) drawOutline(target);
      }
    });
    const mutationObserver = new MutationObserver(scheduleOutlines);
    mutationObserver.observe(document.documentElement, { childList: true, attributes: true, subtree: true });
    for (const event of outlineEvents) document.addEventListener(event, scheduleOutlines);
    scheduleOutlines();

    return () => {
      cancelAnimationFrame(scheduledFrame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      for (const event of outlineEvents) document.removeEventListener(event, scheduleOutlines);
      for (const control of previousStyles.keys()) restoreOutline(control);
    };
  }, []);

  return null;
}
