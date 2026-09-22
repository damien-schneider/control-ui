import { Agent } from "@mastra/core/agent";
import { z } from "zod";

import {
  CONTRAST_GATED_PAIRS,
  type ContrastAdjustment,
  type GeneratedTheme,
  gateContrast,
  oklchChannels,
} from "./theme-generator-contract";

// Only the roles the gate is allowed to move, plus the two neutral surfaces they sit on. primary is left
// out on purpose: it is the one colour a user would name when describing the theme, so darkening it to
// rescue a label would answer a different brief than the one that was asked.
const REPAIRABLE_ROLES = ["foreground", "canvas", "card", "cardForeground", "mutedForeground", "primaryForeground"] as const;

export const themeRepairSchema = z.object({
  colors: z.object({
    foreground: oklchChannels.optional(),
    canvas: oklchChannels.optional(),
    card: oklchChannels.optional(),
    cardForeground: oklchChannels.optional(),
    mutedForeground: oklchChannels.optional(),
    primaryForeground: oklchChannels.optional(),
  }),
});

const instructions = `You repair the readability of a Control UI palette that has already been written.

Every pair listed failed WCAG AA at 4.5:1. A mechanical fix has already been applied to each: it raises or
lowers the foreground's lightness alone, and when no lightness clears the ratio it drops the foreground's
chroma to zero. That second step is what drains a tinted label to grey, and it is what you are here to avoid.

Re-author only the roles that need it, as OKLCH channels — L is lightness 0–1, C is chroma 0–0.37, H is hue
0–360. You may move a surface instead of the text on it when deepening the surface is the more faithful fix.
Every role you return replaces the original, so returning a role unchanged is the same as leaving it out.

Keep the palette's identity: same hue family, same mood, same light or dark direction. You are choosing a
better route to 4.5:1 than a lightness ramp, not redesigning the theme. Return nothing if the mechanical
fix is already the best answer.`;

export const themeRepairAgent = new Agent({
  id: "theme-repair",
  name: "Theme repair",
  instructions,
  model: "deepseek/deepseek-v4-flash",
  defaultOptions: {
    structuredOutput: { schema: themeRepairSchema },
    // No thinking: the input is six numbers and a target ratio, and the trace would cost more than the
    // answer while the client sits on a painted-but-unfinished theme.
    providerOptions: { deepseek: { thinking: { type: "disabled" }, strictJsonSchema: true } },
    modelSettings: { maxOutputTokens: 700 },
  },
});

const say = ({ L, C, H }: { L: number; C: number; H: number }) => `L ${L} C ${C} H ${H}`;

function describeFailure(theme: GeneratedTheme, { role, from, to, ratio }: ContrastAdjustment) {
  const surfaceRole = CONTRAST_GATED_PAIRS.find(([foreground]) => foreground === role)?.[1];
  const surface = surfaceRole ? theme.colors[surfaceRole] : null;
  const on = surface && surfaceRole ? ` on ${surfaceRole} (${say(surface)})` : "";
  const lost = from.C > 0 && to.C === 0 ? ", losing all of its chroma" : "";
  return `${role} (${say(from)})${on} reached only ${ratio.toFixed(2)}:1 after being moved to ${say(to)}${lost}.`;
}

function buildPrompt(theme: GeneratedTheme, adjustments: ContrastAdjustment[]) {
  const palette = Object.entries(theme.colors)
    .map(([role, color]) => `${role}: ${say(color)}`)
    .join("\n");
  return `Theme: ${theme.name}.\n\nPalette:\n${palette}\n\nFailed pairs:\n${adjustments.map((adjustment) => describeFailure(theme, adjustment)).join("\n")}`;
}

type RepairProposal = z.infer<typeof themeRepairSchema>;

// A repair is only kept when re-gating the palette moves fewer roles than before. The model is proposing a
// better route to the same ratio, so the gate stays the judge and a proposal that reads worse is discarded.
export function adoptRepair(theme: GeneratedTheme, proposal: RepairProposal, adjustments: ContrastAdjustment[]): GeneratedTheme {
  const colors = { ...theme.colors };
  for (const role of REPAIRABLE_ROLES) {
    const color = proposal.colors[role];
    if (color) colors[role] = color;
  }

  return gateContrast(colors).adjustments.length < adjustments.length ? { ...theme, colors } : theme;
}

// The theme is already generated and about to paint, so a provider failure here is not allowed to cost the
// user that theme: an unrepaired palette is still the gated one, which is correct, only less elegant.
export async function repairContrast(
  theme: GeneratedTheme,
  adjustments: ContrastAdjustment[],
  signal: AbortSignal,
): Promise<GeneratedTheme> {
  try {
    const result = await themeRepairAgent.generate(buildPrompt(theme, adjustments), {
      abortSignal: signal,
    });
    const proposed = themeRepairSchema.safeParse(result.object);
    return proposed.success ? adoptRepair(theme, proposed.data, adjustments) : theme;
  } catch {
    return theme;
  }
}
