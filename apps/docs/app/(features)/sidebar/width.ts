export const MIN_SIDEBAR_WIDTH = 224;
export const MAX_SIDEBAR_WIDTH = 420;
export const SIDEBAR_WIDTH_VAR = "--sidebar-width";

const WIDTH_STORAGE_KEY = "control-ui-docs:sidebar-width";

export function clampSidebarWidth(value: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, value));
}

export function readStoredSidebarWidth(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WIDTH_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? clampSidebarWidth(parsed) : null;
  } catch {
    return null;
  }
}

export function writeStoredSidebarWidth(value: number) {
  try {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(value));
  } catch {
    // private mode or quota — width will not persist
  }
}
