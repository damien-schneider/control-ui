"use client";

import { CustomizeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldCheckIcon, SparklesIcon, XIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useId, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button, buttonContentClasses, buttonRecipeClasses } from "@/components/control-ui/ui/button";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import { Switch } from "@/components/control-ui/ui/switch";
import { Toggle } from "@/components/control-ui/ui/toggle";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import { useThemeModePreference } from "@/components/theme-toggle";
import type { ThemeContractToken } from "@/src/registry/lib/theme-contract";
import { ContrastPanel } from "./contrast-panel";
import { MiniColorSwatch, TokenControl, VarTag } from "./controls";
import { downloadThemeArtifact } from "./custom-themes";
import { SKIN_META_BY_ID } from "./presets";
import { SkinSelector } from "./skin-selector";
import { ThemeArchitecture } from "./theme-architecture";
import { useThemeRuntime } from "./theme-runtime-context";
import { BADGE_TOKEN_ROWS, TOKEN_CATEGORIES, type TokenCategory, tokenControlSpec } from "./token-metadata";
import type { LabelMode, ThemeState, TokenValues } from "./types";
import { toCss } from "./write-vars";

export function ThemeDrawerTrigger({
  className,
  iconOnly = false,
  onToggle,
  render,
}: {
  className?: string;
  iconOnly?: boolean;
  onToggle?: () => void;
  render?: ComponentProps<typeof Button>["render"];
}) {
  const { open, toggleOpen } = useThemeDrawer();
  const label = open ? "Close theme" : "Edit theme";

  return (
    <Button
      variant="surface"
      size="sm"
      iconOnly={iconOnly}
      active={open}
      onClick={() => {
        toggleOpen();
        onToggle?.();
      }}
      aria-expanded={open}
      aria-label={open ? "Close theme editor" : "Edit theme"}
      title={open ? "Close theme editor" : "Edit theme"}
      render={render}
      className={className}
    >
      <HugeiconsIcon aria-hidden icon={CustomizeIcon} size={16} strokeWidth={1.7} className="shrink-0" />
      <span className={iconOnly ? "sr-only" : undefined}>{label}</span>
    </Button>
  );
}

function overriddenTokenNames(t: ThemeState): Set<string> {
  return new Set([...Object.keys(t.overrides), ...Object.keys(t.light), ...Object.keys(t.dark)]);
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 px-3 py-2.5 first:pl-0">
      <dt className="text-[9px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-[11px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ThemeVariableSummary({ t, overridden }: { t: ThemeState; overridden: Set<string> }) {
  const activeMeta = SKIN_META_BY_ID[t.skin];
  const fixCount = Object.keys(t.textFixes).length;

  return (
    <dl className="grid grid-cols-3 divide-x divide-border/70 border-y border-border/70">
      <SummaryMetric label="Skin" value={activeMeta.label} />
      <SummaryMetric label="Token edits" value={overridden.size === 0 ? "None" : overridden.size} />
      <SummaryMetric label="Contrast" value={fixCount ? `${fixCount} fixed` : "Checked"} />
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

function ElevationPreview() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-[9px] font-medium text-muted-foreground shadow-sm">Control</span>
      <span className="rounded-[var(--radius-control)] bg-popover p-3 text-[9px] font-medium text-muted-foreground shadow-pop">
        Popover
      </span>
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-[9px] font-medium text-muted-foreground shadow-modal">Modal</span>
    </div>
  );
}

function LayerPreview({ values }: { values: TokenValues }) {
  const overlayOpacity = Number.parseFloat(values["--overlay-opacity"] ?? "");
  return (
    <div className="relative min-h-24 overflow-hidden rounded-[var(--radius-control)] bg-canvas p-3 ring-1 ring-inset ring-border">
      <div
        className="absolute inset-0 bg-foreground backdrop-blur-[var(--backdrop-blur-overlay)]"
        style={{ opacity: Number.isNaN(overlayOpacity) ? 0.2 : overlayOpacity }}
      />
      <div className="relative ml-auto w-4/5 rounded-[var(--radius-popover)] bg-popover p-3 text-[10px] text-popover-foreground shadow-pop backdrop-blur-[var(--backdrop-blur-popover)]">
        Popover surface
      </div>
    </div>
  );
}

type TokenEditorProps = {
  values: TokenValues;
  labelMode: LabelMode;
  overridden: Set<string>;
  onChange: (name: string, value: string) => void;
  onReset: (name: string) => void;
};

function TokenList({ tokens, values, labelMode, overridden, onChange, onReset }: TokenEditorProps & { tokens: ThemeContractToken[] }) {
  const control = (token: ThemeContractToken) => (
    <TokenControl
      key={token.name}
      token={token}
      value={values[token.name]}
      labelMode={labelMode}
      overridden={overridden.has(token.name)}
      onChange={(value) => onChange(token.name, value)}
      onReset={() => onReset(token.name)}
    />
  );

  const nodes: ReactNode[] = [];
  let colorRun: ThemeContractToken[] = [];
  const flush = () => {
    if (colorRun.length === 0) return;
    nodes.push(
      <div key={`colors-${colorRun[0].name}`} className="grid grid-cols-2 gap-2.5">
        {colorRun.map(control)}
      </div>,
    );
    colorRun = [];
  };
  for (const token of tokens) {
    if (tokenControlSpec(token).kind === "color") colorRun.push(token);
    else {
      flush();
      nodes.push(control(token));
    }
  }
  flush();
  return <div className="flex flex-col gap-3">{nodes}</div>;
}

function BadgePaletteRows({ values, overridden, onChange, onReset }: Omit<TokenEditorProps, "labelMode">) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-0.5 text-[9px] font-medium text-muted-foreground">
        <span className="flex-1" />
        <span className="w-6 text-center">Fill</span>
        <span className="w-6 text-center">Text</span>
        <span className="w-6 text-center">Line</span>
        <span className="w-6 text-center">Hover</span>
      </div>
      {BADGE_TOKEN_ROWS.map((row) => {
        const touched = row.tokens.some((token) => overridden.has(token.name));
        return (
          <div key={row.color} className="flex items-center gap-2 px-0.5">
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-muted-foreground">
              {row.color}
              {touched ? (
                <button
                  type="button"
                  onClick={() => {
                    for (const token of row.tokens) onReset(token.name);
                  }}
                  className="ml-1.5 cursor-pointer text-[9px] text-primary underline-offset-2 hover:underline"
                >
                  reset
                </button>
              ) : null}
            </span>
            {row.tokens.map((token) => (
              <MiniColorSwatch
                key={token.name}
                token={token}
                value={values[token.name]}
                overridden={overridden.has(token.name)}
                onChange={(value) => onChange(token.name, value)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CategorySection({
  category,
  editor,
  preview,
  afterCore,
  beforeTokens,
}: {
  category: TokenCategory;
  editor: TokenEditorProps;
  preview?: ReactNode;
  afterCore?: ReactNode;
  beforeTokens?: ReactNode;
}) {
  const isColor = category.group === "color";
  const badgeTokens = isColor ? BADGE_TOKEN_ROWS.flatMap((row) => row.tokens) : [];
  const allNames = [...category.core, ...category.advanced, ...badgeTokens].map((token) => token.name);
  const touched = allNames.filter((name) => editor.overridden.has(name)).length;
  const advancedTotal = category.advanced.length + badgeTokens.length;

  return (
    <section
      id={`theme-tokens-${category.group}`}
      aria-labelledby={`theme-tokens-${category.group}-title`}
      className="grid scroll-mt-6 gap-5 border-border/70 border-t py-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8"
    >
      <header className="min-w-0 lg:sticky lg:top-0 lg:z-10 lg:self-start lg:-mx-2 lg:bg-background/95 lg:px-2 lg:py-2 lg:backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h4 id={`theme-tokens-${category.group}-title`} className="text-[12px] font-semibold text-foreground">
            {category.title}
          </h4>
          <span className="text-[9px] tabular-nums text-muted-foreground">{allNames.length} tokens</span>
          {touched > 0 ? (
            <Badge variant="secondary" size="sm">
              {touched} edited
            </Badge>
          ) : null}
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{category.description}</p>
        {preview ? <div className="mt-4">{preview}</div> : null}
      </header>
      <div className="min-w-0">
        {beforeTokens ? <div className="mb-4">{beforeTokens}</div> : null}
        <TokenList tokens={category.core} {...editor} />
        {afterCore ? <div className="mt-5">{afterCore}</div> : null}
        {advancedTotal > 0 ? (
          <div className="mt-6 border-border/70 border-t pt-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <div>
                <h5 className="text-[11px] font-semibold text-foreground">Advanced</h5>
                <p className="mt-0.5 text-[9px] text-muted-foreground">Derived and fine-grained values</p>
              </div>
              <span className="text-[9px] tabular-nums text-muted-foreground">{advancedTotal} tokens</span>
            </div>
            <div className="flex flex-col gap-4">
              <TokenList tokens={category.advanced} {...editor} />
              {isColor ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Badge palette</span>
                  <BadgePaletteRows
                    values={editor.values}
                    overridden={editor.overridden}
                    onChange={editor.onChange}
                    onReset={editor.onReset}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// Editor body only: floating toolbar owns chrome (MorphingPanel morphs toolbar pill into this near-fullscreen surface).
export function ThemeEditorContent({ labelledById, describedById }: { labelledById?: string; describedById?: string }) {
  const { setOpen, skinSource, openSkinSource } = useThemeDrawer();
  const [copied, setCopied] = useState(false);
  const {
    t,
    values,
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
  const fallbackTitleId = useId();
  const fallbackDescriptionId = useId();
  const titleId = labelledById ?? fallbackTitleId;
  const descriptionId = describedById ?? fallbackDescriptionId;

  function selectSkinAndSource(skin: ThemeState["skin"]) {
    selectSkin(skin);
    if (skinSource) openSkinSource(skin);
  }

  // Source docks against viewport edge; editor covers it, so hand screen over.
  function viewSkinSource() {
    openSkinSource(t.skin);
    setOpen(false);
  }

  async function copyCss() {
    try {
      await navigator.clipboard?.writeText(toCss(t));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard denied — ignore */
    }
  }

  const overridden = overriddenTokenNames(t);
  const editor: TokenEditorProps = {
    values,
    labelMode: t.labelMode,
    overridden,
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
        pressed={t.reduceMotion}
        onPressedChange={(pressed) => patch({ reduceMotion: pressed })}
      >
        {t.reduceMotion ? "On" : "Off"}
      </Toggle>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[13px] font-semibold">
            Theme editor
          </h2>
          <p id={descriptionId} className="sr-only">
            Live-edit every theme.css contract token used across this docs site.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="quiet" size="xs" iconOnly aria-label="Close editor" title="Close editor" onClick={() => setOpen(false)}>
            <XIcon aria-hidden className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea mask={false} className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8">
          <section id="theme-skin" aria-labelledby="theme-skin-title">
            <EditorSectionHeading
              number="01"
              id="theme-skin-title"
              title="Choose a skin"
              description="The selected pack is live across the docs. Start with a token-led theme or an advanced pack that also targets component anatomy."
            />
            <div className="mt-5 sm:pl-10">
              <SkinSelector
                skin={t.skin}
                customThemeId={t.customThemeId}
                customThemes={customThemes}
                sourceOpen={skinSource !== null}
                onSelect={selectSkinAndSource}
                onSelectCustom={selectCustomTheme}
                onRenameCustom={renameCustomTheme}
                onDuplicateCustom={duplicateCustomTheme}
                onDeleteCustom={deleteCustomTheme}
                onExportCustom={(id) => {
                  const artifact = exportCustomTheme(id);
                  if (artifact) downloadThemeArtifact(artifact);
                }}
                onViewSource={viewSkinSource}
              />
            </div>
          </section>

          <ThemeArchitecture skin={t.skin} />

          <section id="theme-tokens" aria-labelledby="theme-tokens-title" className="scroll-mt-6 border-border border-t pt-8">
            <EditorSectionHeading
              number="03"
              id="theme-tokens-title"
              title="Edit the token contract"
              description="Every category stays visible: core values first, then derived and fine-grained controls. Changes apply immediately to the component preview and the docs."
            />
            <div className="mt-5 grid gap-4 sm:pl-10 md:grid-cols-2 md:items-start">
              <ThemeVariableSummary t={t} overridden={overridden} />
              <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-foreground/5 px-3 py-2.5">
                <span className="flex min-w-0 flex-col">
                  <span className="text-[11px] font-medium text-foreground">CSS variable names</span>
                  <span className="text-[9px] text-muted-foreground">Show the theme.css token on each control</span>
                </span>
                <Switch
                  aria-label="Caption every control with its CSS variable name"
                  checked={t.labelMode === "css"}
                  onCheckedChange={(checked) => patch({ labelMode: checked ? "css" : "friendly" })}
                />
              </div>
            </div>

            <div className="mt-3">
              {TOKEN_CATEGORIES.map((category) => {
                let preview: ReactNode = null;
                if (category.group === "shadow") preview = <ElevationPreview />;
                else if (category.group === "surface") preview = <LayerPreview values={values} />;

                return (
                  <CategorySection
                    key={category.group}
                    category={category}
                    editor={editor}
                    preview={preview}
                    beforeTokens={category.group === "motion" ? reduceMotionRow : null}
                    afterCore={
                      category.group === "color" ? (
                        <div className="grid gap-3">
                          <ContrastPanel t={t} onFix={(textFixes) => patch({ textFixes })} />
                          <Link
                            href="/theme-accessibility"
                            onClick={() => setOpen(false)}
                            data-control-ui="button"
                            data-slot="root"
                            data-variant="surface"
                            className={buttonRecipeClasses("sm")}
                          >
                            <span className={buttonContentClasses}>
                              <ShieldCheckIcon aria-hidden className="size-3.5" />
                              Open full accessibility audit
                            </span>
                          </Link>
                        </div>
                      ) : null
                    }
                  />
                );
              })}
            </div>
          </section>
        </div>
      </ScrollArea>

      <div className="mt-auto flex flex-col gap-2.5 border-t border-border p-3.5 sm:flex-row sm:items-center sm:justify-end">
        {storageError ? <p className="flex-1 text-[10px] leading-relaxed text-destructive-text">{storageError}</p> : null}
        <Link
          href="/theme-ai-builder"
          onClick={() => setOpen(false)}
          data-control-ui="button"
          data-slot="root"
          data-variant="surface"
          className={cn(buttonRecipeClasses("sm"), "w-full sm:w-auto")}
        >
          <span className={buttonContentClasses}>
            <SparklesIcon aria-hidden className="size-3.5" />
            Build with AI
          </span>
        </Link>
        <Button variant="solid" tone="primary" size="sm" onClick={copyCss} className="w-full sm:w-auto">
          {copied ? "Copied ✓" : "Copy CSS variables"}
        </Button>
      </div>
    </div>
  );
}
