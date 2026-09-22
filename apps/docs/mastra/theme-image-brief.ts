import { z } from "zod";

const VISION_MODEL = "deepseek-flash";

// Colour is measured from the pixels in the client, never asked for here. This model encodes a 1024px
// screenshot at roughly 150 tokens: enough to read shape, density and weight, and not enough to sample a
// colour — asked for hex it returned #1813ea for a cream surface, and asked for adjectives it called the
// same cream interface "dark navy".
const INSTRUCTION = [
  "Describe the visual style of this interface for a theme designer, in under 40 words, as plain lines:",
  "corner shape, spacing density, type character, and how much depth it has (flat, soft shadows, or glassy and blurred).",
  "Never mention colour. Describe nothing else about the picture.",
].join(" ");

// A hung vision call would sit inside an already-open stream, silent, until the function is killed.
const READ_TIMEOUT_MS = 20_000;

const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().trim().min(1) }) })).min(1),
});

export type ThemeImageInput = { mediaType: string; data: string };

// Mastra 1.68 drops image parts before they reach the provider, so the theme agent can only ever be
// given text. Reading the image here in its own call keeps one structured-output implementation and
// costs ~600 tokens; the reading, not the pixels, is what the theme is then written from.
export async function readImageBrief({ mediaType, data }: ThemeImageInput, signal?: AbortSignal): Promise<string> {
  const deadline = AbortSignal.timeout(READ_TIMEOUT_MS);
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      thinking: { type: "disabled" },
      max_tokens: 260,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${data}` } },
            { type: "text", text: INSTRUCTION },
          ],
        },
      ],
    }),
  });

  const completion = completionSchema.safeParse(response.ok ? await response.json() : null);
  if (!completion.success) throw new Error("The image could not be read.");

  return completion.data.choices[0].message.content.trim();
}
