export const LEVEL_METER_RELEASE_DB_PER_SECOND = 24;
export const LEVEL_METER_PEAK_HOLD_MS = 1000;

export type LevelMeterScale = { minDb: number; maxDb: number };

export type LevelMeterReading = { levelDb: number; peakDb: number; peakHeldUntilMs: number };

export function clampLevelDb(levelDb: number, { minDb, maxDb }: LevelMeterScale) {
  if (Number.isNaN(levelDb)) return minDb;
  return Math.min(maxDb, Math.max(minDb, levelDb));
}

export function levelMeterFraction(levelDb: number, scale: LevelMeterScale) {
  const span = scale.maxDb - scale.minDb;
  if (!(span > 0)) return 0;
  return (clampLevelDb(levelDb, scale) - scale.minDb) / span;
}

export function advanceLevelMeterReading(
  reading: LevelMeterReading,
  targetDb: number,
  elapsedMs: number,
  nowMs: number,
  scale: LevelMeterScale,
): LevelMeterReading {
  const target = clampLevelDb(targetDb, scale);
  const fallDb = (LEVEL_METER_RELEASE_DB_PER_SECOND * Math.max(0, elapsedMs)) / 1000;
  const levelDb = Math.max(target, reading.levelDb - fallDb);
  if (levelDb >= reading.peakDb) return { levelDb, peakDb: levelDb, peakHeldUntilMs: nowMs + LEVEL_METER_PEAK_HOLD_MS };
  const peakDb = nowMs < reading.peakHeldUntilMs ? reading.peakDb : Math.max(levelDb, reading.peakDb - fallDb);
  return { levelDb, peakDb, peakHeldUntilMs: reading.peakHeldUntilMs };
}

export function levelMeterReadingSettled(reading: LevelMeterReading, targetDb: number, scale: LevelMeterScale) {
  return reading.levelDb === clampLevelDb(targetDb, scale) && reading.peakDb === reading.levelDb;
}
