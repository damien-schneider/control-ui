import { prefersReducedMotion, readDurationMs } from "./motion";

const SHELL = '[data-control-family="chat-composer"][data-slot="shell"]';
const TOOLBAR = '[data-control-family="chat-composer"][data-slot="toolbar"]';
const CONTENT = '[data-slot="textarea"], [data-slot="fallback"], .ProseMirror';

interface Place {
  x: number;
  y: number;
  shown: boolean;
}

interface Layout {
  height: number;
  places: Map<HTMLElement, Place>;
}

function parts(shell: HTMLElement) {
  const children = Array.from(shell.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  return children.flatMap((child) =>
    child.matches(TOOLBAR) ? Array.from(child.children).filter((tool): tool is HTMLElement => tool instanceof HTMLElement) : [child],
  );
}

function placeOf(shell: DOMRect, part: HTMLElement): Place {
  const content = part.matches(CONTENT) ? part : (part.querySelector<HTMLElement>(CONTENT) ?? part);
  const rect = content.getBoundingClientRect();
  const style = getComputedStyle(content);
  return {
    x: rect.left - shell.left + Number.parseFloat(style.paddingLeft),
    y: rect.top - shell.bottom + Number.parseFloat(style.paddingTop),
    shown: rect.width > 0 || rect.height > 0,
  };
}

function readLayout(shell: HTMLElement): Layout {
  const rect = shell.getBoundingClientRect();
  const places = new Map<HTMLElement, Place>();
  for (const part of parts(shell)) {
    if (getComputedStyle(part).position !== "absolute") places.set(part, placeOf(rect, part));
  }
  return { height: rect.height, places };
}

const running = new WeakMap<HTMLElement, Animation[]>();

function glidePart(part: HTMLElement, first: Place | undefined, last: Place, timing: KeyframeAnimationOptions) {
  if (!last.shown) return null;
  if (!first?.shown) return part.animate({ opacity: [0, 1] }, timing);
  const x = first.x - last.x;
  const y = first.y - last.y;
  if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return null;
  return part.animate({ translate: [`${x}px ${y}px`, "0px 0px"] }, timing);
}

export function glideComposer(root: HTMLElement, apply: () => void) {
  const shell = root.querySelector<HTMLElement>(SHELL);
  const duration = shell && !prefersReducedMotion(shell) ? readDurationMs(shell, "--duration-slow") : 0;
  if (!shell || duration <= 0) {
    apply();
    return;
  }

  const before = readLayout(shell);
  for (const animation of running.get(shell) ?? []) animation.cancel();
  apply();
  const after = readLayout(shell);

  const timing: KeyframeAnimationOptions = {
    duration,
    easing: getComputedStyle(shell).getPropertyValue("--ease-standard").trim() || "ease",
  };
  const animations: Animation[] = [];
  if (Math.abs(before.height - after.height) >= 0.5) {
    animations.push(shell.animate({ height: [`${before.height}px`, `${after.height}px`] }, timing));
  }
  for (const [part, last] of after.places) {
    const animation = glidePart(part, before.places.get(part), last, timing);
    if (animation) animations.push(animation);
  }
  running.set(shell, animations);
}
