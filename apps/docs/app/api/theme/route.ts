import { z } from "zod";

import { themeGeneratorAgent } from "@/mastra/theme-generator-agent";
import { generatedThemeSchema, toStreamingTokenValues, toTokenValues } from "@/mastra/theme-generator-contract";
import { readImageBrief } from "@/mastra/theme-image-brief";
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
  return `Colours measured from the image's pixels — surface ${say(palette.surface)}, text ${say(palette.text)}, accent ${say(palette.accent)}. These are exact; trust them over any impression of the colours.`;
}

function buildPrompt({ prompt, appearance, image }: ThemeRequest, imageBrief: string | null) {
  const fallback = imageBrief ? "Match the image." : "No mood given; answer with a calm neutral theme.";
  const seen = imageBrief ? `\n\nThe attached image shows: ${imageBrief}` : "";
  const measured = image?.palette ? `\n\n${describePalette(image.palette)}` : "";

  return `Mood: ${prompt || fallback}${seen}${measured}\n\nTarget appearance: ${appearance}.\nVariation key: ${crypto.randomUUID()}.`;
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

  const theme = await stream.object;
  const { tokens, adjustments } = toTokenValues(theme);

  // The skin rides with the finished theme rather than streaming ahead of it. Selecting one clears every
  // token override, and moving between a page-scrolled and an inset-scrolled skin remounts everything
  // below PageLayout, so doing it mid-stream would wipe the painted colours and drop the drawer with the
  // generation still running inside it.
  send({ type: "complete", name: theme.name, skin: theme.skin, tokens, adjustments });
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
