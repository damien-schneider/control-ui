"use client";

import { useRef, useState } from "react";

import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityDetailLabel,
  ActivityIcon,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";
import {
  ChatComposer,
  ChatComposerShell,
  ChatComposerSubmit,
  ChatComposerTextarea,
  ChatComposerToolbar,
  ChatComposerTools,
} from "@/components/control-ui/chat-composer";
import { ChatTurn } from "@/components/control-ui/chat-layout";
import { ChatMessage, ChatMessageBody, ChatMessageContent, ChatMessageRow } from "@/components/control-ui/chat-message";
import { Button } from "@/components/control-ui/ui/button";
import { COLOR_ROLE_TOKENS, type ContrastAdjustment } from "@/mastra/theme-generator-contract";
import { useThemeRuntime } from "./theme-runtime-context";

type Generation = {
  id: string;
  prompt: string;
  state: "running" | "success" | "error" | "stopped";
  paintedTokens: string[];
  paletteName: string | null;
  adjustments: ContrastAdjustment[];
  error: string | null;
};

const TOKEN_ROLE_LABELS: Record<string, string> = Object.fromEntries(COLOR_ROLE_TOKENS.map(([role, token]) => [token, role]));

type StreamLine =
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

async function openGenerationStream(prompt: string, appearance: "light" | "dark", signal: AbortSignal) {
  const response = await fetch("/api/theme", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, appearance }),
    signal,
  });
  if (response.ok) return response;

  const refusal = await response.json().catch(() => null);
  throw new Error(refusal?.error ?? "Generation failed.");
}

function applyChunk(generation: Generation, chunk: Exclude<StreamLine, { type: "error" }>): Generation {
  const paintedTokens = Object.keys(chunk.tokens).filter((token) => token in TOKEN_ROLE_LABELS);
  if (chunk.type !== "complete") return { ...generation, paintedTokens };
  return { ...generation, paintedTokens, state: "success", paletteName: chunk.name, adjustments: chunk.adjustments };
}

export function ThemeGenerator() {
  const { applyGeneratedTheme, isDark } = useThemeRuntime();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function updateGeneration(id: string, update: (generation: Generation) => Generation) {
    setGenerations((current) => current.map((generation) => (generation.id === id ? update(generation) : generation)));
  }

  async function generate(prompt: string) {
    const id = crypto.randomUUID();
    setGenerations((current) => [
      ...current,
      { id, prompt, state: "running", paintedTokens: [], paletteName: null, adjustments: [], error: null },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);

    try {
      const response = await openGenerationStream(prompt, isDark ? "dark" : "light", controller.signal);

      for await (const chunk of readLines(response)) {
        if (chunk.type === "error") throw new Error(chunk.error);

        applyGeneratedTheme(chunk.tokens);
        updateGeneration(id, (generation) => applyChunk(generation, chunk));
      }
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
          <div key={generation.id} className="flex flex-col gap-2">
            <ChatTurn from="user">
              <ChatMessage from="user">
                <ChatMessageRow>
                  <ChatMessageBody>
                    <ChatMessageContent>{generation.prompt}</ChatMessageContent>
                  </ChatMessageBody>
                </ChatMessageRow>
              </ChatMessage>
            </ChatTurn>

            <Activity
              kind="tool"
              name={generation.paletteName ?? "Painting tokens"}
              state={generation.state === "stopped" ? "pending" : generation.state}
              statusLabel={generation.state === "stopped" ? "Stopped" : undefined}
            >
              <ActivityTrigger>
                <ActivityIcon />
                <ActivityTitle />
                <ActivityStatus />
              </ActivityTrigger>
              <ActivityContent>
                <ActivityDetail>
                  <ActivityDetailLabel>Applied</ActivityDetailLabel>
                  <ActivityDetailContent>
                    {generation.paintedTokens.length === 0
                      ? "Waiting for the first colour…"
                      : generation.paintedTokens.map((token) => TOKEN_ROLE_LABELS[token]).join(", ")}
                  </ActivityDetailContent>
                </ActivityDetail>
                {generation.adjustments.length > 0 ? (
                  <ActivityDetail>
                    <ActivityDetailLabel>Corrected for AA contrast</ActivityDetailLabel>
                    <ActivityDetailContent>
                      {generation.adjustments
                        .map(
                          (adjustment) =>
                            `${adjustment.role}: L ${adjustment.from.L.toFixed(2)} → ${adjustment.to.L.toFixed(2)}${adjustment.to.C === 0 && adjustment.from.C > 0 ? ", chroma dropped" : ""} (${adjustment.ratio.toFixed(1)}:1)`,
                        )
                        .join("\n")}
                    </ActivityDetailContent>
                  </ActivityDetail>
                ) : null}
                {generation.error ? (
                  <ActivityDetail>
                    <ActivityDetailLabel>Error</ActivityDetailLabel>
                    <ActivityDetailContent className="text-destructive-text">{generation.error}</ActivityDetailContent>
                  </ActivityDetail>
                ) : null}
              </ActivityContent>
            </Activity>
          </div>
        ))}
      </div>

      <ChatComposer
        state={isRunning ? "submitting" : "idle"}
        onSubmit={async ({ value, clear }) => {
          clear();
          await generate(value);
        }}
      >
        <ChatComposerShell>
          <ChatComposerTextarea placeholder="Describe a mood — warm brutalist terminal, calm clinical dashboard…" />
          <ChatComposerToolbar>
            <ChatComposerTools>Writes straight into the token editor</ChatComposerTools>
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
    </div>
  );
}
