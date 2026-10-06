import { describe, expect, test } from "bun:test";
import { formatGradient, type GradientValue, gradientColorAt } from "./gradient";

const BLUE_TO_YELLOW: GradientValue = {
  type: "linear",
  angle: 90,
  interpolation: "srgb",
  stops: [
    { id: "blue", position: 0, color: "#0000ff" },
    { id: "yellow", position: 1, color: "#ffff00" },
  ],
};

describe("formatGradient", () => {
  test("linear with angle", () => {
    expect(formatGradient(BLUE_TO_YELLOW)).toBe("linear-gradient(90deg, #0000ff 0%, #ffff00 100%)");
  });
  test("radial ignores angle", () => {
    expect(formatGradient({ ...BLUE_TO_YELLOW, type: "radial", angle: 45 })).toBe("radial-gradient(circle, #0000ff 0%, #ffff00 100%)");
  });
  test("conic uses from angle", () => {
    expect(formatGradient({ ...BLUE_TO_YELLOW, type: "conic", angle: 30 })).toBe("conic-gradient(from 30deg, #0000ff 0%, #ffff00 100%)");
  });
  test("stops are sorted by position", () => {
    const shuffled = [
      { id: "black", position: 1, color: "#000" },
      { id: "gray", position: 0.5, color: "#888" },
      { id: "white", position: 0, color: "#fff" },
    ];
    expect(formatGradient({ ...BLUE_TO_YELLOW, angle: 0, stops: shuffled })).toBe("linear-gradient(0deg, #fff 0%, #888 50%, #000 100%)");
  });
  test("a perceptual space is named in every gradient type", () => {
    expect(formatGradient({ ...BLUE_TO_YELLOW, interpolation: "oklab" })).toBe("linear-gradient(90deg in oklab, #0000ff 0%, #ffff00 100%)");
    expect(formatGradient({ ...BLUE_TO_YELLOW, type: "radial", interpolation: "oklch" })).toBe(
      "radial-gradient(circle in oklch, #0000ff 0%, #ffff00 100%)",
    );
    expect(formatGradient({ ...BLUE_TO_YELLOW, type: "conic", interpolation: "oklab" })).toBe(
      "conic-gradient(from 90deg in oklab, #0000ff 0%, #ffff00 100%)",
    );
  });
});

describe("gradientColorAt", () => {
  test("blue to yellow passes through gray in srgb and stays chromatic in oklab and oklch", () => {
    expect(gradientColorAt(BLUE_TO_YELLOW, 0.5)).toBe("#808080");
    expect(gradientColorAt({ ...BLUE_TO_YELLOW, interpolation: "oklab" }, 0.5)).toBe("#6cabc7");
    expect(gradientColorAt({ ...BLUE_TO_YELLOW, interpolation: "oklch" }, 0.5)).toBe("#00baae");
  });
  test("beyond the outermost stops the nearest stop color holds", () => {
    const inset = {
      ...BLUE_TO_YELLOW,
      stops: [
        { id: "blue", position: 0.2, color: "#0000ff" },
        { id: "yellow", position: 0.8, color: "#ffff00" },
      ],
    };
    expect(gradientColorAt(inset, 0)).toBe("#0000ff");
    expect(gradientColorAt(inset, 1)).toBe("#ffff00");
  });
});
