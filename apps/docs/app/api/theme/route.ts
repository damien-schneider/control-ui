import { z } from "zod";

import { themeGeneratorAgent } from "@/mastra/theme-generator-agent";
import { generatedThemeSchema, toStreamingTokenValues, toTokenValues } from "@/mastra/theme-generator-contract";
import { takeGeneration } from "./generation-limit";

export const maxDuration = 60;

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(240),
  appearance: z.enum(["light", "dark"]),
});

// The request carries a mood and a target appearance, never messages, a model id or model settings. A
// generic agent endpoint would let a caller swap the pinned flash model for a pricier one, so the whole
// call is assembled here and the model is fixed in the agent.
function buildPrompt(prompt: string, appearance: "light" | "dark"): string {
  return `Mood: ${prompt}\n\nTarget appearance: ${appearance}.`;
}

const line = (payload: unknown) => `${JSON.stringify(payload)}\n`;

export async function POST(request: Request) {
  // Read per request rather than at module load, so a test can toggle the key between cases.
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json({ error: "Theme generation is not configured on this deployment." }, { status: 503 });
  }

  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Describe the theme you want in a sentence." }, { status: 400 });

  const grant = takeGeneration(request);
  if (!grant.granted) return grant.response;

  const stream = await themeGeneratorAgent.stream(buildPrompt(body.data.prompt, body.data.appearance), {
    structuredOutput: { schema: generatedThemeSchema },
  });

  const encoder = new TextEncoder();
  const ndjson = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(encoder.encode(line(payload)));
      try {
        for await (const partial of stream.objectStream) {
          send({ type: "tokens", tokens: toStreamingTokenValues(partial) });
        }
        const theme = await stream.object;
        const { tokens, adjustments } = toTokenValues(theme);
        send({ type: "complete", name: theme.name, tokens, adjustments });
      } catch (error) {
        send({ type: "error", error: error instanceof Error ? error.message : "Generation failed." });
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
