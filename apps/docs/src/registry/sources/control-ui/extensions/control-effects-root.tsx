"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { type ControlEffect, controlEffectsAttribute } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";

type ControlEffectsRootProps = ComponentProps<"div"> & {
  effects?: ControlEffect[];
};

const EMPTY_EFFECTS: ControlEffect[] = [];
const controlSelector = '[data-control-ui][data-control="true"]';

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

  control.style.setProperty("--aui-ripple-r", `${Math.ceil(Math.max(rect.width, rect.height) * 1.1)}px`);

  control.removeAttribute("data-ripple");
  void control.offsetWidth;
  control.setAttribute("data-ripple", "");
  control.addEventListener("animationend", onRippleEnd);
}

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

export function ControlEffectsRuntime() {
  const skin = useSkin();
  const effectsValue = controlEffectsAttribute(skin.effects);

  useEffect(() => {
    const html = document.documentElement;
    if (effectsValue === undefined) html.removeAttribute("data-effects");
    else html.setAttribute("data-effects", effectsValue);
    return () => html.removeAttribute("data-effects");
  }, [effectsValue]);

  useEffect(() => acquireRippleListener(), []);

  useEffect(() => (effectsValue?.includes("hover-circle") ? acquireHoverCircleListener() : undefined), [effectsValue]);

  return null;
}
