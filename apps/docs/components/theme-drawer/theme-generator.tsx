"use client";

import { useRef } from "react";

import type { ContrastAdjustment, GeneratedFont } from "@/mastra/theme-generator-contract";
import { addGeneration, setRunning, updateGeneration, useGenerationState } from "./generation-store";
import { type Generation, paintedTokensOf, ThemeGeneration } from "./theme-generation";
import { type ThemeImage, ThemePromptComposer } from "./theme-prompt-composer";
import { useThemeRuntime } from "./theme-runtime-context";
import type { KnobRule, SkinId } from "./types";

// Roughly a frame at 30fps: fast enough to read as live typing, slow enough that the trace costs a
// handful of renders instead of one per word.
const REASONING_FLUSH_MS = 32;

type StreamLine =
  | { type: "reasoning"; text: string }
  | { type: "tokens"; tokens: Record<string, string> }
  | {
      type: "complete";
      name: string;
      skin: SkinId;
      tokens: Record<string, string>;
      adjustments: ContrastAdjustment[];
      font: GeneratedFont | null;
    }
  | { type: "knobs"; rules: KnobRule[] }
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

type PaintedLine = Extract<StreamLine, { type: "tokens" | "complete" }>;

function applyChunk(generation: Generation, chunk: PaintedLine): Generation {
  const paintedTokens = paintedTokensOf(chunk.tokens);
  if (chunk.type !== "complete") return { ...generation, paintedTokens };
  return {
    ...generation,
    paintedTokens,
    skin: chunk.skin,
    state: "success",
    paletteName: chunk.name,
    adjustments: chunk.adjustments,
    typeface: chunk.font?.family ?? null,
  };
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
    typeface: null,
    knobs: [],
    error: null,
  };
}

export function ThemeGenerator() {
  const { applyGeneratedTheme, applyGeneratedKnobs, selectSkin, snapshotTheme, restoreTheme, isDark } = useThemeRuntime();
  const { generations, isRunning } = useGenerationState();
  const abortRef = useRef<AbortController | null>(null);

  function paintChunk(id: string, chunk: Exclude<StreamLine, { type: "error" | "reasoning" }>) {
    // Knobs arrive behind the finished palette and touch nothing else, so they never repaint the theme.
    if (chunk.type === "knobs") {
      applyGeneratedKnobs(chunk.rules);
      updateGeneration(id, (generation) => ({
        ...generation,
        knobs: chunk.rules.flatMap((rule) => Object.keys(rule.tokens)),
      }));
      return;
    }

    // Depth the token layer has no vocabulary for — gradients, backdrop blur, rims — lives in the skin.
    // Selecting one clears every token override, so the finished tokens are written after it, never before.
    if (chunk.type === "complete") selectSkin(chunk.skin);
    applyGeneratedTheme(chunk.tokens, chunk.type === "complete" ? (chunk.font?.url ?? "") : "");
    updateGeneration(id, (generation) => applyChunk(generation, chunk));
  }

  async function runGeneration(id: string, prompt: string, attachment: ThemeImage | null, signal: AbortSignal, onComplete: () => void) {
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

    for await (const chunk of readLines(response)) {
      if (chunk.type === "error") throw new Error(chunk.error);
      if (chunk.type === "reasoning") {
        reasoning.push(chunk.text);
        continue;
      }

      reasoning.flush();
      paintChunk(id, chunk);
      if (chunk.type === "complete") onComplete();
    }

    reasoning.flush();
  }

  async function generate(prompt: string, attachment: ThemeImage | null) {
    const id = crypto.randomUUID();
    addGeneration(startedGeneration(id, prompt, attachment));

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);

    const previousTheme = snapshotTheme();
    // Knobs stream behind the finished palette, so a stop or a dropped connection after "complete" only
    // costs the detail pass, never the theme the user already sees.
    let completed = false;
    let stopped = false;

    try {
      await runGeneration(id, prompt, attachment, controller.signal, () => {
        completed = true;
      });
    } catch (error) {
      stopped = error instanceof DOMException && error.name === "AbortError";
      const message = error instanceof Error ? error.message : "Generation failed.";
      if (!completed) {
        updateGeneration(id, (generation) => ({
          ...generation,
          state: stopped ? "stopped" : "error",
          error: stopped ? null : message,
        }));
      }
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
    // Stopping is a choice, not a failure: whatever has landed is what the user chose to keep.
    if (!completed && !stopped) restoreTheme(previousTheme);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        {generations.map((generation) => (
          <ThemeGeneration key={generation.id} generation={generation} />
        ))}
      </div>

      <ThemePromptComposer isRunning={isRunning} onGenerate={generate} onStop={() => abortRef.current?.abort()} />
    </div>
  );
}
