import { z } from "zod";

import { themeGeneratorAgent } from "@/mastra/theme-generator-agent";
import { toStreamingTokenValues, toTokenValues } from "@/mastra/theme-generator-contract";
import { describeImageReading, readImageBrief, type ThemeImageReading } from "@/mastra/theme-image-brief";
import { refineKnobs } from "@/mastra/theme-knob-agent";
import { repairContrast } from "@/mastra/theme-repair-agent";
import { takeGeneration } from "./generation-limit";

export const maxDuration = 60;

// The image arrives inline as base64, so this bounds the request body itself. The client downscales to
// 1024px first, which lands well under it; the cap only has to stay below Vercel's 4.5 MB body limit,
// past which the platform rejects the request and no handler ever gets to explain why.
const MAX_IMAGE_CHARS = 2_000_000;

const paletteColor = z.object({ L: z.number().min(0).max(1), C: z.number().min(0).max(0.5), H: z.number().min(0).max(360) });

const requestSchema = z.object({
  prompt: z.string().trim().max(240),
  appearance: z.enum(["light", "dark"]),
  image: z
    .object({
      mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
      data: z.string().max(MAX_IMAGE_CHARS),
      // Measured in the client's canvas rather than read by the vision model, which sees a 1024px
      // screenshot at roughly 150 tokens and invents hex when asked to sample one.
      palette: z
        .object({
          surface: paletteColor,
          text: paletteColor,
          accent: paletteColor,
        })
        .nullable()
        .optional(),
    })
    .optional(),
});

type ThemeRequest = z.infer<typeof requestSchema>;

// The request carries a mood, a target appearance and at most one image — never messages, a model id or
// model settings. A generic agent endpoint would let a caller swap the pinned flash model for a pricier
// one, so the whole call is assembled here and the model is fixed in the agent.
//
// Thinking mode ignores temperature, so without the nonce the same mood would return the same theme every
// time. It is not a seed the model is asked to use, only something that differs between two calls.
function describePalette(palette: NonNullable<NonNullable<ThemeRequest["image"]>["palette"]>) {
  const say = ({ L, C, H }: { L: number; C: number; H: number }) => `oklch(${L} ${C} ${H})`;
  return `Colours measured from the image's pixels — surface ${say(palette.surface)}, text ${say(palette.text)}, accent ${say(palette.accent)}. These are exact; trust their hue and chroma over any impression of the colours, and when the target appearance is the opposite of the image's, flip their lightness rather than their hue.`;
}

// The vision call answers in the theme's own vocabulary, so the reading arrives as values the model can
// act on rather than adjectives it has to translate a second time.
function describeReading(reading: ThemeImageReading) {
  return [
    `Measured from the image — corners ${reading.cornerShape} at roughly ${reading.radiusRem}rem,`,
    `${reading.density} spacing, ${reading.typeCharacter} headings at weight ${reading.headingWeight},`,
    `${reading.depth} depth. It also shows: ${reading.note}.`,
    "These are read from the pixels; follow them unless the written mood contradicts them.",
  ].join(" ");
}

function buildPrompt({ prompt, appearance, image }: ThemeRequest, reading: ThemeImageReading | null) {
  const seen = reading ? `\n\n${describeReading(reading)}` : "";
  const measured = image?.palette ? `\n\n${describePalette(image.palette)}` : "";

  return `Mood: ${prompt || "Match the image."}${seen}${measured}\n\nTarget appearance: ${appearance}.\nVariation key: ${crypto.randomUUID()}.`;
}

type Send = (payload: unknown) => void;

// Four provider calls share one 60s request. The palette is the part the user is waiting for, so the two
// passes behind it get what is left rather than a fixed slice, and are skipped when that is not enough.
const MIN_PASS_MS = 4_000;
const RESPONSE_MARGIN_MS = 3_000;
const remainingBudget = (startedAt: number) => maxDuration * 1000 - (Date.now() - startedAt) - RESPONSE_MARGIN_MS;

// A user who presses Stop closes the request, and nothing behind that should keep billing.
const withinBudget = (startedAt: number, request: AbortSignal) =>
  AbortSignal.any([request, AbortSignal.timeout(Math.max(0, remainingBudget(startedAt)))]);

// The image reading refines a brief the user already gave, so losing it must not cost them the mood, the
// measured palette and a daily generation.
async function readImageOrSkip(image: NonNullable<ThemeRequest["image"]>, signal: AbortSignal) {
  try {
    return await readImageBrief(image, signal);
  } catch {
    return null;
  }
}

function knobMood({ prompt }: ThemeRequest, reading: ThemeImageReading | null) {
  if (prompt) return prompt;
  return reading ? describeImageReading(reading) : "Match the image.";
}

async function streamGeneration(requested: ThemeRequest, send: Send, signal: AbortSignal) {
  const startedAt = Date.now();
  // Mastra drops image parts before they reach the provider, so an attached image is read in its own
  // call and folded into the brief as text. The reading is shown, because a theme derived from an image
  // the user cannot see the model's reading of is unaccountable.
  const reading = requested.image ? await readImageOrSkip(requested.image, signal) : null;
  if (reading) send({ type: "reasoning", text: `Reading the image: ${describeImageReading(reading)}\n\n` });

  const stream = await themeGeneratorAgent.stream(buildPrompt(requested, reading), {
    abortSignal: withinBudget(startedAt, signal),
  });

  // fullStream rather than objectStream: the reasoning trace and the partial objects arrive on the
  // same channel, and the trace is the only thing to show during the seconds before colours land.
  let lastTokens = "";
  for await (const chunk of stream.fullStream) {
    if (chunk.type === "reasoning-delta") send({ type: "reasoning", text: chunk.payload.text });
    if (chunk.type !== "object") continue;

    // Most object chunks only extend a field no token depends on, and every repaint the client does
    // rewrites some sixty custom properties.
    const tokens = toStreamingTokenValues(chunk.object);
    const encoded = JSON.stringify(tokens);
    if (encoded === lastTokens) continue;
    lastTokens = encoded;
    send({ type: "tokens", tokens });
  }

  const generated = await stream.object;
  const firstPass = toTokenValues(generated);

  // The gate can only ramp lightness, and flattens chroma when that is not enough. Handing the model what
  // its palette actually scored is the one correction it never otherwise sees.
  const repairBudget = remainingBudget(startedAt);
  const theme =
    firstPass.adjustments.length === 0 || repairBudget < MIN_PASS_MS
      ? generated
      : await repairContrast(generated, firstPass.adjustments, withinBudget(startedAt, signal));
  const { tokens, adjustments, font } = theme === generated ? firstPass : toTokenValues(theme);
  if (theme !== generated) send({ type: "reasoning", text: "\n\nRe-authored the roles that failed the contrast gate." });

  // The skin rides with the finished theme rather than streaming ahead of it. Selecting one clears every
  // token override, and moving between a page-scrolled and an inset-scrolled skin remounts everything
  // below PageLayout, so doing it mid-stream would wipe the painted colours and drop the drawer with the
  // generation still running inside it.
  send({ type: "complete", name: theme.name, skin: theme.skin, tokens, adjustments, font });

  // Knobs ride behind the finished theme rather than inside it. They are a second call over a 580-entry
  // registry, and holding the palette back for them would trade the whole paint for a detail.
  if (remainingBudget(startedAt) < MIN_PASS_MS) return;

  const rules = await refineKnobs(theme, knobMood(requested, reading), withinBudget(startedAt, signal));
  if (rules.length > 0) send({ type: "knobs", rules });
}

const line = (payload: unknown) => `${JSON.stringify(payload)}\n`;

export async function POST(request: Request) {
  // Read per request rather than at module load, so a test can toggle the key between cases.
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "Theme generation is not configured on this deployment." }, { status: 503 });
  }

  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Describe the theme you want, or attach an image." }, { status: 400 });
  if (body.data.prompt.length === 0 && !body.data.image) {
    return Response.json({ error: "Describe the theme you want, or attach an image." }, { status: 400 });
  }

  const grant = takeGeneration(request);
  if (!grant.granted) return grant.response;

  const encoder = new TextEncoder();
  const ndjson = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await streamGeneration(body.data, (payload) => controller.enqueue(encoder.encode(line(payload))), request.signal);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Generation failed.";
        controller.enqueue(encoder.encode(line({ type: "error", error: message })));
      }
      controller.close();
    },
  });

  return new Response(ndjson, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": grant.cookie,
    },
  });
}
