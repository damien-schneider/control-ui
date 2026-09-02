/**
 * How to check a skin against the harvested artifact. Published to the agent cheat-sheet and embedded in
 * every prompt that asks a model to write a theme, so the rules are stated in exactly one place.
 */
export function contrastAgentRules(base: string): string[] {
  return [
    `Every painted knob with what the browser actually paints behind it, one file per paint family: \`${base}/r/contract/<family>.contrast.json\`, harvested from rendered components and verified against the browser. \`${base}/r/contract/index.json\` names the families and how many probes each has.`,
    "A probe's `anatomy` indexes into the file's `anatomies`: the paint stack under the part, back to front, its ancestors but also a sibling indicator that slides beneath it. The last node is the part itself.",
    "A part's contrast is decided by the knob it paints from **and** by every knob in that stack, never by theme tokens alone: re-valuing a surface knob changes the contrast of text you did not touch.",
    "For each probe: rebuild `anatomy` as nested elements, resolve `knobs.text` on the last one, composite the stack's fills behind it, and clear `rendersText ? 4.5 : 3`:1.",
    "`state: true` means the paint waits on an interaction, so force `knobs.fill` onto the part instead of expecting it to paint itself.",
    "A knob you leave alone still paints — it keeps its recipe default and still has to clear the ratio under your surfaces.",
    "The family's `/r/contract/<family>.json` slice lists `uncovered`: the knobs no documented route renders. Nothing measured them, so treat them as unverified rather than passing.",
    "After importing a theme, run `node <install>/scripts/control-ui-doctor.mjs --contrast`: it resolves every required pair that theme tokens alone decide, offline, and exits non-zero on a failure. Pairs a recipe paints are only measured by the rendered audit at `/theme-accessibility`.",
  ];
}
