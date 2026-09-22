import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import type { MastraLanguageModel } from "@mastra/core/agent";
import { Agent } from "@mastra/core/agent";
import { simulateReadableStream } from "ai";

import { generatedThemeSchema } from "@/mastra/theme-generator-contract";
import { resetGenerationLimits } from "./generation-limit";

const palette = {
  name: "Ember Terminal",
  radius: 0,
  cornerShape: "round",
  typography: { fontFamily: "mono", baseSize: 0.8125, scale: 1.2, headingWeight: 700, headingTracking: -0.03 },
  shadow: { size: 0, opacity: 0, y: 0 },
  motion: { baseDuration: 120, easing: "snappy" },
  layout: { controlHeight: 30, paddingX: 12, paddingY: 6, focusRingWidth: 3, controlRimWidth: 0 },
  surface: { overlayOpacity: 0.4, backdropBlur: 0, popoverOpacity: 0.9, scrollFadeSize: 0 },
  colors: {
    canvas: { L: 0.16, C: 0.012, H: 60 },
    background: { L: 0.2, C: 0.014, H: 60 },
    foreground: { L: 0.93, C: 0.01, H: 60 },
    card: { L: 0.24, C: 0.016, H: 60 },
    cardForeground: { L: 0.93, C: 0.01, H: 60 },
    primary: { L: 0.78, C: 0.17, H: 62 },
    primaryForeground: { L: 0.18, C: 0.02, H: 60 },
    muted: { L: 0.26, C: 0.012, H: 60 },
    mutedForeground: { L: 0.72, C: 0.02, H: 60 },
    secondary: { L: 0.28, C: 0.02, H: 60 },
    accent: { L: 0.32, C: 0.04, H: 62 },
    destructive: { L: 0.55, C: 0.2, H: 27 },
    border: { L: 0.34, C: 0.014, H: 60 },
    ring: { L: 0.78, C: 0.17, H: 62 },
  },
};

// Chunked mid-object so the route has to paint progressively rather than once at the end.
const jsonDeltas = JSON.stringify(palette).match(/.{1,40}/gs) ?? [];
const textPartId = "theme-json";

const streamCannedPalette = () => ({
  stream: simulateReadableStream({
    chunkDelayInMs: 1,
    chunks: [
      { type: "stream-start" as const, warnings: [] },
      { type: "reasoning-start" as const, id: "theme-thinking" },
      { type: "reasoning-delta" as const, id: "theme-thinking", delta: "Amber on near-black reads as a terminal." },
      { type: "reasoning-end" as const, id: "theme-thinking" },
      { type: "text-start" as const, id: textPartId },
      ...jsonDeltas.map((delta) => ({ type: "text-delta" as const, id: textPartId, delta })),
      { type: "text-end" as const, id: textPartId },
      {
        type: "finish" as const,
        finishReason: "stop" as const,
        usage: { inputTokens: 200, outputTokens: jsonDeltas.length, totalTokens: 200 + jsonDeltas.length },
      },
    ],
  }),
});

let lastPrompt: unknown;

const cannedModel: MastraLanguageModel = {
  specificationVersion: "v2",
  provider: "theme-generator-test",
  modelId: "canned",
  supportedUrls: {},
  doGenerate: async () => streamCannedPalette(),
  doStream: async (options) => {
    lastPrompt = options.prompt;
    return streamCannedPalette();
  },
};

mock.module("@/mastra/theme-generator-agent", () => ({
  themeGeneratorAgent: new Agent({
    id: "theme-generator",
    name: "Theme generator",
    instructions: "Return the canned palette.",
    model: cannedModel,
    defaultOptions: { structuredOutput: { schema: generatedThemeSchema } },
  }),
}));

mock.module("@/mastra/theme-image-brief", () => ({
  readImageBrief: async () => "A cream surface with near-black text and one terracotta accent, softly rounded and airy.",
}));

// Static import would bind the real agent before mock.module replaces it.
const { POST } = await import("./route");

type StreamLine = { type: string; tokens?: Record<string, string>; name?: string; error?: string; text?: string };

async function generate(prompt: unknown, cookie?: string) {
  return POST(
    new Request("http://127.0.0.1:3000/api/theme", {
      method: "POST",
      headers: cookie ? { "content-type": "application/json", cookie } : { "content-type": "application/json" },
      body: JSON.stringify(prompt),
    }),
  );
}

const tallyFrom = (response: Response) => response.headers.get("set-cookie")?.split(";")[0];

async function readLines(response: Response): Promise<StreamLine[]> {
  return (await response.text())
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

beforeEach(() => {
  resetGenerationLimits();
  process.env.DEEPSEEK_API_KEY = "test-key";
});

afterEach(() => {
  process.env.DEEPSEEK_API_KEY = undefined;
});

test("paints tokens progressively and finishes with the gated palette", async () => {
  const response = await generate({ prompt: "warm brutalist terminal", appearance: "dark" });
  expect(response.status).toBe(200);

  const lines = await readLines(response);
  const complete = lines.at(-1);

  expect(lines.filter((line) => line.type === "tokens").length).toBeGreaterThan(1);
  expect(complete?.type).toBe("complete");
  expect(complete?.name).toBe("Ember Terminal");
  expect(complete?.tokens?.["--primary"]).toBe("oklch(0.78 0.17 62)");
  expect(complete?.tokens?.["--radius"]).toBe("0rem");
  expect(complete?.tokens?.["--popover"]).toBe(complete?.tokens?.["--card"]);
});

test("a partial paint never leaves a new surface under the previous theme's text", async () => {
  const lines = await readLines(await generate({ prompt: "warm brutalist terminal", appearance: "dark" }));

  for (const line of lines) {
    if (line.tokens?.["--card"]) expect(line.tokens["--popover"]).toBe(line.tokens["--card"]);
    if (line.tokens?.["--destructive"]) expect(line.tokens["--destructive-foreground"]).toBeDefined();
  }
});

test("refuses a fourth generation from the same browser", async () => {
  let cookie: string | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    cookie = tallyFrom(await generate({ prompt: "calm", appearance: "light" }, cookie)) ?? cookie;
  }

  expect((await generate({ prompt: "calm", appearance: "light" }, cookie)).status).toBe(429);
});

test("hands back a tally the browser can carry to the next request", async () => {
  const response = await generate({ prompt: "calm", appearance: "light" });

  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
});

test("rejects a request that carries no prompt", async () => {
  expect((await generate({ appearance: "light" })).status).toBe(400);
});

test("does not spend a generation on a request it rejects", async () => {
  const rejected = await generate({ appearance: "light" });

  expect(rejected.headers.get("set-cookie")).toBeNull();
});

test("reports an unconfigured deployment instead of failing inside the stream", async () => {
  process.env.DEEPSEEK_API_KEY = undefined;

  const response = await generate({ prompt: "calm", appearance: "light" });
  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("not configured") });
});

test("streams the reasoning trace before the first token lands", async () => {
  const lines = await readLines(await generate({ prompt: "warm brutalist terminal", appearance: "dark" }));
  const reasoning = lines.findIndex((line) => line.type === "reasoning");

  expect(reasoning).toBeGreaterThanOrEqual(0);
  expect(lines[reasoning]?.text).toContain("terminal");
  expect(reasoning).toBeLessThan(lines.findIndex((line) => line.type === "tokens"));
});

// The theme model never sees the image, so the reading has to reach it — and the user, who otherwise
// could not tell why a screenshot produced the theme it did.
test("writes the theme from the image reading and shows that reading", async () => {
  const lines = await readLines(
    await generate({ prompt: "", appearance: "light", image: { mediaType: "image/png", data: "iVBORw0KGgo=" } }),
  );

  expect(lines.find((line) => line.type === "reasoning")?.text).toContain("terracotta");
  expect(JSON.stringify(lastPrompt)).toContain("terracotta");
});

test("varies the brief between two runs of the same prompt", async () => {
  await readLines(await generate({ prompt: "calm", appearance: "light" }));
  const first = JSON.stringify(lastPrompt);
  await readLines(await generate({ prompt: "calm", appearance: "light" }));

  expect(JSON.stringify(lastPrompt)).not.toBe(first);
});

test("rejects a request with neither a prompt nor an image", async () => {
  expect((await generate({ prompt: "  ", appearance: "light" })).status).toBe(400);
});
