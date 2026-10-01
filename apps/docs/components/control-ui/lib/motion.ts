const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(node?: Element | null): boolean {
  return globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches === true || node?.closest('[data-motion="reduced"]') != null;
}

export function readDurationMs(element: Element, token: string): number {
  const value = getComputedStyle(element).getPropertyValue(token).trim();
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 0;
  if (value.endsWith("ms")) return amount;
  if (value.endsWith("s")) return amount * 1000;
  return amount;
}
