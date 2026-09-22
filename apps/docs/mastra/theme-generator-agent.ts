import { Agent } from "@mastra/core/agent";
import { themeFontCatalogueBrief } from "./theme-fonts";
import { generatedThemeSchema } from "./theme-generator-contract";

const instructions = `You turn a short mood description into a complete Control UI theme: colour, shape, type, depth, motion and density.

Author every colour as OKLCH channels: L is lightness 0–1, C is chroma 0–0.37, H is hue 0–360.

Rules that make a palette usable rather than merely pretty:
- canvas sits one step below background; background sits below card. card is the most raised surface, so lightness rises from canvas to background to card in both appearances.
- foreground, cardForeground and mutedForeground are text. Put them far from the surface they sit on in lightness — roughly 0.5 apart — or they will be unreadable.
- mutedForeground is quieter than foreground but still readable: keep it between the two.
- primary is the one colour a user would name when describing the theme. Give it real chroma unless the request is explicitly monochrome.
- primaryForeground sits on top of primary, so it must be near-white on a dark primary and near-black on a light one.
- border and ring are close to the surfaces in hue but clearly visible against them; keep their chroma low.
- muted, secondary and accent are surfaces, not text: keep them close to background in lightness.

Pick the skin first, because it decides what the tokens are painted onto. Tokens can only express flat
colour, size and timing; gradients, live backdrop blur, refraction rims, glow and animated adornments
live in the skin's own stylesheet. A gradient-washed marketing site or a glassy dashboard is modern-apple
or cuicui with tokens tuned to its colours, never "none" with a flat background approximating it. Reach
for none or refined only when the brief really is flat, and for xp or windows-98 only when it is retro.

The rest of the theme carries as much of the mood as the colour does. Move it with intent rather than returning the defaults:
- radius is in rem: sharp and technical is 0 to 0.25, neutral is around 0.625, soft and friendly is 0.9 to 1.5. Pick squircle for soft, premium or Apple-like moods, round otherwise.
- typography.fontFamily: pick from the list below, or name any other Google Fonts family when the mood calls for a face none of these carry. scale 1.125 is even and calm, 1.25 makes headings shout. headingWeight 400–500 reads editorial, 700–900 reads loud. Negative headingTracking tightens big display type.
- shadow: size 0 with opacity 0 is flat and brutalist; a soft, lifted, glassy mood wants size 1–3 with lower opacity.
- motion: 100ms is crisp and utilitarian, 400ms is languid. Use snappy for sharp interfaces, springy for playful ones.
- layout: controlHeight 28 with small padding is dense and professional; 44+ with generous padding is relaxed and touch-friendly. A thick focusRingWidth is loud and accessible; controlRimWidth 0 removes every hairline for a flat, borderless look.
- surface: backdropBlur above 8 gives the frosted-glass look, a popoverOpacity below 1 lets menus read as glass, scrollFadeSize above 0 softens scroll edges, and a heavier overlayOpacity makes modals feel weightier.

When an image is attached it is the brief, and any text alongside it only narrows the reading. Its corner
shape, radius, spacing density, type character, heading weight and depth arrive already measured from the
pixels, in the same units this schema uses: treat them as read, not as suggestions, and spend your own
judgement on the colour and the skin. Do not describe the image; answer with the theme it implies.

Match the requested mood.

Typefaces:
${themeFontCatalogueBrief()}`;

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
    // Thinking is what lets the model reconcile a mood against fourteen colour roles before committing,
    // and its trace is what the drawer shows while no colour has landed yet. Mastra forwards `thinking`
    // but not `reasoning_effort`, so this runs at the provider's default effort.
    //
    // Thinking mode silently ignores temperature (documented, not a bug), so variety between two
    // identical prompts comes from the nonce the route appends instead.
    providerOptions: { deepseek: { thinking: { type: "enabled" }, strictJsonSchema: true } },
    // Reasoning bills as output tokens, so it shares this budget with the theme JSON. A trace can run
    // past 2000 tokens on a vague mood, and the object is ~800: too tight a cap truncates the answer
    // mid-object, which surfaces as a schema error on the groups that never arrived.
    modelSettings: { maxOutputTokens: 16000 },
  },
});
