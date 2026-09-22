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
import { type Generation, paintedTokensOf, ThemeGeneration } from "./theme-generation";
import { useThemeRuntime } from "./theme-runtime-context";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

// A phone photo base64s past Vercel's 4.5 MB request cap and would 413 at the edge, before any handler
// could explain itself. It also carries no more theme signal than a 1024px reading of it, and the model
// bills the same ≤384 tokens either way.
const MAX_EDGE = 1024;

type ThemeImage = { mediaType: "image/jpeg"; data: string; name: string; url: string };

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

  // The data URL doubles as the preview source, so there is no object URL to revoke later.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.slice(dataUrl.indexOf(",") + 1), name: file.name, url: dataUrl };
}

type StreamLine =
  | { type: "reasoning"; text: string }
  | { type: "tokens"; tokens: Record<string, string> }
  | { type: "complete"; name: string; tokens: Record<string, string>; adjustments: ContrastAdjustment[] }
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

function applyChunk(generation: Generation, chunk: Exclude<StreamLine, { type: "error" }>): Generation {
  if (chunk.type === "reasoning") return { ...generation, reasoning: generation.reasoning + chunk.text };

  const paintedTokens = paintedTokensOf(chunk.tokens);
  if (chunk.type !== "complete") return { ...generation, paintedTokens };
  return { ...generation, paintedTokens, state: "success", paletteName: chunk.name, adjustments: chunk.adjustments };
}

function startedGeneration(id: string, prompt: string, attachment: ThemeImage | null): Generation {
  return {
    id,
    prompt,
    imageName: attachment?.name ?? null,
    reasoning: "",
    state: "running",
    paintedTokens: [],
    paletteName: null,
    adjustments: [],
    error: null,
  };
}

export function ThemeGenerator() {
  const { applyGeneratedTheme, isDark } = useThemeRuntime();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [image, setImage] = useState<ThemeImage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function updateGeneration(id: string, update: (generation: Generation) => Generation) {
    setGenerations((current) => current.map((generation) => (generation.id === id ? update(generation) : generation)));
  }

  async function runGeneration(id: string, prompt: string, attachment: ThemeImage | null, signal: AbortSignal) {
    const response = await openGenerationStream(
      {
        prompt,
        appearance: isDark ? "dark" : "light",
        image: attachment ? { mediaType: attachment.mediaType, data: attachment.data } : undefined,
      },
      signal,
    );

    for await (const chunk of readLines(response)) {
      if (chunk.type === "error") throw new Error(chunk.error);

      if (chunk.type !== "reasoning") applyGeneratedTheme(chunk.tokens);
      updateGeneration(id, (generation) => applyChunk(generation, chunk));
    }
  }

  async function generate(prompt: string, attachment: ThemeImage | null) {
    const id = crypto.randomUUID();
    setGenerations((current) => [...current, startedGeneration(id, prompt, attachment)]);

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);

    try {
      await runGeneration(id, prompt, attachment, controller.signal);
    } catch (error) {
      const stopped = error instanceof DOMException && error.name === "AbortError";
      const message = error instanceof Error ? error.message : "Generation failed.";
      updateGeneration(id, (generation) => ({
        ...generation,
        state: stopped ? "stopped" : "error",
        error: stopped ? null : message,
      }));
    }

    setIsRunning(false);
    abortRef.current = null;

    // A stream can close after only partial objects, which leaves no completion line to settle on.
    updateGeneration(id, (generation) =>
      generation.state === "running"
        ? { ...generation, state: "error", error: "The generator did not return a complete palette." }
        : generation,
    );
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
          if (file) setImage(await readThemeImage(file));
        }}
      />
    </div>
  );
}
