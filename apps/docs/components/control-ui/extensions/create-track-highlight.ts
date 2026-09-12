export type TrackHighlightOptions = {
  itemSelector: string;
  activeSelector: string;
  range?: boolean;
  followHover?: boolean;
};

type Box = { x: number; y: number; w: number; h: number };
type LayerState = { ready: boolean; last: Box };

const STABLE_EPSILON = 0.5;

const MAX_FOLLOW_FRAMES = 90;

function isHighlightable(node: Element | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    !node.matches(
      ':disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"]), :has([role="checkbox"][data-disabled])',
    ) &&
    node.checkVisibility()
  );
}

export function createTrackHighlight(
  track: HTMLElement,
  highlight: HTMLElement,
  options: TrackHighlightOptions,
  hoverHighlight?: HTMLElement,
): () => void {
  const { itemSelector, activeSelector, range = false, followHover = true } = options;
  highlight.setAttribute("data-measured", "");

  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  let rafId = 0;
  let followFrames = 0;
  const activeLayer: LayerState = { ready: false, last: { x: 0, y: 0, w: 0, h: 0 } };
  const hoverLayer: LayerState = { ready: false, last: { x: 0, y: 0, w: 0, h: 0 } };

  function belongsToTrack(item: HTMLElement): boolean {
    return track.hasAttribute("data-track") ? item.closest("[data-track]") === track : track.contains(item);
  }

  function measureBox(target: HTMLElement, trackRect: DOMRect): Box {
    const rect = target.getBoundingClientRect();
    return {
      x: rect.left - trackRect.left + track.scrollLeft - track.clientLeft,
      y: rect.top - trackRect.top + track.scrollTop - track.clientTop,
      w: rect.width,
      h: rect.height,
    };
  }

  function resolveActiveBox(trackRect: DOMRect): Box | null {
    if (track.dataset.track === "hover") return null;
    const actives = Array.from(track.querySelectorAll<HTMLElement>(activeSelector)).filter(
      (item) => isHighlightable(item) && belongsToTrack(item),
    );
    const firstActive = actives[0];
    if (!firstActive) return null;
    if (!range) return measureBox(firstActive, trackRect);
    let box = measureBox(firstActive, trackRect);
    for (const active of actives.slice(1)) {
      const b = measureBox(active, trackRect);
      const left = Math.min(box.x, b.x);
      const top = Math.min(box.y, b.y);
      const right = Math.max(box.x + box.w, b.x + b.w);
      const bottom = Math.max(box.y + box.h, b.y + b.h);
      box = { x: left, y: top, w: right - left, h: bottom - top };
    }
    return box;
  }

  function resolveHoveredBox(trackRect: DOMRect): Box | null {
    const target = focused ?? hovered;
    if (!followHover || !target || !belongsToTrack(target) || !isHighlightable(target)) return null;
    return measureBox(target, trackRect);
  }

  function place(element: HTMLElement, state: LayerState, next: Box | null, visible: boolean): boolean {
    if (!next) {
      element.removeAttribute("data-visible");
      return false;
    }

    const moved =
      Math.abs(next.x - state.last.x) > STABLE_EPSILON ||
      Math.abs(next.y - state.last.y) > STABLE_EPSILON ||
      Math.abs(next.w - state.last.w) > STABLE_EPSILON ||
      Math.abs(next.h - state.last.h) > STABLE_EPSILON;
    state.last = next;

    if (!state.ready) element.style.transition = "none";
    element.style.left = `${next.x}px`;
    element.style.top = `${next.y}px`;
    element.style.right = `${track.clientWidth - (next.x + next.w)}px`;
    element.style.bottom = `${track.clientHeight - (next.y + next.h)}px`;
    element.toggleAttribute("data-visible", visible);

    if (!state.ready) {
      void element.offsetWidth;
      element.style.transition = "";
      state.ready = true;
    }
    return moved;
  }

  function placeHighlightLayers(): boolean {
    const trackRect = track.getBoundingClientRect();
    const activeBox = resolveActiveBox(trackRect);
    const hoveredBox = resolveHoveredBox(trackRect);
    const target = focused ?? hovered;
    const isAway = hoveredBox !== null && target !== null && !target.matches(activeSelector);
    track.toggleAttribute("data-track-hover", isAway);

    const activeMoved = place(
      highlight,
      activeLayer,
      hoverHighlight ? activeBox : (hoveredBox ?? activeBox),
      Boolean(activeBox || hoveredBox),
    );
    if (!hoverHighlight) highlight.toggleAttribute("data-hover", isAway);
    const hoverMoved = hoverHighlight ? place(hoverHighlight, hoverLayer, hoveredBox ?? activeBox, Boolean(hoveredBox)) : false;

    return activeMoved || hoverMoved;
  }

  function scheduleFollow(): void {
    followFrames = 0;
    if (rafId) return;
    const step = () => {
      rafId = 0;
      const moved = placeHighlightLayers();
      if (!moved || followFrames >= MAX_FOLLOW_FRAMES) return;
      followFrames += 1;
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  const onPointerOver = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    const item = event.target.closest<HTMLElement>(itemSelector);
    const nextHovered = isHighlightable(item) && belongsToTrack(item) ? item : null;
    if (nextHovered === hovered) return;
    hovered = nextHovered;
    scheduleFollow();
  };

  const onPointerLeave = () => {
    if (!hovered) return;
    hovered = null;
    scheduleFollow();
  };

  const onFocusChange = () => {
    const activeElement = document.activeElement;
    const item = activeElement?.closest<HTMLElement>(itemSelector);
    focused = item && belongsToTrack(item) && activeElement?.matches(":focus-visible") && isHighlightable(item) ? item : null;
    scheduleFollow();
  };

  const onFocusOut = () => {
    focused = null;
    scheduleFollow();
  };

  if (followHover) {
    if (matchMedia("(hover: hover)").matches) {
      hovered =
        Array.from(track.querySelectorAll<HTMLElement>(itemSelector)).find(
          (item) => item.matches(":hover") && isHighlightable(item) && belongsToTrack(item),
        ) ?? null;
    }
    onFocusChange();
    track.addEventListener("pointerover", onPointerOver);
    track.addEventListener("pointerleave", onPointerLeave);
    track.addEventListener("focusin", onFocusChange);
    track.addEventListener("focusout", onFocusOut);
  }

  const resizeObserver = new ResizeObserver(() => scheduleFollow());
  resizeObserver.observe(track);

  const mutationObserver = new MutationObserver(() => scheduleFollow());
  mutationObserver.observe(track, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "data-selected",
      "aria-selected",
      "data-active",
      "data-state",
      "data-disabled",
      "aria-disabled",
      "disabled",
      "data-track",
    ],
  });

  scheduleFollow();

  return () => {
    highlight.removeAttribute("data-measured");
    if (rafId) cancelAnimationFrame(rafId);
    track.removeEventListener("pointerover", onPointerOver);
    track.removeEventListener("pointerleave", onPointerLeave);
    track.removeEventListener("focusin", onFocusChange);
    track.removeEventListener("focusout", onFocusOut);
    track.removeAttribute("data-track-hover");
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    for (const element of [highlight, hoverHighlight]) {
      if (!element) continue;
      for (const property of ["top", "left", "right", "bottom"]) element.style.removeProperty(property);
      element.removeAttribute("data-visible");
      element.removeAttribute("data-hover");
    }
  };
}
