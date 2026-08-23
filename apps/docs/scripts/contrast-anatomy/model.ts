import type { PaintRole } from "./paint-map";

export type ContrastAnatomyNode = { attributes: Record<string, string> };

/**
 * One rendered occurrence of a recipe's paint rule: the ancestors that decide the leaf's paint, harvested
 * from the docs and verified by rebuilding the chain in the same browser.
 */
export type ContrastProbe = {
  knobs: Partial<Record<PaintRole, string>>;
  anatomy: ContrastAnatomyNode[];
  recipe: string;
  /** Whether the part paints glyphs, which is what makes 4.5:1 rather than 3:1 the ratio it owes. */
  rendersText: boolean;
  /** Whether the paint waits on an interaction: a rebuilt part paints its own base, but never its hover. */
  state: boolean;
  /** A documented page that renders this anatomy, so the probe can be seen rather than trusted. */
  route: string;
};

export type ContrastAnatomyArtifact = {
  version: 1;
  probes: ContrastProbe[];
  /** Knobs a recipe paints from that no documented route ever rendered — the audit's blind spots, named. */
  uncovered: string[];
};
