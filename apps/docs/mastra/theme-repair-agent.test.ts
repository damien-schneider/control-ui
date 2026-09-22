import { expect, test } from "bun:test";

import { type GeneratedTheme, gateContrast } from "./theme-generator-contract";
import { adoptRepair } from "./theme-repair-agent";

const grey = (L: number) => ({ L, C: 0, H: 0 });

// cardForeground sits ten points of lightness under card, so the gate has to move it to reach 4.5:1.
const unreadable: GeneratedTheme = {
  name: "Pale on pale",
  skin: "none",
  colors: {
    canvas: grey(0.98),
    background: grey(0.96),
    foreground: grey(0.2),
    card: grey(0.95),
    cardForeground: grey(0.85),
    primary: { L: 0.55, C: 0.2, H: 250 },
    primaryForeground: grey(1),
    muted: grey(0.94),
    mutedForeground: grey(0.45),
    secondary: grey(0.93),
    accent: grey(0.92),
    destructive: { L: 0.55, C: 0.2, H: 25 },
    border: grey(0.88),
    ring: { L: 0.55, C: 0.2, H: 250 },
  },
};

const baseline = gateContrast(unreadable.colors).adjustments;

test("the gate has to move a foreground that cannot be read on its own card", () => {
  expect(baseline.map((adjustment) => adjustment.role)).toContain("cardForeground");
});

test("a proposal that clears the gate on its own replaces the mechanical fit", () => {
  const repaired = adoptRepair(unreadable, { colors: { cardForeground: grey(0.25) } }, baseline);

  expect(repaired.colors.cardForeground.L).toBe(0.25);
  expect(gateContrast(repaired.colors).adjustments.map((adjustment) => adjustment.role)).not.toContain("cardForeground");
});

test("a proposal that still fails is discarded for the mechanical fit", () => {
  const repaired = adoptRepair(unreadable, { colors: { cardForeground: grey(0.86) } }, baseline);

  expect(repaired).toBe(unreadable);
});

// Deepening the card rescues cardForeground and drops mutedForeground through the floor, so the palette as
// a whole is no more readable than the mechanical fit was.
test("a surface move that fixes one pair and breaks another is discarded", () => {
  const repaired = adoptRepair(unreadable, { colors: { card: grey(0.15) } }, baseline);

  expect(repaired).toBe(unreadable);
});

test("an accepted proposal leaves every role it did not name alone", () => {
  const repaired = adoptRepair(unreadable, { colors: { cardForeground: grey(0.25) } }, baseline);

  expect(repaired.colors.primary).toEqual(unreadable.colors.primary);
  expect(repaired.name).toBe(unreadable.name);
  expect(repaired.skin).toBe(unreadable.skin);
});
