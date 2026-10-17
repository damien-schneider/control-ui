import { describe, expect, test } from "bun:test";
import { elapsedIsoDuration, formatElapsed } from "./agent-run-clock";

describe("formatElapsed", () => {
  test("shows minutes and seconds under an hour, hours past it", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(59_999)).toBe("0:59");
    expect(formatElapsed(60_000)).toBe("1:00");
    expect(formatElapsed(3_599_000)).toBe("59:59");
    expect(formatElapsed(3_600_000)).toBe("1:00:00");
  });

  test("clamps a negative span to zero", () => {
    expect(formatElapsed(-5_000)).toBe("0:00");
  });
});

describe("elapsedIsoDuration", () => {
  test("emits a machine-readable duration for <time dateTime>", () => {
    expect(elapsedIsoDuration(102_000)).toBe("PT1M42S");
    expect(elapsedIsoDuration(3_600_000)).toBe("PT1H0S");
  });
});
