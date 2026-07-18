/*
 * Track highlight ("Vercel menu" indicator): JS measures hovered/active row via getBoundingClientRect (not nth-child math, so nesting/variable heights/positioned ancestors all work — fits Tree), writes 4 independent inline insets; CSS owns transition/paint.
 * No DOM injected (React hands it one node, streaming lists cost nothing); rAF follow loop re-measures until stable (tracks disclosure expand/collapse transitions); Resize/MutationObserver re-sync with zero coupling to component state.
 * Transition tempo from --duration-* tokens — motion kill-switch/reduced-motion collapse to instant snap (tokens only, never animation:none).
 */

export type TrackHighlightOptions = {
  /** Selector for the highlightable rows, resolved within the track. */
  itemSelector: string;
  /** Selector for the resting row (active/selected) used when nothing is hovered. */
  activeSelector: string;
  /* Spans resting box across union of every active row (first..last) so contiguous selection reads as one band; off by default (single-select lists rest on one row). */
  range?: boolean;
  /* Follows pointer to hovered row, rests on active row on leave; on by default, off for scroll-driven indicators (ToC) so box only tracks active range. */
  followHover?: boolean;
};

type Box = { x: number; y: number; w: number; h: number };
type LayerState = { ready: boolean; last: Box };

/* Sub-pixel guard: below this, box counts unchanged so follow loop terminates instead of chasing float jitter. */
const STABLE_EPSILON = 0.5;
/* Hard cap on follow frames per settle (reset on new input); disclosure transition settles well within this, cap only fires in a pathological never-stable layout. */
const MAX_FOLLOW_FRAMES = 90;

function isHighlightable(node: Element | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.getAttribute("aria-disabled") !== "true" &&
    node.getAttribute("data-disabled") !== "true" &&
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

  let hovered: HTMLElement | null = null;
  let rafId = 0;
  let followFrames = 0;
  const activeLayer: LayerState = { ready: false, last: { x: 0, y: 0, w: 0, h: 0 } };
  const hoverLayer: LayerState = { ready: false, last: { x: 0, y: 0, w: 0, h: 0 } };

  // One row's box, offset within track's content box (scroll-invariant + border-corrected) so pill lands right whether track/ancestor scrolls or neither.
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
    const actives = Array.from(track.querySelectorAll<HTMLElement>(activeSelector)).filter(isHighlightable);
    if (actives.length === 0) return null;
    if (!range) return measureBox(actives[0], trackRect);
    let box = measureBox(actives[0], trackRect);
    for (let i = 1; i < actives.length; i += 1) {
      const b = measureBox(actives[i], trackRect);
      const left = Math.min(box.x, b.x);
      const top = Math.min(box.y, b.y);
      const right = Math.max(box.x + box.w, b.x + b.w);
      const bottom = Math.max(box.y + box.h, b.y + b.h);
      box = { x: left, y: top, w: right - left, h: bottom - top };
    }
    return box;
  }

  function resolveHoveredBox(trackRect: DOMRect): Box | null {
    if (!followHover || !hovered || !track.contains(hovered) || !isHighlightable(hovered)) return null;
    return measureBox(hovered, trackRect);
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

  // The track owns away state so rows can yield emphasis while the pill follows another item.
  function placeHighlightLayers(): boolean {
    const trackRect = track.getBoundingClientRect();
    const activeBox = resolveActiveBox(trackRect);
    const hoveredBox = resolveHoveredBox(trackRect);
    const isAway = hoveredBox !== null && hovered !== null && !hovered.matches(activeSelector);
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

  /* rAF-coalesced re-measure, runs while box settles (disclosure transition, resize) then stops — no timer/polling at rest; followFrames resets on new input so continuous interaction never trips cap. */
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
    // Hover-follow is pointer-only; touch taps would flash pill to tapped row and back — leave touch to selection path (MutationObserver).
    if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
    const item = event.target.closest<HTMLElement>(itemSelector);
    if (!isHighlightable(item) || !track.contains(item) || item === hovered) return;
    hovered = item;
    scheduleFollow();
  };

  const onPointerLeave = () => {
    if (!hovered) return;
    hovered = null;
    scheduleFollow();
  };

  // Scroll-driven indicators (followHover off) never bind hover — range/selection path drives every move; teardown removeEventListener no-ops if nothing added.
  if (followHover) {
    track.addEventListener("pointerover", onPointerOver);
    track.addEventListener("pointerleave", onPointerLeave);
  }

  const resizeObserver = new ResizeObserver(() => scheduleFollow());
  resizeObserver.observe(track);

  const mutationObserver = new MutationObserver(() => scheduleFollow());
  mutationObserver.observe(track, {
    subtree: true,
    childList: true,
    attributes: true,
    // Selection reflects on these; data-state flips on disclosure. Highlight's own style/data-visible writes excluded — never observes itself into a loop.
    attributeFilter: ["data-selected", "aria-selected", "data-active", "data-state"],
  });

  scheduleFollow();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    track.removeEventListener("pointerover", onPointerOver);
    track.removeEventListener("pointerleave", onPointerLeave);
    track.removeAttribute("data-track-hover");
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}
