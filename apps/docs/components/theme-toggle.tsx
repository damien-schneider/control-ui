"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { type ThemeMode, ThemeSegmentedSwitch, type ThemeToggleOption } from "@/components/control-ui/blocks/theme-toggle";
import { cn } from "@/components/control-ui/lib/cn";
import { COLOR_SCHEME_LOCK_ATTR, THEME_STORAGE_KEY, type Theme } from "@/components/theme";

const THEME_CHANGE_EVENT = "control-ui:theme-change";

const themeOptions: readonly ThemeToggleOption[] = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

const disabledThemeOptions: readonly ThemeToggleOption[] = themeOptions.map((option) => ({ ...option, disabled: true }));

type LockSnapshot = Theme | "none";

function currentThemePreference(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* disabled storage */
  }
  return "system";
}

function lockSnapshot(): LockSnapshot {
  if (typeof document === "undefined") return "none";
  const value = document.documentElement.getAttribute(COLOR_SCHEME_LOCK_ATTR);
  return value === "dark" || value === "light" ? value : "none";
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", COLOR_SCHEME_LOCK_ATTR] });
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    observer.disconnect();
  };
}

function subscribeToHydration() {
  return () => {};
}

function clientSnapshot() {
  return true;
}

function serverSnapshot() {
  return false;
}

function notifyThemeChange() {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncThemeMode(value: ThemeMode) {
  if (lockSnapshot() !== "none") return;
  const next = value === "system" ? systemTheme() : value;
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
}

function applyThemeMode(value: ThemeMode) {
  if (lockSnapshot() !== "none") return;
  syncThemeMode(value);
  try {
    if (value === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* disabled storage */
  }
  notifyThemeChange();
}

export function useThemeModePreference(): { locked: Theme | null; value: ThemeMode; setValue: (value: ThemeMode) => void } {
  const preference = useSyncExternalStore<ThemeMode>(subscribeToTheme, currentThemePreference, () => "system");
  const lock = useSyncExternalStore<LockSnapshot>(subscribeToTheme, lockSnapshot, () => "none");
  const locked = lock === "light" || lock === "dark" ? lock : null;
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);

  useEffect(() => {
    if (!hydrated) return;
    if (locked) return;
    syncThemeMode(preference);
  }, [hydrated, locked, preference]);

  useEffect(() => {
    if (!hydrated) return;
    if (locked || preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncThemeMode("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [hydrated, locked, preference]);

  return {
    locked,
    value: locked ?? preference,
    setValue: applyThemeMode,
  };
}

export function ThemeModeSwitch({ className }: { className?: string }) {
  const { locked, value, setValue } = useThemeModePreference();

  return (
    <ThemeSegmentedSwitch
      value={value}
      onValueChange={setValue}
      options={locked ? disabledThemeOptions : themeOptions}
      aria-label="Theme mode"
      aria-disabled={locked ? true : undefined}
      title={locked ? `This skin is ${locked}-only` : undefined}
      data-locked={locked ? "true" : undefined}
      className={cn("border-border/70 bg-background/70 shadow-sm backdrop-blur", locked && "cursor-not-allowed opacity-60", className)}
    />
  );
}
