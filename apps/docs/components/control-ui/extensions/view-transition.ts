// Two things naive startViewTransition() gets wrong in router-driven app, fixed here: completion stays pending until
// finishPageViewTransition() so browser snapshots NEW page, and transition started mid-flight skips running one.
const FINISH_TIMEOUT_MS = 500;

// lets CSS preset un-name page-level participants while element morph runs
const MORPH_ATTRIBUTE = "data-view-transition";

let finishTransition: (() => void) | null = null;
let activeTransition: ViewTransition | null = null;
let activeMorph: ViewTransition | null = null;

export function supportsViewTransition() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

export function motionReduced() {
  return (
    document.documentElement.getAttribute("data-motion") === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Call once new view is on screen. */
export function finishPageViewTransition() {
  finishTransition?.();
  finishTransition = null;
}

export function startPageViewTransition(update: () => void, { finishTimeout = FINISH_TIMEOUT_MS }: { finishTimeout?: number } = {}) {
  if (!supportsViewTransition() || motionReduced()) {
    update();
    return;
  }

  // jump any mid-flight transition to its end state, so this navigation snapshots live DOM instead of waiting
  activeTransition?.skipTransition();
  finishPageViewTransition();

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        finishTransition = resolve;
        update();
        // blocked or cancelled navigation would otherwise leave page frozen under snapshot
        window.setTimeout(() => {
          if (finishTransition === resolve) {
            finishTransition = null;
            resolve();
          }
        }, finishTimeout);
      }),
  );

  activeTransition = transition;

  // Captured elements paint into overlay and stop being hit-testable, so press during transition would be eaten.
  // Skipping to end brings live DOM back, but that press's click already targeted root — re-target it to whatever now sits under pointer.
  const interrupt = () => {
    transition.skipTransition();
    window.addEventListener(
      "click",
      (click) => {
        if (click.target !== document.documentElement && click.target !== document.body) return;
        const actionable = document.elementFromPoint(click.clientX, click.clientY)?.closest("a, button");
        if (actionable instanceof HTMLElement) actionable.click();
      },
      { capture: true, once: true },
    );
  };
  window.addEventListener("pointerdown", interrupt, { capture: true, once: true });

  // ready/finished reject on mid-flight skip — expected, not error
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      window.removeEventListener("pointerdown", interrupt, { capture: true });
      if (activeTransition === transition) activeTransition = null;
    });
}

// Trigger and surface carry SAME view-transition-name at opposite ends of one state change and browser
// interpolates box between them. `update` must apply its DOM change synchronously — React callers wrap it in flushSync.
// Enforced here: page-level names are un-named for transition's lifetime (they would replay page preset behind the
// morph), and second morph skips first rather than fighting it over overlay. Uniqueness of shared name stays
// caller's job — two live elements holding one name abort transition outright.
export function startMorphViewTransition(update: () => void) {
  if (!supportsViewTransition() || motionReduced()) {
    update();
    return;
  }

  activeMorph?.skipTransition();
  document.documentElement.setAttribute(MORPH_ATTRIBUTE, "morph");

  const transition = document.startViewTransition(update);
  activeMorph = transition;

  // ready/finished reject when skipped mid-flight — expected interruption, not error.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (activeMorph !== transition) return;
      activeMorph = null;
      document.documentElement.removeAttribute(MORPH_ATTRIBUTE);
    });
}
