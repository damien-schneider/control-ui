"use client";

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { useIsMobile } from "@/components/control-ui/hooks/use-mobile";
import { cn } from "@/components/control-ui/lib/cn";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Switch } from "@/components/control-ui/ui/switch";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { BASE_SKIN_ID } from "@/components/theme";
import { useThemeModePreference } from "@/components/theme-toggle";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { ContrastPanel } from "./contrast-panel";
import { VarTag } from "./controls";
import { SKIN_META_BY_ID } from "./presets";
import { ThemePreviewCanvas } from "./preview-canvas";
import { parseSkinTheme, skinChangedTokenNames, themeFile, useSkinSource } from "./skin-source";
import { SkinSourceView } from "./skin-source-view";
import { SKIN_CATEGORY, type ThemeCategoryId } from "./theme-categories";
import { ThemeGenerator } from "./theme-generator";
import { useThemeRuntime } from "./theme-runtime-context";
import { TOKEN_CATEGORIES } from "./token-metadata";
import { type TokenEditorProps, TokenPanel } from "./token-panel";
import type { ThemeState } from "./types";
import { toCss } from "./write-vars";

const WORKSPACE_BREAKPOINT = 1024;

function overriddenTokenNames(theme: ThemeState): Set<string> {
  return new Set([...Object.keys(theme.overrides), ...Object.keys(theme.light), ...Object.keys(theme.dark)]);
}

export function ThemeEditor({ category }: { category: ThemeCategoryId }) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const stacked = useIsMobile(WORKSPACE_BREAKPOINT);
  const { t: theme, values, isDark, storageError, setTokens, resetToken, patch } = useThemeRuntime();
  useThemeModePreference();
  const activeMeta = SKIN_META_BY_ID[theme.skin];
  const { source: skinSource, retry: retrySource } = useSkinSource(theme.skin);
  const { source: baseSkinSource } = useSkinSource(BASE_SKIN_ID);

  const cssCopy = useCopyToClipboard({
    text: toCss(theme),
    onCopy: () => setCopyError(null),
    onCopyError: () => setCopyError("Could not copy CSS variables. Try again or allow clipboard access."),
  });

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
        <span className="text-caption font-medium text-foreground">Reduce motion</span>
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

  const panelIntroByGroup: Partial<Record<ThemeContractGroup, ReactNode>> = {
    motion: reduceMotionRow,
    color: <ThemeGenerator />,
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {storageError ? (
        <p role="alert" className="text-caption text-destructive-text">
          {storageError}
        </p>
      ) : null}
      {copyError ? (
        <p role="alert" className="text-caption text-destructive-text">
          {copyError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          CSS names
          <Switch
            aria-label="Caption every control with its CSS variable name"
            checked={theme.labelMode === "css"}
            onCheckedChange={(checked) => patch({ labelMode: checked ? "css" : "friendly" })}
          />
        </span>
        <ButtonLink render={<Link href="/theme-accessibility" />} variant="quiet" size="sm">
          <ShieldCheckIcon aria-hidden className="size-3.5" />
          Open full accessibility audit
        </ButtonLink>
        <Button variant="solid" tone="primary" size="sm" onClick={cssCopy.handleCopy}>
          {cssCopy.isCopied ? "Copied ✓" : "Copy CSS variables"}
        </Button>
      </div>

      <div className={cn("grid min-w-0 items-start gap-6", !stacked && "grid-cols-[minmax(0,1fr)_21rem]")}>
        <div className="min-w-0">
          <ThemePreviewCanvas values={values} skin={theme.skin} />
        </div>

        <aside
          aria-label="Theme variables"
          className={cn(
            "min-w-0 rounded-[var(--radius-panel)] border border-border/70 bg-card p-3",
            stacked ? "order-first" : "sticky top-3 max-h-[calc(100svh-1.5rem)] overflow-y-auto",
          )}
        >
          {category === SKIN_CATEGORY ? (
            <section id="theme-skin" aria-labelledby="theme-skin-title" className="flex min-w-0 flex-col gap-3">
              <header className="min-w-0">
                <h2 id="theme-skin-title" className="text-heading-4 font-semibold text-foreground">
                  {activeMeta.label} source
                </h2>
                <p className="mt-1 text-micro leading-4 text-muted-foreground">
                  Pick a pack from the sidebar. Its tokens and component anatomy ship as the files below.
                </p>
              </header>
              <SkinSourceView label={activeMeta.label} source={skinSource} onRetry={retrySource} />
            </section>
          ) : null}

          {activeTokenCategory ? (
            <TokenPanel
              category={activeTokenCategory}
              editor={editor}
              beforeTokens={panelIntroByGroup[activeTokenCategory.group] ?? null}
              afterCore={
                activeTokenCategory.group === "color" ? <ContrastPanel t={theme} onFix={(textFixes) => patch({ textFixes })} /> : null
              }
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
