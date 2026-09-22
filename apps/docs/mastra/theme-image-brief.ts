const VISION_MODEL = "deepseek-flash";

const INSTRUCTION =
  "Describe this image for a theme designer in under 60 words: the dominant surface colour, the text colour, the one accent colour a person would name, the corner shape, the density, and the type character. Name colours plainly. Describe nothing else.";

export type ThemeImageInput = { mediaType: string; data: string };

// Mastra 1.68 drops image parts before they reach the provider, so the theme agent can only ever be
// given text. Reading the image here in its own call keeps one structured-output implementation and
// costs ~600 tokens; the reading, not the pixels, is what the theme is then written from.
export async function readImageBrief({ mediaType, data }: ThemeImageInput, signal?: AbortSignal): Promise<string> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      thinking: { type: "disabled" },
      max_tokens: 220,
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

  if (!response.ok) throw new Error("The image could not be read.");

  const body = await response.json();
  const brief = body?.choices?.[0]?.message?.content;
  if (typeof brief !== "string" || brief.trim().length === 0) throw new Error("The image could not be read.");

  return brief.trim();
}
