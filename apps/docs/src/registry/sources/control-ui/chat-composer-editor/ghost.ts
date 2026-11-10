"use client";

import { prefersReducedMotion, readDurationMs } from "@/components/control-ui/lib/motion";

// ProseMirror removes nodes synchronously, so they are gone before any transition runs and @starting-style cannot cover exit.
// element is cloned into fixed-position ghost over its last rect, animated out by chat-composer-editor.css, and self-removes on animationend with timeout backstop.

const REMOVE_MARGIN_MS = 50;

// .ProseMirror is styled by scoped utilities on its mount wrapper, which a clone outside that wrapper never inherits
const MESSAGE_INHERIT = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "color",
  "padding",
  "white-space",
  "overflow-wrap",
  "word-break",
  "text-align",
] as const;

export function spawnExitGhost(source: HTMLElement, inherit: readonly string[] = []): void {
  if (typeof document === "undefined") return;
  if (prefersReducedMotion(source)) return;

  const rect = source.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const ghost = document.createElement(source.tagName.toLowerCase());
  // carries class and data-slot across so utility and skin styling render identically
  for (const name of source.getAttributeNames()) {
    const value = source.getAttribute(name);
    if (value !== null) ghost.setAttribute(name, value);
  }
  ghost.innerHTML = source.innerHTML;
  ghost.setAttribute("data-chat-composer-exit", "");
  ghost.setAttribute("data-exiting", "");
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("contenteditable");

  if (inherit.length > 0 && typeof getComputedStyle === "function") {
    const computed = getComputedStyle(source);
    for (const property of inherit) ghost.style.setProperty(property, computed.getPropertyValue(property));
  }

  ghost.style.position = "fixed";
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.margin = "0";
  ghost.style.overflow = "hidden";
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "var(--z-popup)";

  // The skin scope keeps the clone's tokens and recipes resolving; <body> has neither when the skin is scoped to a subtree.
  const host = source.closest("[data-skin]") ?? document.body;
  host.appendChild(ghost);

  // A transformed scope (a popup positioner) is the containing block of a fixed child, so shift the clone back onto the source rect.
  const placed = ghost.getBoundingClientRect();
  ghost.style.left = `${rect.left * 2 - placed.left}px`;
  ghost.style.top = `${rect.top * 2 - placed.top}px`;

  const remove = () => ghost.remove();
  ghost.addEventListener("animationend", remove, { once: true });
  window.setTimeout(remove, readDurationMs(ghost, "animation-duration") + REMOVE_MARGIN_MS);
}

export const MESSAGE_GHOST_INHERIT = MESSAGE_INHERIT;
