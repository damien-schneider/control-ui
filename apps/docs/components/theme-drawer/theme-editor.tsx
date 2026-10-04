"use client";

import { type ReactNode, useMemo } from "react";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import { cn } from "@/components/control-ui/lib/cn";
import { Switch } from "@/components/control-ui/ui/switch";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { BASE_SKIN_ID } from "@/components/theme";
import { useThemeModePreference } from "@/components/theme-toggle";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { ContrastPanel } from "./contrast-panel";
import { VarTag } from "./controls";
import { ThemePreviewCanvas } from "./preview-canvas";
import { parseSkinTheme, skinChangedTokenNames, themeFile, useSkinSource } from "./skin-source";
import { SkinWorkspace } from "./skin-source-view";
import { SKIN_CATEGORY, type ThemeCategoryId } from "./theme-categories";
import { ThemeGeneratorDrawer } from "./theme-generator-drawer";
import { useThemeRuntime } from "./theme-runtime-context";
import { TOKEN_CATEGORIES } from "./token-metadata";
import { type TokenEditorProps, TokenPanel } from "./token-panel";
import type { ThemeState } from "./types";

const WORKSPACE_BREAKPOINT = 1024;

function overriddenTokenNames(theme: ThemeState): Set<string> {
  return new Set([...Object.keys(theme.overrides), ...Object.keys(theme.light), ...Object.keys(theme.dark)]);
}

export function ThemeEditor({ category }: { category: ThemeCategoryId }) {
  const stacked = useIsMobile(WORKSPACE_BREAKPOINT);
  const { t: theme, values, isDark, storageError, setTokens, resetToken, patch } = useThemeRuntime();
  useThemeModePreference();
  const { source: skinSource, retry: retrySource } = useSkinSource(theme.skin);
  const { source: baseSkinSource } = useSkinSource(BASE_SKIN_ID);

  const changedBySkin = useMemo(() => {
    if (skinSource.status !== "ready" || baseSkinSource.status !== "ready") return null;
    const activeTheme = themeFile(skinSource.files);
    const baseTheme = themeFile(baseSkinSource.files);
    if (!activeTheme || !baseTheme) return null;
    return skinChangedTokenNames(parseSkinTheme(activeTheme.code), parseSkinTheme(baseTheme.code), isDark);
  }, [skinSource, baseSkinSource, isDark]);
  const editor: TokenEditorProps = {
    values,
    labelMode: theme.labelMode,
    overridden: overriddenTokenNames(theme),
    changedBySkin: changedBySkin ?? new Set(),
    onChange: (name, value) => setTokens({ [name]: value }),
    onReset: resetToken,
  };

  const reduceMotionRow = (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-foreground/5 px-3 py-2.5">
      <span className="flex min-w-0 flex-col">
        <Text size="caption" weight="medium" tone="foreground">
          Reduce motion
        </Text>
        <VarTag>data-motion</VarTag>
      </span>
      <Toggle
        aria-label="Reduce motion"
        variant="surface"
        size="xs"
        className="min-w-[3rem]"
        pressed={theme.reduceMotion}
        onPressedChange={(pressed) => patch({ reduceMotion: pressed })}
      >
        {theme.reduceMotion ? "On" : "Off"}
      </Toggle>
    </div>
  );

  const activeTokenCategory = TOKEN_CATEGORIES.find((item) => item.group === category);

  const panelIntroByGroup: Partial<Record<ThemeContractGroup, ReactNode>> = { motion: reduceMotionRow };
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {storageError ? (
        <Text role="alert" as="p" size="caption" tone="destructive">
          {storageError}
        </Text>
      ) : null}
      {category === SKIN_CATEGORY ? (
        <SkinWorkspace skin={theme.skin} source={skinSource} onRetry={retrySource}>
          <ThemePreviewCanvas category={category} />
        </SkinWorkspace>
      ) : (
        <div className={cn("grid min-w-0 items-start gap-6", !stacked && "grid-cols-[minmax(0,1fr)_21rem]")}>
          <div className="min-w-0">
            <ThemePreviewCanvas category={category} />
          </div>

          <aside
            aria-label="Theme variables"
            className={cn(
              "min-w-0 rounded-[var(--radius-panel)] border border-border/70 bg-card p-3",
              stacked ? "order-first" : "sticky top-3 max-h-[calc(100svh-1.5rem)] overflow-y-auto",
            )}
          >
            {activeTokenCategory ? (
              <TokenPanel
                category={activeTokenCategory}
                editor={editor}
                headerAction={
                  <Text size="micro" tone="muted" className="flex items-center gap-2">
                    CSS names
                    <Switch
                      aria-label="Caption every control with its CSS variable name"
                      checked={theme.labelMode === "css"}
                      onCheckedChange={(checked) => patch({ labelMode: checked ? "css" : "friendly" })}
                    />
                  </Text>
                }
                beforeTokens={panelIntroByGroup[activeTokenCategory.group] ?? null}
                afterCore={
                  activeTokenCategory.group === "color" ? <ContrastPanel t={theme} onFix={(textFixes) => patch({ textFixes })} /> : null
                }
              />
            ) : null}
          </aside>
        </div>
      )}
      <ThemeGeneratorDrawer />
    </div>
  );
}
