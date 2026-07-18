"use client";

import { type ReactNode, useState } from "react";
import { ThemeDropdown, type ThemeMode, ThemeSegmentedSwitch, ThemeSwitch, ThemeToggle } from "@/components/control-ui/blocks/theme-toggle";

const themeLabels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const themeStatus: Record<ThemeMode, string> = {
  light: "Manual light",
  dark: "Manual dark",
  system: "Follows device",
};

function ControlRow({ label, detail, children }: { label: string; detail: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-border bg-card px-3 py-2 text-card-foreground">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      {children}
    </div>
  );
}

export function ThemeToggleExample() {
  const [theme, setTheme] = useState<ThemeMode>("system");

  return (
    <div className="w-full max-w-xl rounded-[var(--radius-panel)] border border-border bg-background p-4 text-foreground shadow-pop">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-semibold">Appearance</span>
          <span className="text-xs text-muted-foreground">{themeStatus[theme]}</span>
        </div>
        <ThemeDropdown value={theme} onValueChange={setTheme} />
      </div>

      <div className="mt-4 grid gap-2">
        <ControlRow label="Mode switch" detail="System / light / dark">
          <ThemeSegmentedSwitch value={theme} onValueChange={setTheme} />
        </ControlRow>
        <ControlRow label="Dark mode" detail="Light / dark">
          <ThemeSwitch value={theme} onValueChange={setTheme} />
        </ControlRow>
        <ControlRow label="Cycle action" detail={themeLabels[theme]}>
          <ThemeToggle value={theme} onValueChange={setTheme} showLabel />
        </ControlRow>
      </div>
    </div>
  );
}
