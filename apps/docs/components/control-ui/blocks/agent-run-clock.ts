import { useSyncExternalStore } from "react";

const TICK_MS = 1000;

let now: number | null = null;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | undefined;

function tick() {
  if (document.hidden) return;
  now = Date.now();
  for (const listener of listeners) listener();
}

function onVisibilityChange() {
  if (!document.hidden) tick();
}

function subscribeToRunClock(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    interval = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    clearInterval(interval);
    interval = undefined;
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

const subscribeToNothing = () => () => {};

export function useRunClock(active: boolean): number | null {
  return useSyncExternalStore(
    active ? subscribeToRunClock : subscribeToNothing,
    () => now,
    () => null,
  );
}

function splitElapsed(ms: number) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad2 = (value: number) => String(value).padStart(2, "0");

export function formatElapsed(ms: number): string {
  const { hours, minutes, seconds } = splitElapsed(ms);
  return hours > 0 ? `${hours}:${pad2(minutes)}:${pad2(seconds)}` : `${minutes}:${pad2(seconds)}`;
}

export function elapsedIsoDuration(ms: number): string {
  const { hours, minutes, seconds } = splitElapsed(ms);
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds}S`;
}
