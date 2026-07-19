"use client";

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  PaintbrushIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { BlockPreview } from "@/app/(features)/components/previews";
import { ThemeAuditStatus } from "@/app/(features)/theme-accessibility/theme-audit-status";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button, ButtonLabel } from "@/components/control-ui/ui/button";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/control-ui/ui/stepper";
import { Textarea } from "@/components/control-ui/ui/textarea";
import { downloadThemeArtifact } from "@/components/theme-drawer/custom-themes";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { buildThemePrompt, parseThemeArtifact, type ThemeArtifactResult } from "@/components/theme-drawer/theme-artifact";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import type { ControlUiThemeArtifactV1, SkinId } from "@/components/theme-drawer/types";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import { useThemeModePreference } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site-config";

function AgentPromptStep({
  baseSkin,
  copied,
  copyError,
  onCopy,
  onOpenThemeEditor,
}: {
  baseSkin: SkinId;
  copied: boolean;
  copyError: string | null;
  onCopy: () => void;
  onOpenThemeEditor: () => void;
}) {
  return (
    <div id="prompt" className="grid gap-6 scroll-mt-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-lg">
          <p className="text-label font-medium text-foreground">Claude Code · Codex · Mastra Code</p>
          <h2 className="mt-2 text-heading-3 font-display">Create with your coding agent</h2>
          <p className="mt-2 text-body leading-6 text-muted-foreground">
            Open one in your project and paste the prompt. It will ask for your direction and reference images, then write an importable
            theme file.
          </p>
        </div>
        <Button variant="quiet" size="sm" onClick={onOpenThemeEditor}>
          <PaintbrushIcon aria-hidden className="size-3.5" /> Base: {SKIN_META_BY_ID[baseSkin].label}
        </Button>
      </header>

      <div className="grid gap-2">
        <Button variant="solid" tone="primary" onClick={onCopy}>
          {copied ? <CheckCircle2Icon aria-hidden className="size-3.5" /> : <CopyIcon aria-hidden className="size-3.5" />}
          {copied ? "Agent prompt copied" : "Copy agent prompt"}
          {!copied ? <ArrowRightIcon aria-hidden className="size-3.5" /> : null}
        </Button>
        {copyError ? (
          <p role="alert" className="text-caption text-destructive-text">
            {copyError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ThemeTestStep({
  artifactText,
  artifactResult,
  artifact,
  activeBaseSkin,
  baseMismatch,
  importError,
  onArtifactTextChange,
  onImportFile,
  onOpenThemeEditor,
}: {
  artifactText: string;
  artifactResult: ThemeArtifactResult;
  artifact: ControlUiThemeArtifactV1 | null;
  activeBaseSkin: SkinId;
  baseMismatch: SkinId | null;
  importError: string | null;
  onArtifactTextChange: (value: string) => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenThemeEditor: () => void;
}) {
  return (
    <div id="test" className="grid gap-5 scroll-mt-24">
      <header>
        <h2 className="text-heading-3 font-display">Import and test</h2>
        <p className="mt-2 text-body leading-6 text-muted-foreground">
          When the agent finishes, import the generated <code>.control-ui-theme.json</code> file.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <ButtonLabel htmlFor="theme-ai-file" variant="solid" tone="primary">
          <UploadIcon aria-hidden className="size-3.5" /> Import theme file
          <input
            id="theme-ai-file"
            type="file"
            accept=".json,application/json"
            aria-label="Import theme file"
            onChange={onImportFile}
            className="sr-only"
          />
        </ButtonLabel>
        {artifact ? (
          <Button variant="quiet" onClick={() => downloadThemeArtifact(artifact)}>
            <DownloadIcon aria-hidden className="size-3.5" /> Download draft
          </Button>
        ) : null}
      </div>

      <details open={Boolean(artifactText && !artifactResult.ok) || undefined}>
        <summary className="cursor-pointer text-label font-medium text-foreground">Paste JSON instead</summary>
        <label htmlFor="theme-ai-artifact" className="mt-3 grid gap-2">
          <span className="sr-only">Theme JSON</span>
          <Textarea
            id="theme-ai-artifact"
            value={artifactText}
            onChange={(event) => onArtifactTextChange(event.target.value)}
            placeholder='Paste the fenced JSON block or raw { "format": "control-ui-theme/v1", … }'
            className="min-h-56 font-mono text-[11px]"
          />
        </label>
      </details>

      {importError ? (
        <p role="alert" className="text-caption text-destructive-text">
          {importError}
        </p>
      ) : null}
      {artifactText && !artifactResult.ok ? (
        <div role="alert" className="grid gap-1.5 text-caption text-destructive-text">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangleIcon aria-hidden className="size-3.5" /> Theme JSON needs changes
          </p>
          <ul className="grid list-disc gap-1 pl-5 leading-5">
            {artifactResult.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {artifact && !baseMismatch ? (
        <p className="flex items-center gap-2 text-label text-primary-text">
          <CheckCircle2Icon aria-hidden className="size-4" /> {artifact.name} is ready to test.
        </p>
      ) : null}
      {baseMismatch ? (
        <div className="grid justify-items-start gap-2">
          <p className="text-caption leading-5 text-foreground">
            This theme uses {SKIN_META_BY_ID[baseMismatch].label}, but {SKIN_META_BY_ID[activeBaseSkin].label} is active.
          </p>
          <Button variant="surface" size="sm" onClick={onOpenThemeEditor}>
            <PaintbrushIcon aria-hidden className="size-3.5" /> Switch to {SKIN_META_BY_ID[baseMismatch].label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ThemePreviewPanel({
  artifact,
  activeBaseSkin,
  baseMismatch,
  previewMode,
  previewTokens,
  lockedMode,
  appliedName,
  storageError,
  canUndo,
  onModeChange,
  onApply,
  onUndo,
  onOpenThemeEditor,
}: {
  artifact: ControlUiThemeArtifactV1 | null;
  activeBaseSkin: SkinId;
  baseMismatch: SkinId | null;
  previewMode: "light" | "dark";
  previewTokens: Record<string, string>;
  lockedMode: "light" | "dark" | null;
  appliedName: string | null;
  storageError: string | null;
  canUndo: boolean;
  onModeChange: (mode: "light" | "dark") => void;
  onApply: () => void;
  onUndo: () => void;
  onOpenThemeEditor: () => void;
}) {
  const [previewRoot, setPreviewRoot] = useState<HTMLElement | null>(null);
  const draftReady = Boolean(artifact && !baseMismatch);
  return (
    <aside id="preview" className="min-w-0 scroll-mt-24 @min-[56rem]/theme-builder:sticky @min-[56rem]/theme-builder:top-6">
      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-background">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-label font-semibold text-foreground">Live preview</span>
            <Badge variant="secondary" size="sm">
              {draftReady ? "Draft" : SKIN_META_BY_ID[activeBaseSkin].label}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="xs"
              variant="quiet"
              active={previewMode === "light"}
              disabled={lockedMode === "dark"}
              onClick={() => onModeChange("light")}
            >
              Light
            </Button>
            <Button
              size="xs"
              variant="quiet"
              active={previewMode === "dark"}
              disabled={lockedMode === "light"}
              onClick={() => onModeChange("dark")}
            >
              Dark
            </Button>
          </div>
        </header>
        <section
          ref={setPreviewRoot}
          aria-label="Inert Chat block theme preview"
          data-testid="theme-ai-preview"
          data-skin={draftReady && artifact ? artifact.baseSkin : activeBaseSkin}
          data-motion={artifact?.reduceMotion ? "reduced" : undefined}
          style={draftReady ? previewTokens : undefined}
          className="min-h-[36rem] overflow-hidden bg-background p-3 text-foreground sm:p-5"
        >
          <div inert className="pointer-events-none mx-auto max-w-3xl select-none">
            <BlockPreview blockId="chat" integration="mastra" />
          </div>
        </section>
        <ThemeAuditStatus root={previewRoot} className="border-t border-border/70 px-4 py-3" />
        <footer className="grid gap-3 border-t border-border/70 p-4">
          {appliedName ? (
            <p className="flex items-center gap-2 text-caption text-primary-text" aria-live="polite">
              <CheckCircle2Icon aria-hidden className="size-3.5" /> {appliedName} is active across the docs.
            </p>
          ) : null}
          {!appliedName && !draftReady ? (
            <p className="text-caption text-muted-foreground">Import a valid theme file to replace this base preview.</p>
          ) : null}
          {storageError ? (
            <div className="grid gap-2 text-caption text-destructive-text">
              <span>{storageError}</span>
              {artifact ? (
                <Button variant="surface" size="sm" onClick={() => downloadThemeArtifact(artifact)}>
                  <DownloadIcon aria-hidden className="size-3.5" /> Download artifact
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button className="flex-1" variant="solid" tone="primary" disabled={!draftReady} onClick={onApply}>
              Apply to docs
            </Button>
            {appliedName ? (
              <Button variant="surface" onClick={onOpenThemeEditor}>
                <PaintbrushIcon aria-hidden className="size-3.5" /> Edit tokens
              </Button>
            ) : null}
            {canUndo ? (
              <Button variant="surface" onClick={onUndo}>
                <Undo2Icon aria-hidden className="size-3.5" /> Undo
              </Button>
            ) : null}
          </div>
        </footer>
      </div>
    </aside>
  );
}

export function ThemeAiBuilder() {
  const { t, storageError, canUndo, applyArtifact, undoLastApply } = useThemeRuntime();
  const { setOpen } = useThemeDrawer();
  const themeMode = useThemeModePreference();
  const [activeStep, setActiveStep] = useState(0);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [artifactText, setArtifactText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [appliedName, setAppliedName] = useState<string | null>(null);

  useEffect(() => setOpen(false), [setOpen]);
  useEffect(() => {
    const root = document.documentElement;
    const updatePreviewMode = () => setPreviewMode(root.classList.contains("dark") ? "dark" : "light");
    updatePreviewMode();
    const observer = new MutationObserver(updatePreviewMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const origin = siteConfig.url.origin;
  const prompt = buildThemePrompt({ origin, theme: t });
  const promptCopy = useCopyToClipboard({
    text: prompt,
    onCopyError: () => setCopyError("The prompt could not be copied. Check clipboard permissions and try again."),
  });
  const artifactResult = parseThemeArtifact(artifactText);
  const artifact = artifactResult.ok ? artifactResult.artifact : null;
  const baseMismatch = artifact && artifact.baseSkin !== t.skin ? artifact.baseSkin : null;
  const previewTokens = artifact
    ? { ...artifact.tokens.shared, ...(previewMode === "dark" ? artifact.tokens.dark : artifact.tokens.light) }
    : {};

  async function copyPromptAndContinue() {
    setCopyError(null);
    if (await promptCopy.handleCopy()) setActiveStep(1);
  }

  async function importArtifactFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setArtifactText(await file.text());
      setImportError(null);
      setAppliedName(null);
      setActiveStep(1);
    } catch {
      setImportError("The selected file could not be read.");
    }
  }

  function applyValidArtifact() {
    if (!artifact || baseMismatch) return;
    const profile = applyArtifact(artifact);
    if (profile) setAppliedName(profile.name);
  }

  return (
    <div className="@container/theme-builder">
      <div
        className={cn(
          "grid min-w-0 gap-8",
          activeStep === 0
            ? "max-w-2xl"
            : "@min-[56rem]/theme-builder:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)] @min-[56rem]/theme-builder:items-start",
        )}
      >
        <Stepper value={activeStep} onValueChange={setActiveStep} contentMode="current" responsive={false} className="min-w-0">
          <StepperList aria-label="Create and test a theme" className="max-w-sm">
            <StepperItem step={0}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Copy agent prompt</StepperTitle>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
            <StepperItem step={1}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>Import and test</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          </StepperList>

          <StepperContent step={0} keepMounted={false}>
            <AgentPromptStep
              baseSkin={t.skin}
              copied={promptCopy.isCopied}
              copyError={copyError}
              onCopy={copyPromptAndContinue}
              onOpenThemeEditor={() => setOpen(true)}
            />
          </StepperContent>
          <StepperContent step={1} keepMounted={false}>
            <ThemeTestStep
              artifactText={artifactText}
              artifactResult={artifactResult}
              artifact={artifact}
              activeBaseSkin={t.skin}
              baseMismatch={baseMismatch}
              importError={importError}
              onArtifactTextChange={(value) => {
                setArtifactText(value);
                setAppliedName(null);
              }}
              onImportFile={importArtifactFile}
              onOpenThemeEditor={() => setOpen(true)}
            />
          </StepperContent>
        </Stepper>

        {activeStep === 1 ? (
          <ThemePreviewPanel
            artifact={artifact}
            activeBaseSkin={t.skin}
            baseMismatch={baseMismatch}
            previewMode={previewMode}
            previewTokens={previewTokens}
            lockedMode={themeMode.locked}
            appliedName={appliedName}
            storageError={storageError}
            canUndo={canUndo}
            onModeChange={themeMode.setValue}
            onApply={applyValidArtifact}
            onUndo={() => {
              undoLastApply();
              setAppliedName(null);
            }}
            onOpenThemeEditor={() => setOpen(true)}
          />
        ) : null}
      </div>
    </div>
  );
}
