import { describe, expect, test } from "bun:test";
import { type Hsva, parseColor, type Rgba } from "./color";
import { AA_RATIO, contrastOf, contrastRatio, fixColorForContrast, nextFixLevel, wcagLevels } from "./contrast";

function present<T>(value: T | null): T {
  if (value === null) throw new Error("expected a non-null value");
  return value;
}

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

describe("contrast ratio — the SPEC", () => {
  test("black on white is 21:1", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 1);
  });
  test("identical colors are 1:1", () => {
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5);
  });
  test("symmetric", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(contrastRatio(WHITE, BLACK), 5);
  });
});

describe("wcag levels", () => {
  test("grading", () => {
    expect(wcagLevels(21)).toEqual({ AA: true, AAA: true });
    expect(wcagLevels(5)).toEqual({ AA: true, AAA: false });
    expect(wcagLevels(3)).toEqual({ AA: false, AAA: false });
  });
  test("nextFixLevel", () => {
    expect(nextFixLevel({ AA: false, AAA: false })).toBe("AA");
    expect(nextFixLevel({ AA: true, AAA: false })).toBe("AAA");
    expect(nextFixLevel({ AA: true, AAA: true })).toBeNull();
  });
});

describe("fixColorForContrast", () => {
  const white: Rgba = { r: 255, g: 255, b: 255, a: 1 };

  test("returns null when the color already passes", () => {
    const black = present(parseColor("#000000"));
    expect(fixColorForContrast(black, white, AA_RATIO)).toBeNull();
  });

  test("nudges a mid-tone until it clears AA against white", () => {
    const midGray = present(parseColor("#999999"));
    const fixed = fixColorForContrast(midGray, white, AA_RATIO);
    expect(fixed).not.toBeNull();
    expect(contrastOf(present(fixed), white)).toBeGreaterThanOrEqual(AA_RATIO);
  });

  test("keeps alpha through the fix", () => {
    const translucent: Hsva = { h: 250, s: 40, v: 90, a: 0.6 };
    const fixed = present(fixColorForContrast(translucent, white, AA_RATIO));
    expect(fixed.a).toBeCloseTo(0.6, 5);
  });
});
