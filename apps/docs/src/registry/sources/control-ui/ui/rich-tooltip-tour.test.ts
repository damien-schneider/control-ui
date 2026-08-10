import { describe, expect, test } from "bun:test";
import { stepAfter, stepBefore, tourPosition } from "./rich-tooltip-tour";

const steps = ["activity", "pull-requests", "sites"];

describe("tourPosition", () => {
  test("locates the active step", () => {
    expect(tourPosition(steps, "pull-requests")).toEqual({ index: 1, total: 3, isFirst: false, isLast: false });
  });

  test("marks the ends", () => {
    expect(tourPosition(steps, "activity").isFirst).toBe(true);
    expect(tourPosition(steps, "sites").isLast).toBe(true);
  });

  test("a finished tour is neither first nor last", () => {
    expect(tourPosition(steps, null)).toEqual({ index: -1, total: 3, isFirst: true, isLast: false });
  });

  test("an empty tour never reports a last step", () => {
    expect(tourPosition([], null).isLast).toBe(false);
  });
});

describe("step navigation", () => {
  test("advances until the tour ends", () => {
    expect(stepAfter(steps, 0)).toBe("pull-requests");
    expect(stepAfter(steps, 2)).toBeNull();
  });

  test("goes back but never past the first step", () => {
    expect(stepBefore(steps, 2)).toBe("pull-requests");
    expect(stepBefore(steps, 0)).toBe("activity");
  });

  test("a finished tour has nowhere to go", () => {
    expect(stepAfter(steps, -1)).toBeNull();
    expect(stepBefore(steps, -1)).toBeNull();
  });
});
