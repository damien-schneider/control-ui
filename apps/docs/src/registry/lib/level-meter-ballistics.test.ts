import { describe, expect, test } from "bun:test";
import {
  advanceLevelMeterReading,
  LEVEL_METER_PEAK_HOLD_MS,
  LEVEL_METER_RELEASE_DB_PER_SECOND,
  levelMeterFraction,
  levelMeterReadingSettled,
} from "./level-meter-ballistics";

const scale = { minDb: -60, maxDb: 0 };
const silence = { levelDb: -60, peakDb: -60, peakHeldUntilMs: 0 };

describe("level meter ballistics", () => {
  test("maps decibels onto the scale and pins silence, overs, and invalid input to its ends", () => {
    expect(levelMeterFraction(-30, scale)).toBe(0.5);
    expect(levelMeterFraction(Number.NEGATIVE_INFINITY, scale)).toBe(0);
    expect(levelMeterFraction(Number.NaN, scale)).toBe(0);
    expect(levelMeterFraction(6, scale)).toBe(1);
    expect(levelMeterFraction(-30, { minDb: 0, maxDb: 0 })).toBe(0);
  });

  test("rises to a louder level at once and falls at the release rate", () => {
    const loud = advanceLevelMeterReading(silence, -6, 16, 0, scale);
    expect(loud.levelDb).toBe(-6);

    const halfSecondLater = advanceLevelMeterReading(loud, Number.NEGATIVE_INFINITY, 500, 500, scale);
    expect(halfSecondLater.levelDb).toBe(-6 - LEVEL_METER_RELEASE_DB_PER_SECOND / 2);
  });

  test("holds the peak while the level falls, then releases it down to the level", () => {
    const loud = advanceLevelMeterReading(silence, -6, 16, 0, scale);
    const holding = advanceLevelMeterReading(loud, -40, 500, LEVEL_METER_PEAK_HOLD_MS - 1, scale);
    expect(holding.peakDb).toBe(-6);
    expect(holding.levelDb).toBeLessThan(-6);

    const released = advanceLevelMeterReading(holding, -40, 500, LEVEL_METER_PEAK_HOLD_MS + 500, scale);
    expect(released.peakDb).toBe(-6 - LEVEL_METER_RELEASE_DB_PER_SECOND / 2);
  });

  test("settles only once the level reaches its target and the peak has merged into it", () => {
    let reading = advanceLevelMeterReading(silence, -6, 16, 0, scale);
    expect(levelMeterReadingSettled(reading, -6, scale)).toBe(true);

    let nowMs = 0;
    while (!levelMeterReadingSettled(reading, Number.NEGATIVE_INFINITY, scale)) {
      nowMs += 16;
      reading = advanceLevelMeterReading(reading, Number.NEGATIVE_INFINITY, 16, nowMs, scale);
    }
    expect(reading).toMatchObject({ levelDb: -60, peakDb: -60 });
    expect(nowMs).toBeGreaterThan(LEVEL_METER_PEAK_HOLD_MS);
  });
});
