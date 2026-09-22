import { z } from "zod";

import { themeGeneratorAgent } from "@/mastra/theme-generator-agent";
import { generatedThemeSchema, toStreamingTokenValues, toTokenValues } from "@/mastra/theme-generator-contract";
import { readImageBrief } from "@/mastra/theme-image-brief";
import { takeGeneration } from "./generation-limit";

export const maxDuration = 60;

// A data URL is the whole image inline, so the cap is the real abuse surface here: a 240-character mood
// costs nothing to validate, an unbounded upload costs bandwidth and tokens on every retry.
const MAX_IMAGE_BYTES = 4_000_000;

const requestSchema = z.object({
  prompt: z.string().trim().max(240),
  appearance: z.enum(["light", "dark"]),
  image: z
    .object({
      mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
      data: z.string().max(Math.ceil((MAX_IMAGE_BYTES * 4) / 3)),
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
function buildPrompt({ prompt, appearance }: ThemeRequest, imageBrief: string | null) {
  const fallback = imageBrief ? "Match the image." : "No mood given; answer with a calm neutral theme.";
  const seen = imageBrief ? `\n\nThe attached image shows: ${imageBrief}` : "";

  return `Mood: ${prompt || fallback}${seen}\n\nTarget appearance: ${appearance}.\nVariation key: ${crypto.randomUUID()}.`;
}

type Send = (payload: unknown) => void;

async function streamGeneration(requested: ThemeRequest, send: Send) {
  // Mastra drops image parts before they reach the provider, so an attached image is read in its own
  // call and folded into the brief as text. The reading is shown, because a theme derived from an image
  // the user cannot see the model's reading of is unaccountable.
  const imageBrief = requested.image ? await readImageBrief(requested.image) : null;
  if (imageBrief) send({ type: "reasoning", text: `Reading the image: ${imageBrief}\n\n` });

  const stream = await themeGeneratorAgent.stream(buildPrompt(requested, imageBrief), {
    structuredOutput: { schema: generatedThemeSchema },
  });

  // fullStream rather than objectStream: the reasoning trace and the partial objects arrive on the
  // same channel, and the trace is the only thing to show during the seconds before colours land.
  for await (const chunk of stream.fullStream) {
    if (chunk.type === "reasoning-delta") send({ type: "reasoning", text: chunk.payload.text });
    if (chunk.type === "object") send({ type: "tokens", tokens: toStreamingTokenValues(chunk.object) });
  }

  const theme = await stream.object;
  const { tokens, adjustments } = toTokenValues(theme);
  send({ type: "complete", name: theme.name, tokens, adjustments });
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
        await streamGeneration(body.data, (payload) => controller.enqueue(encoder.encode(line(payload))));
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
