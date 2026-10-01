import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

type Breakpoint = number | `--${string}`;

// module-scoped because useSyncExternalStore re-subscribes on identity change — per-call closure would rebuild listener every render
const viewportStores = new Map<Breakpoint, { subscribe: (onChange: () => void) => () => void; getSnapshot: () => boolean }>();

function viewportStore(breakpoint: Breakpoint) {
  const cached = viewportStores.get(breakpoint);
  if (cached) return cached;

  let resolvedQuery: string | undefined;
  function mobileQuery() {
    resolvedQuery ??=
      typeof breakpoint === "number"
        ? `(width < ${breakpoint}px)`
        : `(width < ${getComputedStyle(document.documentElement).getPropertyValue(breakpoint).trim()})`;
    return resolvedQuery;
  }
  const store = {
    subscribe(onChange: () => void) {
      const query = window.matchMedia(mobileQuery());
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    getSnapshot: () => window.matchMedia(mobileQuery()).matches,
  };
  viewportStores.set(breakpoint, store);
  return store;
}

function getServerViewportSnapshot() {
  return false;
}

/** True below `breakpoint`: px (Tailwind `md` by default) or a theme breakpoint token such as `--breakpoint-lg`, so JS and the matching Tailwind variant share one value. */
export function useIsMobile(breakpoint: Breakpoint = MOBILE_BREAKPOINT) {
  const store = viewportStore(breakpoint);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerViewportSnapshot);
}
