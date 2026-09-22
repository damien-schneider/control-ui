import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import type { KnobRule } from "@/components/theme-drawer/types";
import { firstJsonObject } from "./first-json-object";
import type { GeneratedTheme } from "./theme-generator-contract";
import { colorComesFromTokens, knobFamilySummaries, knobsForFamily, validateKnobOverrides } from "./theme-knobs";

const listKnobFamilies = createTool({
  id: "list-knob-families",
  description: "Every component family that exposes --cui-* knobs, with how many knobs it has and a sample of their names.",
  inputSchema: z.object({}),
  execute: async () => ({ families: knobFamilySummaries() }),
});

const describeKnobs = createTool({
  id: "describe-knobs",
  description: "Every --cui-* knob one component family exposes, with the CSS syntax it accepts and the value it currently resolves to.",
  inputSchema: z.object({ family: z.string().describe("A family id returned by list-knob-families") }),
  execute: async ({ family }) => ({ knobs: knobsForFamily(family) }),
});

const knobOverridesSchema = z.object({
  overrides: z.array(z.object({ name: z.string(), value: z.string() })).max(24),
});

const instructions = `You add the finishing details to a Control UI theme that has already been written.

The theme you are given is a set of design tokens — colour, radius, type, shadow, motion, density. Those are
already applied. Below them sit component knobs: custom properties named --cui-<family>-<part> that each
component recipe reads. A knob is the only way to say something about one component that the tokens cannot
say about every component at once.

Call list-knob-families once, then describe-knobs on at most three families that matter for this mood. Every
knob you set must earn its place:
- it says something the applied tokens do not. The theme already set the radius, the shadow and the type for
  every component at once; restating one of those on a single component is noise, not a detail.
- it is a detail of the brief with nowhere else to live — a stepped brutalist shadow, a flat pressed state,
  a heavier rim on inputs, a wider gap in a toolbar.
- its value matches that knob's declared syntax exactly. A <length> needs a unit; a <color> needs a token,
  written as var(--card) or oklch(from var(--primary) l c h). A generation runs for one appearance, so a
  literal colour would stay painted after the user switches light to dark, and is refused.

Return at most twelve overrides, and none at all when the tokens already say everything the mood needs — an
empty answer is a good answer.

Answer with one json object and nothing after it:
{"overrides":[{"name":"--cui-button-shadow","value":"4px 4px 0 0 var(--foreground)"}]}`;

// No structuredOutput: a native response format is resolved on the first call, which leaves the model no
// turn in which to call a tool. Reading the object out of the answer is what buys the registry lookups.
export const themeKnobAgent = new Agent({
  id: "theme-knobs",
  name: "Theme knobs",
  instructions,
  model: "deepseek/deepseek-v4-flash",
  tools: { listKnobFamilies, describeKnobs },
  defaultOptions: {
    providerOptions: { deepseek: { thinking: { type: "disabled" } } },
    modelSettings: { maxOutputTokens: 2600 },
  },
});

function describeTheme(theme: GeneratedTheme, mood: string) {
  const lines = [
    `Mood: ${mood || "none given"}.`,
    `Theme: ${theme.name}, on the ${theme.skin} skin.`,
    theme.radius === undefined ? null : `Radius: ${theme.radius}rem, ${theme.cornerShape ?? "round"} corners.`,
    theme.typography === undefined ? null : `Type: ${theme.typography.fontFamily}, headings at ${theme.typography.headingWeight}.`,
    theme.shadow === undefined ? null : `Shadow: size ${theme.shadow.size} at opacity ${theme.shadow.opacity}.`,
    theme.layout === undefined ? null : `Controls: ${theme.layout.controlHeight}px tall, ${theme.layout.controlRimWidth}px rim.`,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

const MAX_TOOL_STEPS = 6;

// Knob values are the one piece of model output that reaches a stylesheet as CSS rather than as a number, so
// nothing here is trusted: the registry decides which names exist and which values their syntax allows. The
// theme has already been sent by this point, so a failure costs the detail pass and nothing else.
export async function refineKnobs(theme: GeneratedTheme, mood: string, budgetMs: number): Promise<KnobRule[]> {
  try {
    const result = await themeKnobAgent.generate(describeTheme(theme, mood), {
      maxSteps: MAX_TOOL_STEPS,
      abortSignal: AbortSignal.timeout(budgetMs),
    });
    const answered = knobOverridesSchema.safeParse(firstJsonObject(result.text));
    if (!answered.success) return [];
    const requested: Record<string, string> = {};
    for (const { name, value } of answered.data.overrides) {
      if (colorComesFromTokens(name, value)) requested[name] = value;
    }
    return [...validateKnobOverrides(requested).rules];
  } catch {
    return [];
  }
}
