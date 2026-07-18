"use client";

import {
  AlertTriangleIcon,
  BotIcon,
  BracesIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  FileImageIcon,
  PaintbrushIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BlockPreview } from "@/app/(features)/components/previews";
import { ChatInputAttachment, ChatInputAttachments } from "@/components/control-ui/chat-input-attachment";
import { useCopyToClipboard } from "@/components/control-ui/hooks/use-copy-to-clipboard";
import { cn } from "@/components/control-ui/lib/cn";
import { Badge } from "@/components/control-ui/ui/badge";
import { Button } from "@/components/control-ui/ui/button";
import { Textarea } from "@/components/control-ui/ui/textarea";
import { downloadThemeArtifact } from "@/components/theme-drawer/custom-themes";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import {
  buildThemePrompt,
  parseThemeArtifact,
  type ThemeArtifactResult,
  type ThemePromptMode,
} from "@/components/theme-drawer/theme-artifact";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import type { ControlUiThemeArtifactV1, SkinId } from "@/components/theme-drawer/types";
import { useThemeDrawer } from "@/components/theme-drawer-context";
import { useThemeModePreference } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/site-config";

const MAX_REFERENCE_COUNT = 5;
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024;
const REFERENCE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

type LocalReference = {
  id: string;
  file: File;
  previewUrl: string;
};

function referenceId(file: File) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
}

function fileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function WorkbenchStage({ number, id, title, children }: { number: string; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
        <span className="grid size-7 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {number}
        </span>
        <h2 className="text-heading-4 font-display">{title}</h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ReferencePicker({
  references,
  onAdd,
  onRemove,
}: {
  references: LocalReference[];
  onAdd: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
}) {
  const remaining = MAX_REFERENCE_COUNT - references.length;

  function addFromInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) onAdd(event.target.files);
    event.target.value = "";
  }

  function addFromDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    onAdd(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={addFromDrop}
        className={cn(
          "group grid min-h-32 cursor-pointer place-items-center rounded-[var(--radius-control)] border border-dashed border-border bg-foreground/[0.025] px-5 py-6 text-center transition hover:border-foreground/35 hover:bg-foreground/[0.045] focus-within:ring-2 focus-within:ring-foreground/20",
          remaining === 0 && "pointer-events-none opacity-50",
        )}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          disabled={remaining === 0}
          onChange={addFromInput}
          className="sr-only"
        />
        <span className="flex flex-col items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground group-hover:text-foreground">
            <FileImageIcon aria-hidden className="size-4" />
          </span>
          <span className="text-label font-medium text-foreground">Drop references or choose files</span>
          <span className="text-caption text-muted-foreground">PNG, JPEG, WebP or AVIF · 10 MB each · {remaining} remaining</span>
        </span>
      </label>

      {references.length > 0 ? (
        <ChatInputAttachments
          label="Local theme references"
          className="rounded-[var(--radius-control)] border border-border/70 bg-background/55"
        >
          {references.map((reference) => (
            <ChatInputAttachment
              key={reference.id}
              name={reference.file.name}
              type={reference.file.type}
              description={fileSize(reference.file.size)}
              previewUrl={reference.previewUrl}
              onRemove={() => onRemove(reference.id)}
              removeLabel={`Remove ${reference.file.name}`}
            />
          ))}
        </ChatInputAttachments>
      ) : null}
    </div>
  );
}

function ThemeBriefStage({
  description,
  baseSkin,
  references,
  referenceError,
  onDescriptionChange,
  onAddReferences,
  onRemoveReference,
}: {
  description: string;
  baseSkin: SkinId;
  references: LocalReference[];
  referenceError: string | null;
  onDescriptionChange: (value: string) => void;
  onAddReferences: (files: FileList | File[]) => void;
  onRemoveReference: (id: string) => void;
}) {
  return (
    <WorkbenchStage number="1" id="brief" title="Describe and reference">
      <div className="grid gap-5">
        <label htmlFor="theme-ai-description" className="grid gap-2">
          <span className="text-label font-medium text-foreground">
            Theme description <span className="text-destructive-text">*</span>
          </span>
          <Textarea
            id="theme-ai-description"
            required
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="A calm editorial workspace with warm paper surfaces, precise ink typography, compact controls, and a restrained moss accent…"
            className="min-h-28"
          />
          <span className="text-caption text-muted-foreground">
            Describe color, density, typography, corners, elevation, and motion. The active {SKIN_META_BY_ID[baseSkin].label} skin remains
            the structural base.
          </span>
        </label>
        <ReferencePicker references={references} onAdd={onAddReferences} onRemove={onRemoveReference} />
        {referenceError ? (
          <p role="alert" className="text-caption text-destructive-text">
            {referenceError}
          </p>
        ) : null}
      </div>
    </WorkbenchStage>
  );
}

function ThemePromptStage({
  mode,
  prompt,
  descriptionReady,
  copied,
  onModeChange,
  onCopy,
}: {
  mode: ThemePromptMode;
  prompt: string;
  descriptionReady: boolean;
  copied: boolean;
  onModeChange: (mode: ThemePromptMode) => void;
  onCopy: () => void;
}) {
  return (
    <WorkbenchStage number="2" id="prompt" title="Copy the AI prompt">
      <div className="grid gap-4">
        <fieldset className="grid grid-cols-2 gap-2 border-0 p-0">
          <legend className="sr-only">AI workflow</legend>
          <Button variant="surface" active={mode === "chat"} onClick={() => onModeChange("chat")}>
            <BotIcon aria-hidden className="size-3.5" /> Chat AI
          </Button>
          <Button variant="surface" active={mode === "coding-agent"} onClick={() => onModeChange("coding-agent")}>
            <BracesIcon aria-hidden className="size-3.5" /> Coding agent
          </Button>
        </fieldset>
        <p className="text-body leading-6 text-muted-foreground">
          {mode === "chat"
            ? "The response will be one JSON block you can paste below. Attach your reference files to the same chat in the listed order."
            : "The agent is asked to read the live contract endpoint and write a portable .control-ui-theme.json file without changing application code."}
        </p>
        <pre className="max-h-64 min-w-0 overflow-auto whitespace-pre-wrap rounded-[var(--radius-control)] bg-foreground/[0.045] p-4 font-mono text-[11px] leading-5 text-foreground">
          {prompt}
        </pre>
        <Button variant="solid" tone="primary" disabled={!descriptionReady} onClick={onCopy}>
          <CopyIcon aria-hidden className="size-3.5" /> {copied ? "Prompt copied" : "Copy prompt"}
        </Button>
      </div>
    </WorkbenchStage>
  );
}

function ThemeImportStage({
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
    <WorkbenchStage number="3" id="import" title="Import and validate">
      <div className="grid gap-4">
        <label htmlFor="theme-ai-artifact" className="grid gap-2">
          <span className="text-label font-medium text-foreground">AI response or theme JSON</span>
          <Textarea
            id="theme-ai-artifact"
            value={artifactText}
            onChange={(event) => onArtifactTextChange(event.target.value)}
            placeholder='Paste the complete reply, a fenced JSON block, or raw { "format": "control-ui-theme/v1", … }'
            className="min-h-44 font-mono text-[11px]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="surface">
            <label>
              <UploadIcon aria-hidden className="size-3.5" /> Import .control-ui-theme.json
              <input type="file" accept=".json,application/json" onChange={onImportFile} className="sr-only" />
            </label>
          </Button>
          {artifact ? (
            <Button variant="quiet" onClick={() => downloadThemeArtifact(artifact)}>
              <DownloadIcon aria-hidden className="size-3.5" /> Download draft
            </Button>
          ) : null}
        </div>
        {importError ? (
          <p role="alert" className="text-caption text-destructive-text">
            {importError}
          </p>
        ) : null}
        {artifactText && !artifactResult.ok ? (
          <div role="alert" className="rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 text-label font-medium text-destructive-text">
              <AlertTriangleIcon aria-hidden className="size-3.5" /> Fix the theme output
            </div>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-caption leading-5 text-destructive-text">
              {artifactResult.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {artifact && !baseMismatch ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-primary/25 bg-primary/5 px-3 py-2.5 text-label text-primary-text">
            <CheckCircle2Icon aria-hidden className="size-4" /> {artifact.name} is valid for {SKIN_META_BY_ID[artifact.baseSkin].label}.
          </div>
        ) : null}
        {baseMismatch ? (
          <div className="grid gap-3 rounded-[var(--radius-control)] border border-border bg-muted/45 p-3">
            <p className="text-caption leading-5 text-foreground">
              This artifact requires {SKIN_META_BY_ID[baseMismatch].label}, but {SKIN_META_BY_ID[activeBaseSkin].label} is active. The draft
              stays unapplied until its base is selected.
            </p>
            <Button variant="surface" size="sm" onClick={onOpenThemeEditor}>
              <PaintbrushIcon aria-hidden className="size-3.5" /> Select {SKIN_META_BY_ID[baseMismatch].label} in Theme editor
            </Button>
          </div>
        ) : null}
      </div>
    </WorkbenchStage>
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
  customThemeCount,
  onModeChange,
  onApply,
  onUndo,
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
  customThemeCount: number;
  onModeChange: (mode: "light" | "dark") => void;
  onApply: () => void;
  onUndo: () => void;
}) {
  const draftReady = Boolean(artifact && !baseMismatch);
  return (
    <aside id="preview" className="min-w-0 scroll-mt-24 @min-[56rem]/theme-builder:sticky @min-[56rem]/theme-builder:top-6">
      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-card shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-label font-semibold text-foreground">Chat block preview</span>
            {draftReady ? (
              <Badge variant="secondary" size="sm">
                Draft
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-muted p-1">
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
        <footer className="grid gap-3 border-t border-border/70 p-4">
          {appliedName ? (
            <div className="flex items-center gap-2 text-caption text-primary-text" aria-live="polite">
              <CheckCircle2Icon aria-hidden className="size-3.5" /> Saved as {appliedName}. It is now available under Custom in the Theme
              editor.
            </div>
          ) : (
            <p className="text-caption leading-5 text-muted-foreground">
              Validation changes only this preview. Applying always creates a new local custom theme and keeps the previous active state
              available for one-step undo.
            </p>
          )}
          {storageError ? (
            <div className="grid gap-2 rounded-[var(--radius-control)] bg-destructive/5 p-3 text-caption text-destructive-text">
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
              Save as custom theme
            </Button>
            {canUndo ? (
              <Button variant="surface" onClick={onUndo}>
                <Undo2Icon aria-hidden className="size-3.5" /> Undo
              </Button>
            ) : null}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {customThemeCount} custom {customThemeCount === 1 ? "theme" : "themes"} saved on this device
          </span>
        </footer>
      </div>
    </aside>
  );
}

export function ThemeAiBuilder() {
  const { t, customThemes, storageError, canUndo, applyArtifact, undoLastApply } = useThemeRuntime();
  const { setOpen } = useThemeDrawer();
  const themeMode = useThemeModePreference();
  const [description, setDescription] = useState("");
  const [references, setReferences] = useState<LocalReference[]>([]);
  const referenceSnapshot = useRef<LocalReference[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [promptMode, setPromptMode] = useState<ThemePromptMode>("chat");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [artifactText, setArtifactText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [appliedName, setAppliedName] = useState<string | null>(null);

  useEffect(() => {
    referenceSnapshot.current = references;
  }, [references]);
  useEffect(
    () => () => {
      for (const reference of referenceSnapshot.current) URL.revokeObjectURL(reference.previewUrl);
    },
    [],
  );
  useEffect(() => {
    const root = document.documentElement;
    const updatePreviewMode = () => setPreviewMode(root.classList.contains("dark") ? "dark" : "light");
    updatePreviewMode();
    const observer = new MutationObserver(updatePreviewMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const origin = siteConfig.url.origin;
  const prompt = useMemo(
    () =>
      buildThemePrompt({
        mode: promptMode,
        description,
        referenceNames: references.map((reference) => reference.file.name),
        origin,
        theme: t,
      }),
    [description, origin, promptMode, references, t],
  );
  const promptCopy = useCopyToClipboard({ text: prompt });
  const artifactResult = useMemo(() => parseThemeArtifact(artifactText), [artifactText]);
  const artifact = artifactResult.ok ? artifactResult.artifact : null;
  const baseMismatch = artifact && artifact.baseSkin !== t.skin ? artifact.baseSkin : null;
  const previewTokens = artifact
    ? { ...artifact.tokens.shared, ...(previewMode === "dark" ? artifact.tokens.dark : artifact.tokens.light) }
    : {};

  function addReferences(files: FileList | File[]) {
    const candidates = Array.from(files);
    const errors: string[] = [];
    setReferences((current) => {
      const accepted: LocalReference[] = [];
      for (const file of candidates.slice(0, MAX_REFERENCE_COUNT - current.length)) {
        if (!REFERENCE_TYPES.has(file.type)) errors.push(`${file.name}: use PNG, JPEG, WebP, or AVIF.`);
        else if (file.size > MAX_REFERENCE_BYTES) errors.push(`${file.name}: images must be 10 MB or smaller.`);
        else accepted.push({ id: referenceId(file), file, previewUrl: URL.createObjectURL(file) });
      }
      if (candidates.length > MAX_REFERENCE_COUNT - current.length) errors.push(`Only ${MAX_REFERENCE_COUNT} references can be added.`);
      return [...current, ...accepted];
    });
    setReferenceError(errors.length > 0 ? errors.join(" ") : null);
  }

  function removeReference(id: string) {
    setReferences((current) => {
      const removed = current.find((reference) => reference.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((reference) => reference.id !== id);
    });
    setReferenceError(null);
  }

  async function importArtifactFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setArtifactText(await file.text());
      setImportError(null);
      setAppliedName(null);
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
      <div className="grid min-w-0 gap-6 @min-[56rem]/theme-builder:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)] @min-[56rem]/theme-builder:items-start">
        <div className="grid min-w-0 gap-5">
          <div className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-border/70 bg-foreground/[0.025] p-4">
            <BotIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-text" />
            <p className="text-body leading-6 text-muted-foreground">
              Control UI does not run an AI model here. Your images stay in this browser; attach them yourself when you paste the prompt
              into Claude, ChatGPT, Codex, or another coding agent.
            </p>
          </div>
          <ThemeBriefStage
            description={description}
            baseSkin={t.skin}
            references={references}
            referenceError={referenceError}
            onDescriptionChange={setDescription}
            onAddReferences={addReferences}
            onRemoveReference={removeReference}
          />
          <ThemePromptStage
            mode={promptMode}
            prompt={prompt}
            descriptionReady={Boolean(description.trim())}
            copied={promptCopy.isCopied}
            onModeChange={setPromptMode}
            onCopy={promptCopy.handleCopy}
          />
          <ThemeImportStage
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
        </div>
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
          customThemeCount={customThemes.length}
          onModeChange={themeMode.setValue}
          onApply={applyValidArtifact}
          onUndo={() => {
            undoLastApply();
            setAppliedName(null);
          }}
        />
      </div>
    </div>
  );
}
