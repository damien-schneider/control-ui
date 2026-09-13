"use client";

import { ShieldCheckIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Switch } from "@/components/control-ui/ui/switch";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { BASE_SKIN_ID } from "@/components/theme";
import { useThemeModePreference } from "@/components/theme-toggle";
import { ContrastPanel } from "./contrast-panel";
import { ChangeDot, VarTag } from "./controls";
import { downloadThemeArtifact } from "./custom-themes";
import { SKIN_META_BY_ID } from "./presets";
import { SkinSelector } from "./skin-selector";
import { parseSkinTheme, skinChangedTokenNames, themeFile, useSkinSource } from "./skin-source";
import { SkinSourceView } from "./skin-source-view";
import { ThemeArchitecture } from "./theme-architecture";
import { useThemeRuntime } from "./theme-runtime-context";
import { ElevationPreview, LayerPreview, TokenCategorySection, type TokenEditorProps } from "./token-category-section";
import { TOKEN_CATEGORIES } from "./token-metadata";
import type { ThemeState } from "./types";
import { toCss } from "./write-vars";

function overriddenTokenNames(theme: ThemeState): Set<string> {
  return new Set([...Object.keys(theme.overrides), ...Object.keys(theme.light), ...Object.keys(theme.dark)]);
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 px-3 py-2.5 first:pl-0">
      <dt className="text-[9px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-[11px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ThemeVariableSummary({ theme, overridden }: { theme: ThemeState; overridden: Set<string> }) {
  const activeMeta = SKIN_META_BY_ID[theme.skin];
  const fixCount = Object.keys(theme.textFixes).length;

  return (
    <dl className="grid grid-cols-3 divide-x divide-border/70 border-y border-border/70">
      <SummaryMetric label="Skin" value={activeMeta.label} />
      <SummaryMetric label="Token edits" value={overridden.size === 0 ? "None" : overridden.size} />
      <SummaryMetric label="Text fixes" value={fixCount || "None"} />
    </dl>
  );
}

function EditorSectionHeading({ id, number, title, description }: { id?: string; number: string; title: string; description: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[2rem_minmax(0,1fr)]">
      <span className="font-mono text-[10px] text-primary">{number}</span>
      <div className="min-w-0">
        <h3 id={id} className="text-[14px] font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ThemeEditor() {
  const [copyError, setCopyError] = useState<string | null>(null);
  const {
    t: theme,
    values,
    isDark,
    customThemes,
    storageError,
    setTokens,
    resetToken,
    patch,
    selectSkin,
    selectCustomTheme,
    renameCustomTheme,
    duplicateCustomTheme,
    deleteCustomTheme,
    exportCustomTheme,
  } = useThemeRuntime();
  useThemeModePreference();
  const activeMeta = SKIN_META_BY_ID[theme.skin];
  const { source: skinSource, retry: retrySource } = useSkinSource(theme.skin);
  const { source: baseSkinSource } = useSkinSource(BASE_SKIN_ID);

  const cssCopy = useCopyToClipboard({
    text: toCss(theme),
    onCopy: () => setCopyError(null),
    onCopyError: () => setCopyError("Could not copy CSS variables. Try again or allow clipboard access."),
  });

  const overridden = overriddenTokenNames(theme);
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
    overridden,
    changedBySkin: changedBySkin ?? new Set(),
    onChange: (name, value) => setTokens({ [name]: value }),
    onReset: resetToken,
  };

  const reduceMotionRow = (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-foreground/5 px-3 py-2.5">
      <span className="flex min-w-0 flex-col">
        <span className="text-[11px] font-medium text-foreground">Reduce motion</span>
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

  const tokenLegend = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <ChangeDot tone="edit" />
        edited here
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ChangeDot tone="skin" />
        changed by {activeMeta.label}
      </span>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        {storageError ? (
          <p role="alert" className="w-full text-caption text-destructive-text">
            {storageError}
          </p>
        ) : null}
        {copyError ? (
          <p role="alert" className="w-full text-caption text-destructive-text">
            {copyError}
          </p>
        ) : null}
        <ButtonLink render={<Link href="/theme-ai-builder" />} variant="surface" size="sm">
          <SparklesIcon aria-hidden className="size-3.5" />
          Build with AI
        </ButtonLink>
        <Button variant="solid" tone="primary" size="sm" onClick={cssCopy.handleCopy}>
          {cssCopy.isCopied ? "Copied ✓" : "Copy CSS variables"}
        </Button>
      </div>
      <section id="theme-skin" aria-labelledby="theme-skin-title">
        <EditorSectionHeading
          number="01"
          id="theme-skin-title"
          title="Choose a skin"
          description="The selected pack is live across the docs. Start with a token-led theme or an advanced pack that also targets component anatomy."
        />
        <div className="mt-5 flex flex-col gap-4 sm:pl-10">
          <SkinSelector
            skin={theme.skin}
            customThemeId={theme.customThemeId}
            customThemes={customThemes}
            onSelect={selectSkin}
            onSelectCustom={selectCustomTheme}
            onRenameCustom={renameCustomTheme}
            onDuplicateCustom={duplicateCustomTheme}
            onDeleteCustom={deleteCustomTheme}
            onExportCustom={(id) => {
              const artifact = exportCustomTheme(id);
              if (artifact) downloadThemeArtifact(artifact);
            }}
          />
          <SkinSourceView label={activeMeta.label} source={skinSource} onRetry={retrySource} />
        </div>
      </section>

      <ThemeArchitecture skin={theme.skin} />

      <section id="theme-tokens" aria-labelledby="theme-tokens-title" className="scroll-mt-6 border-border border-theme pt-8">
        <EditorSectionHeading
          number="03"
          id="theme-tokens-title"
          title="Edit the token contract"
          description="Every category stays visible: core values first, then derived and fine-grained controls. Changes apply immediately across the docs."
        />
        <div className="mt-5 grid gap-4 sm:pl-10 md:grid-cols-2 md:items-start">
          <ThemeVariableSummary theme={theme} overridden={overridden} />
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-foreground/5 px-3 py-2.5">
            <span className="flex min-w-0 flex-col">
              <span className="text-[11px] font-medium text-foreground">CSS variable names</span>
              <span className="text-[9px] text-muted-foreground">Show the theme.css token on each control</span>
            </span>
            <Switch
              aria-label="Caption every control with its CSS variable name"
              checked={theme.labelMode === "css"}
              onCheckedChange={(checked) => patch({ labelMode: checked ? "css" : "friendly" })}
            />
          </div>
        </div>

        <div className="mt-3 sm:pl-10">{tokenLegend}</div>

        <div className="mt-3">
          {TOKEN_CATEGORIES.map((category) => {
            let preview: ReactNode = null;
            if (category.group === "shadow") preview = <ElevationPreview />;
            else if (category.group === "surface") preview = <LayerPreview values={values} />;

            return (
              <TokenCategorySection
                key={category.group}
                category={category}
                editor={editor}
                preview={preview}
                beforeTokens={category.group === "motion" ? reduceMotionRow : null}
                afterCore={
                  category.group === "color" ? (
                    <div className="grid gap-3">
                      <ContrastPanel t={theme} onFix={(textFixes) => patch({ textFixes })} />
                      <ButtonLink render={<Link href="/theme-accessibility" />} variant="surface" size="sm">
                        <ShieldCheckIcon aria-hidden className="size-3.5" />
                        Open full accessibility audit
                      </ButtonLink>
                    </div>
                  ) : null
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
