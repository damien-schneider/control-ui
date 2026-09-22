"use client";

import { PaperclipIcon } from "lucide-react";
import { useRef, useState } from "react";

import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatComposerAttachment, ChatComposerAttachments } from "@/components/control-ui/chat-composer-attachment";
import { Button } from "@/components/control-ui/ui/button";
import type { ContrastAdjustment } from "@/mastra/theme-generator-contract";
import { addGeneration, setRunning, updateGeneration, useGenerationState } from "./generation-store";
import { type ImagePalette, readImagePalette } from "./image-palette";
import { type Generation, paintedTokensOf, ThemeGeneration } from "./theme-generation";
import { useThemeRuntime } from "./theme-runtime-context";
import type { SkinId } from "./types";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

// A phone photo base64s past Vercel's 4.5 MB request cap and would 413 at the edge, before any handler
// could explain itself. It also carries no more theme signal than a 1024px reading of it, and the model
// bills the same ≤384 tokens either way.
const MAX_EDGE = 1024;

// Roughly a frame at 30fps: fast enough to read as live typing, slow enough that the trace costs a
// handful of renders instead of one per word.
const REASONING_FLUSH_MS = 32;

type ThemeImage = { mediaType: "image/jpeg"; data: string; name: string; url: string; palette: ImagePalette | null };

function isAcceptedImage(type: string) {
  return ACCEPTED_IMAGE_TYPES.some((accepted) => accepted === type);
}

async function readThemeImage(file: File): Promise<ThemeImage | null> {
  if (!isAcceptedImage(file.type)) return null;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) return null;

  // JPEG has no alpha, and an unpainted canvas would read transparent-as-black under a light screenshot.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // The pixels are right here, so the palette is measured rather than guessed by a model that sees the
  // screenshot at roughly 150 tokens.
  const palette = readImagePalette(context.getImageData(0, 0, canvas.width, canvas.height).data);

  // The data URL doubles as the preview source, so there is no object URL to revoke later.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.slice(dataUrl.indexOf(",") + 1), name: file.name, url: dataUrl, palette };
}

type StreamLine =
  | { type: "reasoning"; text: string }
  | { type: "tokens"; tokens: Record<string, string> }
  | { type: "complete"; name: string; skin: SkinId; tokens: Record<string, string>; adjustments: ContrastAdjustment[] }
  | { type: "error"; error: string };

async function* readLines(response: Response): AsyncGenerator<StreamLine> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffered = "";
  while (true) {
    const { done, value } = await reader.read();
    buffered += decoder.decode(value, { stream: !done });

    const lines = buffered.split("\n");
    buffered = done ? "" : (lines.pop() ?? "");
    for (const line of lines) if (line.trim()) yield JSON.parse(line);
    if (done) return;
  }
}

async function openGenerationStream(body: unknown, signal: AbortSignal) {
  const response = await fetch("/api/theme", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (response.ok) return response;

  const refusal = await response.json().catch(() => null);
  throw new Error(refusal?.error ?? "Generation failed.");
}

function applyChunk(generation: Generation, chunk: Exclude<StreamLine, { type: "error" | "reasoning" }>): Generation {
  const paintedTokens = paintedTokensOf(chunk.tokens);
  if (chunk.type !== "complete") return { ...generation, paintedTokens };
  return { ...generation, paintedTokens, skin: chunk.skin, state: "success", paletteName: chunk.name, adjustments: chunk.adjustments };
}

// A thinking model streams its trace one word at a time — 1800 deltas for a screenshot — and rendering
// each delta would spend the generation inside React instead of on screen.
function pacedReasoning(write: (text: string) => void) {
  let pending = "";
  let lastWrite = 0;

  const flush = () => {
    if (!pending) return;
    const text = pending;
    pending = "";
    lastWrite = performance.now();
    write(text);
  };

  return {
    flush,
    push(text: string) {
      pending += text;
      if (performance.now() - lastWrite >= REASONING_FLUSH_MS) flush();
    },
  };
}

function startedGeneration(id: string, prompt: string, attachment: ThemeImage | null): Generation {
  return {
    id,
    prompt,
    imageName: attachment?.name ?? null,
    skin: null,
    reasoning: "",
    state: "running",
    paintedTokens: [],
    paletteName: null,
    adjustments: [],
    error: null,
  };
}

export function ThemeGenerator() {
  const { applyGeneratedTheme, selectSkin, snapshotTheme, restoreTheme, isDark } = useThemeRuntime();
  const { generations, isRunning } = useGenerationState();
  const [image, setImage] = useState<ThemeImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function paintChunk(id: string, chunk: Exclude<StreamLine, { type: "error" | "reasoning" }>) {
    // Depth the token layer has no vocabulary for — gradients, backdrop blur, rims — lives in the skin.
    // Selecting one clears every token override, so the finished tokens are written after it, never before.
    if (chunk.type === "complete") selectSkin(chunk.skin);
    applyGeneratedTheme(chunk.tokens);
    updateGeneration(id, (generation) => applyChunk(generation, chunk));
  }

  async function runGeneration(id: string, prompt: string, attachment: ThemeImage | null, signal: AbortSignal) {
    const response = await openGenerationStream(
      {
        prompt,
        appearance: isDark ? "dark" : "light",
        image: attachment ? { mediaType: attachment.mediaType, data: attachment.data, palette: attachment.palette } : undefined,
      },
      signal,
    );

    const reasoning = pacedReasoning((text) =>
      updateGeneration(id, (generation) => ({ ...generation, reasoning: generation.reasoning + text })),
    );

    let completed = false;
    for await (const chunk of readLines(response)) {
      if (chunk.type === "error") throw new Error(chunk.error);
      if (chunk.type === "reasoning") {
        reasoning.push(chunk.text);
        continue;
      }

      reasoning.flush();
      paintChunk(id, chunk);
      completed = chunk.type === "complete";
    }

    reasoning.flush();
    return completed;
  }

  async function generate(prompt: string, attachment: ThemeImage | null) {
    const id = crypto.randomUUID();
    addGeneration(startedGeneration(id, prompt, attachment));

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);

    const previousTheme = snapshotTheme();
    let keepPaint = false;

    try {
      // A stream that closes after only partial objects returns cleanly, so completion is read from the
      // chunks rather than from the call returning.
      keepPaint = await runGeneration(id, prompt, attachment, controller.signal);
    } catch (error) {
      const stopped = error instanceof DOMException && error.name === "AbortError";
      const message = error instanceof Error ? error.message : "Generation failed.";
      // Stopping is a choice, not a failure: whatever has landed is what the user chose to keep.
      keepPaint = stopped;
      updateGeneration(id, (generation) => ({
        ...generation,
        state: stopped ? "stopped" : "error",
        error: stopped ? null : message,
      }));
    }

    setRunning(false);
    abortRef.current = null;

    // A stream can close after only partial objects, which leaves no completion line to settle on.
    updateGeneration(id, (generation) =>
      generation.state === "running"
        ? { ...generation, state: "error", error: "The generator did not return a complete palette." }
        : generation,
    );

    // Every run clears the active mode before repainting it, so a failed one leaves a theme that is
    // neither the old one nor a new one. Put back what the user had.
    if (!keepPaint) restoreTheme(previousTheme);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        {generations.map((generation) => (
          <ThemeGeneration key={generation.id} generation={generation} />
        ))}
      </div>

      <ChatComposer
        state={isRunning ? "submitting" : "idle"}
        allowEmptySubmit={image !== null}
        onSubmit={async ({ value, clear }) => {
          clear();
          setImage(null);
          await generate(value, image);
        }}
      >
        <ChatComposerShell>
          {image ? (
            <ChatComposerAttachments>
              <ChatComposerAttachment name={image.name} type={image.mediaType} previewUrl={image.url} onRemove={() => setImage(null)} />
            </ChatComposerAttachments>
          ) : null}
          {imageError ? <p className="px-3 pt-2 text-destructive-text text-label">{imageError}</p> : null}
          <ChatComposerTextarea placeholder="Describe a mood, or attach a screenshot to match…" />
          <ChatComposerToolbar>
            <ChatComposerTools>
              <Button type="button" size="xs" variant="quiet" onClick={() => fileRef.current?.click()}>
                <PaperclipIcon />
                Image
              </Button>
            </ChatComposerTools>
            {isRunning ? (
              <Button type="button" size="xs" variant="quiet" onClick={() => abortRef.current?.abort()}>
                Stop
              </Button>
            ) : (
              <ChatComposerSubmit>Generate</ChatComposerSubmit>
            )}
          </ChatComposerToolbar>
        </ChatComposerShell>
      </ChatComposer>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        hidden
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;

          // A truncated or mislabelled file rejects in createImageBitmap, and a HEIC pick from a photo
          // library never matches the accept list: both would otherwise leave the picker looking ignored.
          try {
            const read = await readThemeImage(file);
            setImage(read);
            setImageError(read ? null : `${file.name} is not a PNG, JPEG, GIF or WebP.`);
          } catch {
            setImage(null);
            setImageError(`${file.name} could not be read as an image.`);
          }
        }}
      />
    </div>
  );
}
