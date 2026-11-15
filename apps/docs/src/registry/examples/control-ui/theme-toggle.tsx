"use client";

import { type ReactNode, useState } from "react";
import { ThemeDropdown, type ThemeMode, ThemeSegmentedSwitch, ThemeSwitch, ThemeToggle } from "@/components/control-ui/blocks/theme-toggle";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/control-ui/ui/item";
import { Text } from "@/components/control-ui/ui/typography";

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
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
        <ItemDescription>{detail}</ItemDescription>
      </ItemContent>
      <ItemActions>{children}</ItemActions>
    </Item>
  );
}

export function ThemeToggleExample() {
  const [theme, setTheme] = useState<ThemeMode>("system");

  return (
    <div className="w-full max-w-xl rounded-[var(--radius-panel)] border border-border bg-background p-4 text-foreground shadow-pop">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text weight="semibold">Appearance</Text>
          <Text size="label" tone="muted">
            {themeStatus[theme]}
          </Text>
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
