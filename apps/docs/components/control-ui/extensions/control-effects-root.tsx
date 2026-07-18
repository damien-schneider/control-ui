"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";

import { type ControlEffect, controlEffectsAttribute } from "@/components/control-ui/extensions/control-effects";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects } from "@/components/control-ui/skin";

type ControlEffectsRootProps = ComponentProps<"div"> & {
  effects?: ControlEffect[];
};

const EMPTY_EFFECTS: ControlEffect[] = [];
const controlSelector = '[data-control-ui][data-control="true"]';

/*
 * Effects CSS-first: top-shine renders entirely from effects.css selectors, scoped by data-effects ancestor attribute.
 * Only imperative work is pointer geometry CSS can't observe: ripple's delegated pointerdown writes --aui-ripple-* +
 * retriggers via data-ripple; hover-circle's delegated pointermove streams --aui-hover-circle-* (grow/shrink stays on :hover).
 * No DOM injected, nothing observed — React owns every node, streaming updates under effect scope cost nothing.
 */

function onRippleEnd(event: AnimationEvent) {
  if (event.animationName !== "aui-ripple-pulse") return;
  const control = event.currentTarget;
  if (!(control instanceof HTMLElement)) return;
  control.removeAttribute("data-ripple");
  control.removeEventListener("animationend", onRippleEnd);
}

function startRipple(control: HTMLElement, event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (control.matches(":disabled,[aria-disabled='true'],[data-disabled='true']")) return;

  const rect = control.getBoundingClientRect();
  control.style.setProperty("--aui-ripple-x", `${event.clientX - rect.left}px`);
  control.style.setProperty("--aui-ripple-y", `${event.clientY - rect.top}px`);
  /* final radius = 1.1 × the longest side, so the pulse covers the control from any click point */
  control.style.setProperty("--aui-ripple-r", `${Math.ceil(Math.max(rect.width, rect.height) * 1.1)}px`);

  /* Restart cleanly mid-pulse: drop attribute, force style flush, re-add (keyframes replay from 0%); re-adding same listener ref dedupes. */
  control.removeAttribute("data-ripple");
  void control.offsetWidth;
  control.setAttribute("data-ripple", "");
  control.addEventListener("animationend", onRippleEnd);
}

/*
 * One document-level listener shared by every mounted root/runtime (refcounted); delegating at document (scope re-checked per click via closest()) lets ripple reach PORTALLED controls.
 * A Dialog's button mounts under <body>, outside any wrapper div — a root-scoped listener + contains() would never see it.
 * Portals re-stamp data-effects on their positioner (next to data-skin), so closest() finds scope on either side of the portal boundary — same semantics as effects.css descendant selectors.
 */
let rippleClients = 0;

function onDocumentPointerDown(event: PointerEvent) {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const control = event.target.closest<HTMLElement>(controlSelector);
  if (!control?.closest('[data-effects~="ripple"]')) return;
  startRipple(control, event);
}

function acquireRippleListener() {
  if (rippleClients === 0) document.addEventListener("pointerdown", onDocumentPointerDown);
  rippleClients += 1;
  return () => {
    rippleClients -= 1;
    if (rippleClients === 0) document.removeEventListener("pointerdown", onDocumentPointerDown);
  };
}

/*
 * hover-circle: CSS owns the disc and its grow/shrink (:hover + registered-property transition); this
 * listener only streams the coordinates the cascade can't observe. Same document-level delegation +
 * refcount as ripple so portalled controls are reached. Rect is cached per hovered control — one
 * getBoundingClientRect per control entered, not per move.
 */
let hoverCircleClients = 0;
let hoverCircleControl: HTMLElement | null = null;
let hoverCircleRect: DOMRect | null = null;

function onDocumentPointerMove(event: PointerEvent) {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest<HTMLElement>(controlSelector);
  if (control !== hoverCircleControl) {
    hoverCircleControl = control?.closest('[data-effects~="hover-circle"]') ? control : null;
    hoverCircleRect = hoverCircleControl?.getBoundingClientRect() ?? null;
    if (hoverCircleControl && hoverCircleRect) {
      /* Disc floods the control from any pointer position — same sizing rule as the ripple radius. */
      const radius = Math.ceil(Math.max(hoverCircleRect.width, hoverCircleRect.height) * 1.1);
      hoverCircleControl.style.setProperty("--aui-hover-circle-r", `${radius}px`);
    }
  }
  if (!hoverCircleControl || !hoverCircleRect) return;
  hoverCircleControl.style.setProperty("--aui-hover-circle-x", `${event.clientX - hoverCircleRect.left}px`);
  hoverCircleControl.style.setProperty("--aui-hover-circle-y", `${event.clientY - hoverCircleRect.top}px`);
}

function acquireHoverCircleListener() {
  if (hoverCircleClients === 0) document.addEventListener("pointermove", onDocumentPointerMove, { passive: true });
  hoverCircleClients += 1;
  return () => {
    hoverCircleClients -= 1;
    if (hoverCircleClients === 0) {
      document.removeEventListener("pointermove", onDocumentPointerMove);
      hoverCircleControl = null;
      hoverCircleRect = null;
    }
  };
}

/**
 * Subtree scope: publishes explicit effects list as data-effects on a display:contents wrapper — caller-wins local override over a skin-declared list.
 * In-tree children inherit scope via CSS ancestor selectors; content children PORTAL away follows skin-declared effects instead (portals re-stamp from skin, not this wrapper).
 */
export function ControlEffectsRoot({ effects = EMPTY_EFFECTS, className, children, ...props }: ControlEffectsRootProps) {
  const effectsValue = controlEffectsAttribute(effects);
  const hasRipple = effects.includes("ripple");
  const hasHoverCircle = effects.includes("hover-circle");

  useEffect(() => (hasRipple ? acquireRippleListener() : undefined), [hasRipple]);
  useEffect(() => (hasHoverCircle ? acquireHoverCircleListener() : undefined), [hasHoverCircle]);

  return (
    <div data-effects={effectsValue} className={cn("contents", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Skin-driven activation: mount ONCE in app layout (inside skin epoch boundary if skin configs swap live — skinEffects() reads mutable config, only remount re-resolves).
 * Mirrors active skin's effects onto <html> so in-tree controls match effects.css ancestor selectors (portals already re-stamp); powers ripple's shared pointer listener. Renders nothing.
 * App w/ skin declaring no effects pays one no-op closest() per pointerdown; app never installing this file pays zero bytes.
 */
export function ControlEffectsRuntime() {
  const effectsValue = skinEffects();

  useEffect(() => {
    const html = document.documentElement;
    if (effectsValue === undefined) html.removeAttribute("data-effects");
    else html.setAttribute("data-effects", effectsValue);
    return () => html.removeAttribute("data-effects");
  }, [effectsValue]);

  useEffect(() => acquireRippleListener(), []);
  /* pointermove is hot — only stream coords while the resolved skin actually declares hover-circle. */
  useEffect(() => (effectsValue?.includes("hover-circle") ? acquireHoverCircleListener() : undefined), [effectsValue]);

  return null;
}
