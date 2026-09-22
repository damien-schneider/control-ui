import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import type { MastraLanguageModel } from "@mastra/core/agent";
import { Agent } from "@mastra/core/agent";
import { simulateReadableStream } from "ai";

import { generatedThemeSchema } from "@/mastra/theme-generator-contract";
import { PER_VISITOR_GENERATIONS, resetGenerationLimits } from "./generation-limit";

const palette = {
  name: "Ember Terminal",
  skin: "modern-apple",
  radius: 0,
  cornerShape: "round",
  typography: { fontFamily: "Space Grotesk", baseSize: 0.8125, scale: 1.2, headingWeight: 700, headingTracking: -0.03 },
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

const imageReading = {
  cornerShape: "rounded",
  radiusRem: 0.75,
  density: "airy",
  typeCharacter: "geometric-sans",
  headingWeight: 600,
  depth: "soft-shadow",
  note: "wide gutters, hairline rules, cards floating on an open grid",
};

let readImage = async () => imageReading;

mock.module("@/mastra/theme-image-brief", () => ({
  readImageBrief: () => readImage(),
  describeImageReading: () => "corners rounded (~0.75rem) · airy spacing · geometric sans at 600 · soft shadows",
}));

// Both run against the live provider otherwise. The repair decision and the knob validation are pure, and
// are covered where they live.
mock.module("@/mastra/theme-repair-agent", () => ({ repairContrast: async (theme: unknown) => theme }));
mock.module("@/mastra/theme-knob-agent", () => ({ refineKnobs: async () => [] }));

// Static import would bind the real agent before mock.module replaces it.
const { POST } = await import("./route");

type StreamLine = {
  type: string;
  tokens?: Record<string, string>;
  name?: string;
  error?: string;
  text?: string;
  skin?: string;
  font?: { family: string; url: string | null };
  theme?: { name: string };
  brief?: string;
};

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

// The model may name any family, so the route resolves it against the Google catalogue and hands the client
// a URL to load it from. Without that URL the stack names a font the page never fetches.
test("a family outside the curated list still arrives with the stylesheet that loads it", async () => {
  const lines = await readLines(await generate({ prompt: "amber terminal", appearance: "dark" }));
  const complete = lines.find((line) => line.type === "complete");

  expect(complete?.font?.family).toBe("Space Grotesk");
  expect(complete?.font?.url).toContain("family=Space+Grotesk");
  expect(complete?.tokens?.["--font-sans"]).toContain('"Space Grotesk"');
});

// Selecting a skin clears every token override and can relayout the page under the drawer, so it travels
// with the finished theme rather than ahead of the stream.
test("delivers the skin only with the finished theme", async () => {
  const lines = await readLines(await generate({ prompt: "glassy dashboard", appearance: "light" }));
  const complete = lines.find((line) => line.type === "complete");

  expect(complete?.skin).toBe("modern-apple");
  expect(lines.filter((line) => line.skin !== undefined)).toHaveLength(1);
});

test("a partial paint never leaves a new surface under the previous theme's text", async () => {
  const lines = await readLines(await generate({ prompt: "warm brutalist terminal", appearance: "dark" }));

  for (const line of lines) {
    if (line.tokens?.["--card"]) expect(line.tokens["--popover"]).toBe(line.tokens["--card"]);
    if (line.tokens?.["--destructive"]) expect(line.tokens["--destructive-foreground"]).toBeDefined();
  }
});

test("refuses a generation past the daily allowance from the same browser", async () => {
  let cookie: string | undefined;
  for (let attempt = 0; attempt < PER_VISITOR_GENERATIONS; attempt++) {
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

// The theme model never sees the image, so the reading has to reach it as values it can act on — and the
// user, who otherwise could not tell why a screenshot produced the theme it did.
test("writes the theme from the image reading and shows that reading", async () => {
  const lines = await readLines(
    await generate({ prompt: "", appearance: "light", image: { mediaType: "image/png", data: "iVBORw0KGgo=" } }),
  );

  expect(lines.find((line) => line.type === "reasoning")?.text).toContain("geometric sans at 600");

  const sent = JSON.stringify(lastPrompt);
  expect(sent).toContain("0.75rem");
  expect(sent).toContain("geometric-sans");
  expect(sent).toContain("weight 600");
  expect(sent).toContain("wide gutters");
});

test("an unreadable image still generates from the measured palette", async () => {
  readImage = async () => {
    throw new Error("The image could not be read.");
  };
  const measuredPalette = {
    surface: { L: 0.97, C: 0.008, H: 80 },
    text: { L: 0.26, C: 0.02, H: 250 },
    accent: { L: 0.55, C: 0.14, H: 38 },
  };

  const lines = await readLines(
    await generate({ prompt: "", appearance: "light", image: { mediaType: "image/png", data: "iVBORw0KGgo=", palette: measuredPalette } }),
  );
  readImage = async () => imageReading;

  expect(lines.some((line) => line.type === "error")).toBe(false);
  expect(lines.at(-1)?.type).toBe("complete");
  expect(JSON.stringify(lastPrompt)).toContain("oklch(0.55 0.14 38)");
});

// The vision model reads a screenshot at roughly 150 tokens and invents colours when asked to sample
// them, so the client measures the palette off the canvas and the model is told to trust it.
test("passes the measured palette through as exact colours", async () => {
  await readLines(
    await generate({
      prompt: "",
      appearance: "light",
      image: {
        mediaType: "image/png",
        data: "iVBORw0KGgo=",
        palette: {
          surface: { L: 0.97, C: 0.008, H: 80 },
          text: { L: 0.26, C: 0.02, H: 250 },
          accent: { L: 0.55, C: 0.14, H: 38 },
        },
      },
    }),
  );

  const prompt = JSON.stringify(lastPrompt);
  expect(prompt).toContain("oklch(0.97 0.008 80)");
  expect(prompt).toContain("oklch(0.55 0.14 38)");
  expect(prompt).toContain("exact");
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

// "With a playful font" after a first theme is a change to that theme, not a new mood to roll from scratch.
test("a follow-up refines the theme on screen instead of starting over", async () => {
  await readLines(
    await generate({ prompt: "a playful font please", appearance: "light", previous: { theme: palette, briefs: ["sage studio"] } }),
  );

  const sent = JSON.stringify(lastPrompt);
  expect(sent).toContain("Ember Terminal");
  expect(sent).toContain("sage studio");
  expect(sent).toContain("a playful font please");
  expect(sent).not.toContain("Variation key");
});

// The image is sent once, so what the next turn knows of it is the reading carried in the brief.
test("hands back the theme and a brief that keeps the image reading for the next turn", async () => {
  const lines = await readLines(
    await generate({ prompt: "calmer", appearance: "light", image: { mediaType: "image/png", data: "iVBORw0KGgo=" } }),
  );
  const complete = lines.find((line) => line.type === "complete");

  expect(complete?.theme?.name).toBe("Ember Terminal");
  expect(complete?.brief).toContain("calmer");
  expect(complete?.brief).toContain("geometric sans at 600");
});
