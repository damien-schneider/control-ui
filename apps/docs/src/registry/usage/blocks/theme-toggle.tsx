"use client";

import { type ThemeMode, ThemeSegmentedSwitch } from "@/components/control-ui/blocks/theme-toggle";

type ThemeAdapter = {
  theme: string | undefined;
  setTheme: (value: string) => void;
};

function toThemeMode(value: string | undefined): ThemeMode {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

export function AppearanceControl({ theme, setTheme }: ThemeAdapter) {
  return <ThemeSegmentedSwitch value={toThemeMode(theme)} onValueChange={(value) => setTheme(value)} />;
}
