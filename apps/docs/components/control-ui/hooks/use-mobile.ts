import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

// One store per breakpoint, module-scoped: useSyncExternalStore re-subscribes whenever subscribe/getSnapshot change identity,
// so the pair has to survive re-renders — a per-call closure would tear down and rebuild the listener on every render.
const viewportStores = new Map<number, { subscribe: (onChange: () => void) => () => void; getSnapshot: () => boolean }>();

function viewportStore(breakpoint: number) {
  const cached = viewportStores.get(breakpoint);
  if (cached) return cached;

  const mobileQuery = `(max-width: ${breakpoint - 1}px)`;
  const store = {
    subscribe(onChange: () => void) {
      const query = window.matchMedia(mobileQuery);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    getSnapshot: () => window.matchMedia(mobileQuery).matches,
  };
  viewportStores.set(breakpoint, store);
  return store;
}

function getServerViewportSnapshot() {
  return false;
}

/** True below `breakpoint` px (Tailwind `md` by default); pass another breakpoint to match a layout that switches elsewhere. */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const store = viewportStore(breakpoint);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerViewportSnapshot);
}
