import { prefersReducedMotion } from "@/components/control-ui/lib/motion";

export type NotificationCanvasFrame = { reduced: boolean; now: number; deltaMs: number };

export type NotificationCanvasLoop = {
  invalidate: () => void;
  cancel: () => void;
  destroy: () => void;
};

export type NotificationMotionValues = { radius: number; aurora: number; reveal: number; settle: number; lift: number };

const FRAME_MS_AT_60HZ = 1000 / 60;
const MAX_FRAME_DELTA_MS = 100;

function approachAt60Hz(current: number, target: number, response: number, deltaMs: number): number {
  const frameScale = Math.max(0, deltaMs) / FRAME_MS_AT_60HZ;
  return current + (target - current) * (1 - (1 - response) ** frameScale);
}

function motionTargets(state: string | undefined, radius: number): NotificationMotionValues {
  const thinking = state === "thinking";
  return {
    radius,
    /* aurora only while thinking — static pill and opened chat stay clean */
    aurora: thinking ? 1 : 0,
    /* only the collapsed pill is solid black */
    reveal: state === "collapsed" ? 0 : 1,
    /* ink ramp: thinking runs out to transparent, expanded keeps a floor under its reply controls */
    settle: state === "expanded" ? 1 : 0,
    /* parks the aurora sheet high whenever it is off */
    lift: thinking ? 0 : 1,
  };
}

/* Eases the island's shader inputs toward its data-state; returns whether another frame is needed. */
export function createNotificationMotion(initialState: string | undefined) {
  const values = motionTargets(initialState, 0);

  function advance(state: string | undefined, radius: number, reduced: boolean, deltaMs: number): boolean {
    const targets = motionTargets(state, radius);
    if (reduced) {
      Object.assign(values, targets);
      return false;
    }
    values.radius = approachAt60Hz(values.radius, targets.radius, 0.25, deltaMs);
    values.aurora = approachAt60Hz(values.aurora, targets.aurora, 0.06, deltaMs);
    values.reveal = approachAt60Hz(values.reveal, targets.reveal, 0.07, deltaMs);
    values.settle = approachAt60Hz(values.settle, targets.settle, 0.07, deltaMs);
    /* linear exit so the aurora clears the surface before the opening morph collapses it */
    values.lift = targets.lift === 1 ? Math.min(1, values.lift + deltaMs * 0.00216) : approachAt60Hz(values.lift, 0, 0.28, deltaMs);
    return (
      state === "thinking" ||
      Math.abs(values.radius - targets.radius) > 0.05 ||
      Math.abs(values.aurora - targets.aurora) > 0.002 ||
      Math.abs(values.reveal - targets.reveal) > 0.002 ||
      Math.abs(values.settle - targets.settle) > 0.002 ||
      Math.abs(values.lift - targets.lift) > 0.002
    );
  }

  return { values, advance };
}

/* Runs `render` on rAF while it reports motion, idles once static, and pauses offscreen or in hidden tabs. */
export function createNotificationCanvasLoop(
  canvas: HTMLCanvasElement,
  render: (frame: NotificationCanvasFrame) => boolean,
): NotificationCanvasLoop {
  let destroyed = false;
  let intersecting = true;
  let pageVisible = !document.hidden;
  let rafId = 0;
  let staticFrameDrawn = false;
  let previousFrameAt = performance.now();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function tick(): void {
    rafId = 0;
    if (destroyed || !intersecting || !pageVisible) return;
    const now = performance.now();
    const deltaMs = Math.min(MAX_FRAME_DELTA_MS, now - previousFrameAt);
    previousFrameAt = now;
    const reduced = prefersReducedMotion(canvas);
    const keepAnimating = render({ reduced, now, deltaMs }) && !reduced;
    staticFrameDrawn = !keepAnimating;
    if (keepAnimating) rafId = requestAnimationFrame(tick);
  }

  function invalidate(): void {
    staticFrameDrawn = false;
    if (destroyed || !intersecting || !pageVisible || rafId !== 0) return;
    previousFrameAt = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function cancel(): void {
    if (rafId !== 0) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function handleVisibility(): void {
    pageVisible = !document.hidden;
    invalidate();
  }

  const resizeObserver = new ResizeObserver(invalidate);
  resizeObserver.observe(canvas);

  /* pauses offscreen so previews below the fold keep the GPU idle */
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) intersecting = entry.isIntersecting;
      invalidate();
    },
    { rootMargin: "64px" },
  );
  intersectionObserver.observe(canvas);

  /* the theme editor toggles data-motion on <html> live */
  const motionObserver = new MutationObserver(() => {
    if (!staticFrameDrawn || !prefersReducedMotion(canvas)) invalidate();
  });
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });

  /* an idle loop wakes when the island's data-state moves the easing targets */
  const stateObserver = new MutationObserver(invalidate);
  if (canvas.parentElement) stateObserver.observe(canvas.parentElement, { attributes: true, attributeFilter: ["data-state"] });

  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotionQuery.addEventListener("change", invalidate);

  return {
    invalidate,
    cancel,
    destroy() {
      destroyed = true;
      cancel();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionObserver.disconnect();
      stateObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", invalidate);
    },
  };
}
