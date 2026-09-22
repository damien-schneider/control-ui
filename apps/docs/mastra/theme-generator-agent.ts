import { Agent } from "@mastra/core/agent";

import { generatedThemeSchema } from "./theme-generator-contract";

const instructions = `You turn a short mood description into a complete Control UI theme: colour, shape, type, depth, motion and density.

Author every colour as OKLCH channels: L is lightness 0–1, C is chroma 0–0.37, H is hue 0–360.

Rules that make a palette usable rather than merely pretty:
- canvas sits one step below background; background sits below card. In a light theme each is lighter than the last, in a dark theme each is darker.
- foreground, cardForeground and mutedForeground are text. Put them far from the surface they sit on in lightness — roughly 0.5 apart — or they will be unreadable.
- mutedForeground is quieter than foreground but still readable: keep it between the two.
- primary is the one colour a user would name when describing the theme. Give it real chroma unless the request is explicitly monochrome.
- primaryForeground sits on top of primary, so it must be near-white on a dark primary and near-black on a light one.
- border and ring are close to the surfaces in hue but clearly visible against them; keep their chroma low.
- muted, secondary and accent are surfaces, not text: keep them close to background in lightness.

The rest of the theme carries as much of the mood as the colour does. Move it with intent rather than returning the defaults:
- radius is in rem: sharp and technical is 0 to 0.25, neutral is around 0.625, soft and friendly is 0.9 to 1.5. Pick squircle for soft, premium or Apple-like moods, round otherwise.
- typography.scale is the ratio between text sizes: 1.125 is even and calm, 1.25 makes headings shout. headingWeight 400–500 reads editorial, 700–900 reads loud. Negative headingTracking tightens big display type.
- shadow: size 0 with opacity 0 is flat and brutalist; a soft, lifted, glassy mood wants size 1–3 with lower opacity.
- motion: 100ms is crisp and utilitarian, 400ms is languid. Use snappy for sharp interfaces, springy for playful ones.
- layout: controlHeight 28 with small padding is dense and professional; 44+ with generous padding is relaxed and touch-friendly.
- surface: backdropBlur above 8 gives the frosted-glass look, and a heavier overlayOpacity makes modals feel weightier.

Match the requested mood. If the request names no mood at all, answer with a calm neutral light theme.`;

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
    modelSettings: { temperature: 1.1, maxOutputTokens: 1400 },
  },
});
