import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getViewportSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerViewportSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeToViewport, getViewportSnapshot, getServerViewportSnapshot);
}
