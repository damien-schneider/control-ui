import { describe, expect, test } from "bun:test";

import type { KnobRule } from "@/components/theme-drawer/types";
import { colorComesFromTokens, type KnobRejection, knobFamilySummaries, knobsForFamily, validateKnobOverrides } from "./theme-knobs";

const LENGTH_KNOB = "--cui-alert-border-width";
const COLOR_KNOB = "--cui-accordion-item-border-color";
const NUMBER_KNOB = "--cui-action-bar-hidden-opacity";
const RADIUS_KNOB = "--cui-alert-radius";
const TIME_KNOB = "--cui-progressive-blur-transition-duration";
const FREEFORM_KNOB = "--cui-alert-shadow";

const reasonFor = (result: { rejected: readonly KnobRejection[] }, name: string) =>
  result.rejected.find((rejection) => rejection.name === name)?.reason;

const tokensOf = (result: { rules: readonly KnobRule[] }) => {
  const tokens: Record<string, string> = {};
  for (const rule of result.rules) Object.assign(tokens, rule.tokens);
  return tokens;
};

const selectorOf = (knobName: string) => {
  const familyId = knobFamilySummaries().find((summary) => knobsForFamily(summary.id).some((knob) => knob.name === knobName))?.id;
  return knobsForFamily(familyId ?? "").find((knob) => knob.name === knobName)?.selector;
};

describe("registry index", () => {
  test("every declared knob resolves through its family and is registered for validation", () => {
    const summaries = knobFamilySummaries();
    expect(summaries.length).toBeGreaterThan(0);
    for (const summary of summaries) {
      const knobs = knobsForFamily(summary.id);
      expect(knobs.length).toBe(summary.knobCount);
      expect(summary.sample.length).toBeLessThanOrEqual(6);
      expect(summary.sample).toEqual(knobs.slice(0, 6).map((knob) => knob.name));
    }
  });

  test("unknown family id returns empty rather than throwing", () => {
    expect(knobsForFamily("not-a-recipe")).toEqual([]);
    expect(knobsForFamily("")).toEqual([]);
  });

  test("registry defaults that fit the model value budget match their own declared syntax", () => {
    const defaults: Record<string, string> = {};
    for (const summary of knobFamilySummaries()) {
      for (const knob of knobsForFamily(summary.id)) {
        const singleLine = knob.defaultValue.replace(/\s+/g, " ").trim();
        if (singleLine && singleLine.length <= 128) defaults[knob.name] = singleLine;
      }
    }
    expect(Object.keys(defaults).length).toBeGreaterThan(100);
    expect(validateKnobOverrides(defaults).rejected).toEqual([]);
  });
});

describe("validateKnobOverrides", () => {
  test("accepts values matching each declared syntax family", () => {
    const result = validateKnobOverrides({
      [LENGTH_KNOB]: "2px",
      [COLOR_KNOB]: "oklch(0.7 0.1 240)",
      [NUMBER_KNOB]: "0.35",
      [RADIUS_KNOB]: "50%",
      [TIME_KNOB]: "120ms",
      [FREEFORM_KNOB]: "0 1px 2px rgb(0 0 0 / 0.2)",
    });
    expect(result.rejected).toEqual([]);
    expect(tokensOf(result)[LENGTH_KNOB]).toBe("2px");
    expect(tokensOf(result)[TIME_KNOB]).toBe("120ms");
  });

  test("accepts signed, decimal and leading-dot numbers and a bare zero length", () => {
    for (const number of ["-.5", "+2", "1.25", "0"]) {
      expect(tokensOf(validateKnobOverrides({ [NUMBER_KNOB]: number }))[NUMBER_KNOB]).toBe(number);
    }
    for (const length of ["0", "1.5rem", "10q", "-2px", ".5vmin"]) {
      expect(tokensOf(validateKnobOverrides({ [LENGTH_KNOB]: length }))[LENGTH_KNOB]).toBe(length);
    }
    expect(validateKnobOverrides({ [NUMBER_KNOB]: "0.5px" }).rules).toEqual([]);
  });

  test("accepts every colour notation the contract allows and no more", () => {
    for (const color of ["red", "currentColor", "transparent", "#abc", "#a1b2c3ff", "color-mix(in oklab, red, blue)"]) {
      expect(tokensOf(validateKnobOverrides({ [COLOR_KNOB]: color }))[COLOR_KNOB]).toBe(color);
    }
    for (const color of ["#gggggg", "reddish", "12px"]) {
      expect(validateKnobOverrides({ [COLOR_KNOB]: color }).rules).toEqual([]);
    }
  });

  test("a multiplied syntax takes a space or comma separated list of its base type", () => {
    const listKnob = "--cui-color-picker-swatch-radius";
    expect(validateKnobOverrides({ [listKnob]: "4px 8px" }).rejected).toEqual([]);
    expect(validateKnobOverrides({ [listKnob]: "4px, 50%" }).rejected).toEqual([]);
    expect(validateKnobOverrides({ [listKnob]: "4px red" }).rules).toEqual([]);
    expect(validateKnobOverrides({ [LENGTH_KNOB]: "4px 8px" }).rules).toEqual([]);
  });

  test("rejects a value of the wrong type for the knob", () => {
    const result = validateKnobOverrides({ [LENGTH_KNOB]: "oklch(0.7 0.1 240)", [TIME_KNOB]: "4px" });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, LENGTH_KNOB)).toContain("<length>");
    expect(reasonFor(result, TIME_KNOB)).toContain("<time>");
  });

  test("rejects unknown and non-prefixed names", () => {
    const result = validateKnobOverrides({ "--cui-not-a-real-knob": "2px", "--radius": "2px", color: "red" });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, "--cui-not-a-real-knob")).toContain("registered");
    expect(reasonFor(result, "--radius")).toContain("--cui-");
    expect(reasonFor(result, "color")).toContain("--cui-");
  });

  test("rejects declaration-breaking and unsafe values", () => {
    const result = validateKnobOverrides({
      [LENGTH_KNOB]: "2px; color: red",
      [RADIUS_KNOB]: "4px } body {",
      [FREEFORM_KNOB]: "url(https://evil.example/x.png)",
      [COLOR_KNOB]: "red /* sneaky */",
    });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, LENGTH_KNOB)).toContain("declaration-breaking");
    expect(reasonFor(result, RADIUS_KNOB)).toContain("declaration-breaking");
    expect(reasonFor(result, FREEFORM_KNOB)).toContain("unsafe");
    expect(reasonFor(result, COLOR_KNOB)).toContain("unsafe");
  });

  test("rejects unbalanced parens and unclosed quotes", () => {
    const result = validateKnobOverrides({ [LENGTH_KNOB]: "calc(2px + 1px", [FREEFORM_KNOB]: `inset 0 0 0 1px "open` });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, LENGTH_KNOB)).toContain("unbalanced");
    expect(reasonFor(result, FREEFORM_KNOB)).toContain("unbalanced");
  });

  test("accepts var() and calc() where a typed value is expected", () => {
    const result = validateKnobOverrides({
      [LENGTH_KNOB]: "var(--spacing)",
      [RADIUS_KNOB]: "calc(var(--radius) * 2)",
      [COLOR_KNOB]: "var(--border)",
    });
    expect(result.rejected).toEqual([]);
    expect(Object.keys(tokensOf(result))).toHaveLength(3);
  });

  test("rejects trailing junk after an otherwise valid function", () => {
    const result = validateKnobOverrides({ [COLOR_KNOB]: "oklch(0.7 0.1 240) red" });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, COLOR_KNOB)).toContain("<color>");
  });

  test("rejects empty, over-long and non-string values", () => {
    const result = validateKnobOverrides({
      [LENGTH_KNOB]: "   ",
      [RADIUS_KNOB]: `${"1".repeat(129)}px`,
      [NUMBER_KNOB]: 0.5,
    });
    expect(result.rules).toEqual([]);
    expect(reasonFor(result, LENGTH_KNOB)).toContain("empty");
    expect(reasonFor(result, RADIUS_KNOB)).toContain("longer");
    expect(reasonFor(result, NUMBER_KNOB)).toContain("string");
  });

  test("one bad entry does not drop a good sibling", () => {
    const result = validateKnobOverrides({ [LENGTH_KNOB]: "3px", [COLOR_KNOB]: "not-a-colour" });
    expect(tokensOf(result)).toEqual({ [LENGTH_KNOB]: "3px" });
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]?.name).toBe(COLOR_KNOB);
  });

  test("groups accepted knobs by the selector that declares them", () => {
    const shared = validateKnobOverrides({ [LENGTH_KNOB]: "2px", [RADIUS_KNOB]: "8px" });
    expect(shared.rejected).toEqual([]);
    expect(shared.rules).toHaveLength(1);
    expect(shared.rules[0]?.selector).toBe(selectorOf(LENGTH_KNOB) ?? "");
    expect(shared.rules[0]?.selector).toContain("data-control-family");
    expect(shared.rules[0]?.tokens).toEqual({ [LENGTH_KNOB]: "2px", [RADIUS_KNOB]: "8px" });

    const split = validateKnobOverrides({ [LENGTH_KNOB]: "2px", [COLOR_KNOB]: "red", [RADIUS_KNOB]: "8px" });
    expect(split.rejected).toEqual([]);
    expect(split.rules).toHaveLength(2);
    expect(split.rules.map((rule) => rule.selector)).toEqual([selectorOf(LENGTH_KNOB) ?? "", selectorOf(COLOR_KNOB) ?? ""]);
    expect(split.rules[1]?.tokens).toEqual({ [COLOR_KNOB]: "red" });
  });

  test("non-object input yields no rules and one rejection", () => {
    for (const input of ["{}", 42, null, undefined, ["--cui-alert-radius"]]) {
      const result = validateKnobOverrides(input);
      expect(result.rules).toEqual([]);
      expect(result.rejected).toHaveLength(1);
      expect(result.rejected[0]?.name).toBe("");
    }
  });
});

describe("the selector a knob is written on", () => {
  // audio-recorder re-declares --cui-button-shadow on its own record trigger, and sorts ahead of button.css.
  // Writing a button knob there would restyle that one trigger instead of every button.
  test("comes from the knob's own family, not from whichever recipe declares it first", () => {
    const shadow = knobsForFamily("button").find((knob) => knob.name === "--cui-button-shadow");

    expect(shadow?.selector).toContain('data-control-family="button"');
    expect(shadow?.selector).not.toContain("audio-recorder");
  });

  test("exists for every registered knob, since a knob without one cannot be written at all", () => {
    const orphans = knobFamilySummaries()
      .flatMap((family) => [...knobsForFamily(family.id)])
      .filter((knob) => !knob.selector);

    expect(orphans).toEqual([]);
  });
});

// A generation runs for one appearance, so a colour it invents stays painted after the user switches mode.
// A recipe may fix a colour deliberately, which is why this rule sits beside the validator, not inside it.
describe("colorComesFromTokens", () => {
  test("refuses a colour a generated theme would have invented", () => {
    for (const color of ["red", "white", "#a1b2c3ff", "oklch(0.7 0.1 240)", "color-mix(in oklab, red, blue)"]) {
      expect(colorComesFromTokens(COLOR_KNOB, color)).toBe(false);
    }
    expect(colorComesFromTokens(FREEFORM_KNOB, "0 1px 2px rgb(0 0 0 / 0.2)")).toBe(false);
  });

  test("accepts token references and the keywords that follow the mode anyway", () => {
    for (const color of ["var(--primary)", "oklch(from var(--primary) l c h)", "transparent", "currentColor"]) {
      expect(colorComesFromTokens(COLOR_KNOB, color)).toBe(true);
    }
    expect(colorComesFromTokens(FREEFORM_KNOB, "4px 4px 0 0 var(--foreground)")).toBe(true);
    expect(colorComesFromTokens(LENGTH_KNOB, "2px")).toBe(true);
  });
});
