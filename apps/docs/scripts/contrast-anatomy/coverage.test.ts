import { describe, expect, test } from "bun:test";
import { generatedContrastAnatomy } from "../../app/(features)/theme-accessibility/generated-contrast-anatomy";
import { collectPaintRules } from "./paint-map";

const paintedKnobs = new Set(collectPaintRules().flatMap((rule) => Object.values(rule.knobs)));
const probedKnobs = new Set(generatedContrastAnatomy.probes.flatMap((probe) => Object.values(probe.knobs)));

describe("contrast anatomy artifact", () => {
  test("every knob a recipe paints from is either probed or named as a blind spot", () => {
    const unaccounted = [...paintedKnobs].filter((knob) => !probedKnobs.has(knob) && !generatedContrastAnatomy.uncovered.includes(knob));
    expect(unaccounted).toEqual([]);
  });

  test("no probe measures a knob the recipes no longer paint", () => {
    const stale = [...probedKnobs].filter((knob) => !paintedKnobs.has(knob));
    expect(stale).toEqual([]);
  });

  test("every probe ends at the part that paints the text", () => {
    const rootless = generatedContrastAnatomy.probes.filter((probe) => probe.anatomy.length === 0);
    expect(rootless).toEqual([]);
  });
});
