import type { PointerEvent as ReactPointerEvent } from "react";
import { glideComposer } from "./composer-glide";

const MESSAGE = '[data-control-family="chat-composer"]:is([data-slot="textarea"], [data-slot="fallback"], [data-slot="editor"])';
const ENGAGED = "data-engaged";

const pressOwners = new WeakMap<Event, Element>();

// React bubbles presses in a portaled picker through the composer; the DOM tree does not.
export function claimComposerPress(event: ReactPointerEvent<HTMLElement>) {
  pressOwners.set(event.nativeEvent, event.currentTarget);
}

const isMessage = (target: EventTarget | null) => target instanceof Element && target.closest(MESSAGE) !== null;

// A press settles on click, not on blur: shifting the layout mid-press would swallow the click.
export function attachComposerEngagement(root: HTMLElement) {
  let press: Event | undefined;
  let pointerDown = false;

  const engaged = () => root.hasAttribute(ENGAGED);
  const engage = (next: boolean) => {
    if (engaged() === next) return;
    glideComposer(root, () => (next ? root.setAttribute(ENGAGED, "") : root.removeAttribute(ENGAGED)));
  };

  const onFocusIn = (event: FocusEvent) => {
    if (isMessage(event.target)) engage(true);
  };
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (pointerDown || (next instanceof Node && root.contains(next))) return;
    if (root.querySelector('[aria-expanded="true"]')) return;
    engage(false);
  };
  const onPointerDown = (event: PointerEvent) => {
    pointerDown = true;
    press = engaged() ? event : undefined;
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  const onClick = () => {
    if (press && pressOwners.get(press) !== root) engage(false);
    press = undefined;
  };

  if (isMessage(document.activeElement) && root.contains(document.activeElement)) root.setAttribute(ENGAGED, "");

  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointercancel", onPointerUp, true);
  document.addEventListener("click", onClick, true);

  return () => {
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("pointerup", onPointerUp, true);
    document.removeEventListener("pointercancel", onPointerUp, true);
    document.removeEventListener("click", onClick, true);
    root.removeAttribute(ENGAGED);
  };
}
