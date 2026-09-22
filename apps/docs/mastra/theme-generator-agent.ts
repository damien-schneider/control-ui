import { Agent } from "@mastra/core/agent";

import { generatedThemeSchema } from "./theme-generator-contract";

const instructions = `You turn a short mood description into a Control UI palette.

Author every colour as OKLCH channels: L is lightness 0–1, C is chroma 0–0.37, H is hue 0–360.

Rules that make a palette usable rather than merely pretty:
- canvas sits one step below background; background sits below card. In a light theme each is lighter than the last, in a dark theme each is darker.
- foreground, cardForeground and mutedForeground are text. Put them far from the surface they sit on in lightness — roughly 0.5 apart — or they will be unreadable.
- mutedForeground is quieter than foreground but still readable: keep it between the two.
- primary is the one colour a user would name when describing the theme. Give it real chroma unless the request is explicitly monochrome.
- primaryForeground sits on top of primary, so it must be near-white on a dark primary and near-black on a light one.
- border and ring are close to the surfaces in hue but clearly visible against them; keep their chroma low.
- muted, secondary and accent are surfaces, not text: keep them close to background in lightness.
- radius is in rem. Sharp and technical is 0 to 0.25, neutral is around 0.625, soft and friendly is 0.9 to 1.5.

Match the requested mood. If the request names no mood at all, answer with a calm neutral light palette.`;

// structuredOutput without its own `model` resolves to Mastra's "direct" mode: the schema becomes the
// provider's native response format on this one call. Passing a model there would switch it to the
// two-stage processor, which reruns a structuring agent over the first pass's prose and holds every
// object chunk behind a completed text generation.
export const themeGeneratorAgent = new Agent({
  id: "theme-generator",
  name: "Theme generator",
  instructions,
  model: "deepseek/deepseek-v4-flash",
  defaultOptions: {
    structuredOutput: { schema: generatedThemeSchema },
    // Thinking is on by default at high effort: it bills reasoning as output tokens, adds seconds
    // before the first colour lands, and silently voids temperature — which would make every
    // generation of the same prompt look identical.
    providerOptions: { deepseek: { thinking: { type: "disabled" }, strictJsonSchema: true } },
    modelSettings: { temperature: 1.1, maxOutputTokens: 900 },
  },
});
