import { describe, expect, test } from "bun:test";
import { audioVisualizerBands, audioVisualizerHistory, audioVisualizerPointCount } from "./audio-visualizer-levels";

describe("audio visualizer levels", () => {
  test("keeps the most recent history and pads an incomplete window", () => {
    expect(audioVisualizerHistory([0.2, 0.4], 4).map(({ level }) => level)).toEqual([0, 0, 0.2, 0.4]);
    expect(audioVisualizerHistory([0.2, 0.4, 0.6], 2).map(({ level }) => level)).toEqual([0.4, 0.6]);
  });

  test("sanitizes invalid input and ignores retained signal while inactive", () => {
    expect(audioVisualizerHistory(new Float32Array([Number.NaN, -1, Number.POSITIVE_INFINITY, 2]), 4).map(({ level }) => level)).toEqual([
      0, 0, 0, 1,
    ]);
    expect(audioVisualizerHistory([1, 1], 2, false).map(({ level }) => level)).toEqual([0, 0]);
    expect(audioVisualizerBands([1, 1], 2, false).map(({ level }) => level)).toEqual([0, 0]);
  });

  test("resamples all frequency bands instead of truncating the low frequencies", () => {
    expect(audioVisualizerBands([1, 1, 0, 0], 2).map(({ level }) => level)).toEqual([1, 0]);
    expect(audioVisualizerBands([1, 0, 0], 2).map(({ level }) => level)).toEqual([2 / 3, 0]);
    expect(audioVisualizerBands([1, 0], 4).map(({ level }) => level)).toEqual([1, 1, 0, 0]);
  });

  test("mirrors low-frequency bands around the center for odd and even counts", () => {
    expect(audioVisualizerBands([1, 0.5, 0], 5, true, true).map(({ level }) => level)).toEqual([0, 0.5, 1, 0.5, 0]);
    expect(audioVisualizerBands([1, 0], 4, true, true).map(({ level }) => level)).toEqual([0, 1, 1, 0]);
  });

  test("bounds the rendering budget for invalid and oversized point counts", () => {
    expect(audioVisualizerPointCount(Number.NaN)).toBe(28);
    expect(audioVisualizerPointCount(-100)).toBe(1);
    expect(audioVisualizerPointCount(1000)).toBe(128);
  });
});
