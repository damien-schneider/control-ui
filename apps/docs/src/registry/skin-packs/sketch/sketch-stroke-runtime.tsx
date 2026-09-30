"use client";

import { useEffect } from "react";
import { sketchStrokeImage } from "./sketch-stroke";

const outlinedControls = [
  '[data-control-family="button"][data-control="true"]:is([data-variant="solid"], [data-variant="surface"])',
  '[data-control-family="field"][data-control="true"]',
  '[data-control-family="choice"][data-choice-kind="checkbox"][data-slot="root"]',
  '[data-control-family="choice"][data-choice-kind="radio-group"][data-slot="item"]',
  '[data-control-family="switch"][data-slot="root"]',
  '[data-control-family="switch"][data-slot="thumb"]',
  '[data-control-family="card"][data-slot="root"]',
  '[data-control-family="popup"][data-popup-part="surface"]:not([data-slot="viewport"])',
  '[data-control-family="popup"][data-popup-part="list-surface"]',
  '[data-control-family="popup"][data-popup-part="bar"]',
  '[data-control-family="badge"][data-slot="root"]',
  '[data-control-family="tabs"][data-slot="list"]',
  '[data-control-family="range"][data-slot="thumb"]',
  '[data-control-family="chat-composer"][data-slot="shell"]',
].join(",");

export function SketchStrokeRuntime() {
  useEffect(() => {
    const previousStyles = new Map<HTMLElement, { image: string; borderWidth: string }>();
    let scheduledFrame = 0;

    function restoreOutline(control: HTMLElement) {
      const previousStyle = previousStyles.get(control);
      if (!previousStyle) return;
      if (previousStyle.image) control.style.setProperty("--sketch-outline-image", previousStyle.image);
      else control.style.removeProperty("--sketch-outline-image");
      if (previousStyle.borderWidth) control.style.setProperty("--sketch-recipe-outline-width", previousStyle.borderWidth);
      else control.style.removeProperty("--sketch-recipe-outline-width");
      previousStyles.delete(control);
      resizeObserver.unobserve(control);
    }

    function drawOutline(control: HTMLElement) {
      const width = control.offsetWidth;
      const height = control.offsetHeight;
      if (width < 8 || height < 8) return;
      const style = getComputedStyle(control);
      const color = style.getPropertyValue("--sketch-outline-color").trim();
      if (!color) return;
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      const nearSquare = Math.abs(width - height) < Math.min(width, height) * 0.2;
      const oval = nearSquare && radius >= Math.min(width, height) / 2;
      const image = sketchStrokeImage(width, height, radius, color, oval);
      if (control.style.getPropertyValue("--sketch-outline-image") !== image) {
        control.style.setProperty("--sketch-outline-image", image);
        control.style.setProperty("--sketch-recipe-outline-width", "0px");
      }
    }

    function syncOutlines() {
      for (const control of document.body.querySelectorAll<HTMLElement>(outlinedControls)) {
        if (control.closest("[data-skin]")?.getAttribute("data-skin") !== "sketch") continue;
        if (!previousStyles.has(control)) {
          previousStyles.set(control, {
            image: control.style.getPropertyValue("--sketch-outline-image"),
            borderWidth: control.style.getPropertyValue("--sketch-recipe-outline-width"),
          });
          resizeObserver.observe(control);
        }
        drawOutline(control);
      }
      removeStaleOutlines();
    }

    function removeStaleOutlines() {
      for (const control of previousStyles.keys()) {
        const hasSketchSkin = control.closest("[data-skin]")?.getAttribute("data-skin") === "sketch";
        const hasOutline = control.isConnected && control.matches(outlinedControls) && hasSketchSkin;
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
    document.addEventListener("focusin", scheduleOutlines);
    document.addEventListener("focusout", scheduleOutlines);
    scheduleOutlines();

    return () => {
      cancelAnimationFrame(scheduledFrame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("focusin", scheduleOutlines);
      document.removeEventListener("focusout", scheduleOutlines);
      for (const control of previousStyles.keys()) restoreOutline(control);
    };
  }, []);

  return null;
}
