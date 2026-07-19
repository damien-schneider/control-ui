"use client";

// Exit animation for PM nodes removed synchronously from DOM: node's gone before any transition runs, so @starting-style (entry-only) can't cover the exit.
// Fix: clone element into a fixed-position ghost over its last rect, let editor update immediately, animate ghost out via data-chat-composer-exit/data-exiting (chat-composer-editor.css blur keyframe); self-removes on animationend + timeout backstop.
// Duration from --duration-* tokens (motion kill-switch → instant, no lingering clone); skipped under prefers-reduced-motion.

// Styles the whole-message ghost must carry: .ProseMirror is styled via scoped [&_.ProseMirror] utilities on its mount wrapper, not inherited by a body-appended clone, so copy the ones affecting text rendering. Pill ghost needs none (Tailwind classes + data-slot are global).
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

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function spawnExitGhost(source: HTMLElement, inherit: readonly string[] = []): void {
  if (typeof document === "undefined") return;
  if (prefersReducedMotion()) return;

  const rect = source.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const ghost = document.createElement(source.tagName.toLowerCase());
  // Copy the source's attributes (class, data-slot, …) so utility + skin styling render identically.
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
  ghost.style.zIndex = "50";

  document.body.appendChild(ghost);

  const remove = () => ghost.remove();
  ghost.addEventListener("animationend", remove, { once: true });
  window.setTimeout(remove, 600);
}

// The whole-message ghost (submit) copies these; the pill ghost passes nothing.
export const MESSAGE_GHOST_INHERIT = MESSAGE_INHERIT;
