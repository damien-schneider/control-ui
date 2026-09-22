import { z } from "zod";

const VISION_MODEL = "deepseek-flash";

// Hex alone throws away the colour the user picked the image for, and a single mistyped digit turns a
// cream into a vivid blue with nothing downstream to catch it. The name is the checksum: when the two
// disagree, the theme model has the adjective to fall back on.
const INSTRUCTION = [
  "Read this image for a theme designer. Answer in under 70 words, as plain lines:",
  "surface, text, and accent, each named in two or three words and followed by its hex sampled from the image;",
  "then corner shape, density, and type character in a few words each.",
  "Describe nothing else about the picture.",
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
