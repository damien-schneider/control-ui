import type { ContrastProbe } from "@/scripts/contrast-anatomy/model";
import type { ThemeAuditAnatomy, ThemeAuditPair } from "./audit-contract";
import { generatedContrastAnatomy } from "./generated-contrast-anatomy";

const SURFACES = ["--background", "--card"] as const;

function anatomyOf(probe: ContrastProbe): ThemeAuditAnatomy | null {
  const [root, ...rest] = probe.anatomy.map((node) => ({ attributes: node.attributes }));
  return root ? [root, ...rest] : null;
}

function partOf(probe: ContrastProbe): string {
  const leaf = probe.anatomy[probe.anatomy.length - 1];
  return leaf?.attributes["data-slot"] ?? leaf?.attributes["data-popup-part"] ?? "root";
}

/**
 * What a measurement depends on: the knobs the part reads and the ancestors that can re-value them.
 * The leaf's own variants pick which knob applies, and the knobs are already in the key, so probes
 * that differ only there measure the same pixel twice.
 */
const measured = (probe: ContrastProbe) => JSON.stringify([probe.knobs, probe.anatomy.slice(0, -1)]);

const distinctProbes = generatedContrastAnatomy.probes.reduce<Map<string, ContrastProbe>>((distinct, probe) => {
  const key = measured(probe);
  const known = distinct.get(key);
  if (!known) return distinct.set(key, probe);
  return distinct.set(key, { ...known, rendersText: known.rendersText || probe.rendersText, state: known.state && probe.state });
}, new Map());

/**
 * A harvested probe already carries the ancestors that paint behind its text, so the pair hands the
 * engine the chain and lets it paint itself — a skin's gradient fill is a pixel the knob alone never
 * describes. Only a state fill is forced, since no rebuilt part is ever under the pointer.
 */
export const anatomyPairs: ThemeAuditPair[] = [...distinctProbes.values()].flatMap((probe, index): ThemeAuditPair[] => {
  const foreground = probe.knobs.text;
  const anatomy = anatomyOf(probe);
  if (!foreground || !anatomy) return [];
  const fill = probe.knobs.fill;
  return SURFACES.map((surface) => ({
    id: `anatomy-${index}-${foreground.replace("--cui-", "")}-on-${surface.replace("--", "")}`,
    category: "Rendered anatomy",
    label: `${probe.recipe} ${partOf(probe)} · ${foreground.replace("--cui-", "")} on ${surface.replace("--", "")}`,
    foreground,
    background: fill ?? surface,
    backgroundPaint: fill && probe.state ? `var(${fill})` : undefined,
    backgroundAnatomy: anatomy,
    surface,
    threshold: probe.rendersText ? 4.5 : 3,
    severity: "warning",
  }));
});
