// Framework-agnostic driver for browser View Transitions API, paired with view-page-rise CSS preset (effects.css .view-page/docs-page + ::view-transition pointer-events passthrough).
// Fixes 2 things naive startViewTransition() gets wrong in a router-driven app: (1) deferred completion — pending until finishPageViewTransition() so browser snapshots NEW page not old (safety timeout unfreezes if navigation never lands); (2) interruption — new transition mid-flight skips the running one + resolves its pending finish, so rapid navigations feel instant.
// Router glue (click guards, prefetch) stays in host-app code; this module only touches the DOM.

const FINISH_TIMEOUT_MS = 500;

// Held while a transition is mid-flight; see finishPageViewTransition().
let finishTransition: (() => void) | null = null;
let activeTransition: ViewTransition | null = null;

export function supportsViewTransition() {
  return typeof document !== "undefined" && typeof document.startViewTransition === "function";
}

export function motionReduced() {
  return (
    document.documentElement.getAttribute("data-motion") === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Resolves the pending transition once the new view is on screen.
export function finishPageViewTransition() {
  finishTransition?.();
  finishTransition = null;
}

// Runs `update` (the navigation) inside a view transition when supported, or directly otherwise.
export function startPageViewTransition(update: () => void, { finishTimeout = FINISH_TIMEOUT_MS }: { finishTimeout?: number } = {}) {
  if (!supportsViewTransition() || motionReduced()) {
    update();
    return;
  }

  // Interrupt mid-flight transition: jump animation to end state, release pending finish, so this navigation snapshots live DOM immediately instead of waiting.
  activeTransition?.skipTransition();
  finishPageViewTransition();

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        finishTransition = resolve;
        update();
        // Safety net: if update never lands (blocked/cancelled nav), don't leave page frozen under transition snapshot.
        window.setTimeout(() => {
          if (finishTransition === resolve) {
            finishTransition = null;
            resolve();
          }
        }, finishTimeout);
      }),
  );

  activeTransition = transition;

  // Transition running: participating elements paint into overlay, stop being hit-testable — pointer events fall through to root and are lost (CSS preset opts root out via view-transition-name:none, shell stays live; this only concerns clicks on captured page body).
  // First pointer press skips to end state instead of eating input, so live DOM is back under pointer for the follow-up click.
  // That press's own click already targeted root before the skip, so it comes out swallowed — re-target to whatever actionable element sits under the pointer once live DOM is back (click that reached a real element is left alone).
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

  // ready/finished reject when transition is skipped mid-flight — expected interruption, not error; swallow so they don't surface as unhandled rejections.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      window.removeEventListener("pointerdown", interrupt, { capture: true });
      if (activeTransition === transition) activeTransition = null;
    });
}
