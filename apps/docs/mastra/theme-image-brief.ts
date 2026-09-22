import { z } from "zod";

import { firstJsonObject } from "./first-json-object";

const VISION_MODEL = "deepseek-flash";

const MIN_RADIUS_REM = 0;
const MAX_RADIUS_REM = 1.75;
const MIN_HEADING_WEIGHT = 400;
const MAX_HEADING_WEIGHT = 900;
const MAX_NOTE_WORDS = 20;

// Colour is measured from the pixels in the client, never asked for here. This model encodes a 1024px
// screenshot at roughly 150 tokens: enough to read shape, density and weight, and not enough to sample a
// colour — asked for hex it returned #1813ea for a cream surface, and asked for adjectives it called the
// same cream interface "dark navy".
const INSTRUCTION = [
  "Read the visual style of this interface and reply with one json object, nothing before or after it.",
  "Fields, and the only values each accepts:",
  'cornerShape: "sharp", "slightly-rounded", "rounded" or "pill".',
  "radiusRem: how large the corner radius reads on a 36px-tall control, in rem where 1rem is 16px —",
  "0 is a square corner, 0.375 a small round, 0.75 generous, 1.75 a capsule.",
  'density: "dense", "balanced" or "airy".',
  'typeCharacter: "geometric-sans", "neutral-sans", "grotesque-sans", "humanist-sans", "serif", "slab-serif", "display" or "mono".',
  "headingWeight: a number from 400 to 900 in steps of 50.",
  'depth: "flat", "soft-shadow", "lifted" or "glassy".',
  "note: at most 20 words on shape, texture and layout only.",
  "Never mention colour anywhere, the note included. Describe nothing else about the picture.",
  'Example: {"cornerShape":"rounded","radiusRem":0.75,"density":"airy","typeCharacter":"geometric-sans",',
  '"headingWeight":600,"depth":"soft-shadow","note":"wide gutters, hairline rules, cards floating on an open grid"}',
].join(" ");

// A hung vision call would sit inside an already-open stream, silent, until the function is killed.
const READ_TIMEOUT_MS = 20_000;

// The object itself costs roughly 150 tokens; the headroom covers a pretty-printed reply with a full-length
// note, because a reply truncated mid-string parses as nothing at all.
const MAX_TOKENS = 400;

const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().trim().min(1) }) })).min(1),
});

// A near-miss number is still a usable reading, so both numbers are coerced and clamped; an unrecognised
// enum value means the model answered a different question, so those fail closed.
const readingSchema = z.object({
  cornerShape: z.enum(["sharp", "slightly-rounded", "rounded", "pill"]),
  radiusRem: z.coerce.number().transform((value) => Math.round(Math.min(Math.max(value, MIN_RADIUS_REM), MAX_RADIUS_REM) * 1000) / 1000),
  density: z.enum(["dense", "balanced", "airy"]),
  typeCharacter: z.enum(["geometric-sans", "neutral-sans", "grotesque-sans", "humanist-sans", "serif", "slab-serif", "display", "mono"]),
  headingWeight: z.coerce.number().transform((value) => Math.round(Math.min(Math.max(value, MIN_HEADING_WEIGHT), MAX_HEADING_WEIGHT))),
  depth: z.enum(["flat", "soft-shadow", "lifted", "glassy"]),
  note: z.string().transform((text) => text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).slice(0, MAX_NOTE_WORDS).join(" ")),
});

export type ThemeImageInput = { mediaType: string; data: string };

export type ThemeImageReading = {
  cornerShape: "sharp" | "slightly-rounded" | "rounded" | "pill";
  radiusRem: number;
  density: "dense" | "balanced" | "airy";
  typeCharacter: "geometric-sans" | "neutral-sans" | "grotesque-sans" | "humanist-sans" | "serif" | "slab-serif" | "display" | "mono";
  headingWeight: number;
  depth: "flat" | "soft-shadow" | "lifted" | "glassy";
  note: string;
};

// JSON mode is requested and the reply is still scanned, so a model that ignores the format still reads.
// Mastra 1.68 drops image parts before they reach the provider, so the theme agent can only ever be
// given text. Reading the image here in its own call keeps one structured-output implementation and
// costs ~600 tokens; the reading, not the pixels, is what the theme is then written from.
export async function readImageBrief({ mediaType, data }: ThemeImageInput, signal?: AbortSignal): Promise<ThemeImageReading> {
  const deadline = AbortSignal.timeout(READ_TIMEOUT_MS);
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    signal: signal ? AbortSignal.any([signal, deadline]) : deadline,
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      thinking: { type: "disabled" },
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
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

  const parsed = readingSchema.safeParse(firstJsonObject(completion.data.choices[0].message.content));
  if (!parsed.success) throw new Error("The image could not be read.");

  return parsed.data;
}

const CORNER_WORDS: Record<ThemeImageReading["cornerShape"], string> = {
  sharp: "sharp",
  "slightly-rounded": "slightly rounded",
  rounded: "rounded",
  pill: "pill",
};

const TYPE_WORDS: Record<ThemeImageReading["typeCharacter"], string> = {
  "geometric-sans": "geometric sans",
  "neutral-sans": "neutral sans",
  "grotesque-sans": "grotesque sans",
  "humanist-sans": "humanist sans",
  serif: "serif",
  "slab-serif": "slab serif",
  display: "display type",
  mono: "mono",
};

const DEPTH_WORDS: Record<ThemeImageReading["depth"], string> = {
  flat: "flat surfaces",
  "soft-shadow": "soft shadows",
  lifted: "lifted panels",
  glassy: "glassy blur",
};

export function describeImageReading({
  cornerShape,
  radiusRem,
  density,
  typeCharacter,
  headingWeight,
  depth,
  note,
}: ThemeImageReading): string {
  const line = [
    `corners ${CORNER_WORDS[cornerShape]} (~${radiusRem}rem)`,
    `${density} spacing`,
    `${TYPE_WORDS[typeCharacter]} at ${headingWeight}`,
    DEPTH_WORDS[depth],
  ].join(" · ");

  return note ? `${line} — ${note}` : line;
}
