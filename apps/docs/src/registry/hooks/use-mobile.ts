import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

// module-scoped because useSyncExternalStore re-subscribes on identity change — per-call closure would rebuild listener every render
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

/** True below `breakpoint` px (Tailwind `md` by default); pass another breakpoint to match layout that switches elsewhere. */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const store = viewportStore(breakpoint);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerViewportSnapshot);
}
