import { describe, expect, test } from "bun:test";

import type { ContextSegment } from "@/components/control-ui/context-model";
import { deriveContextModel } from "./context-model";

describe("deriveContextModel", () => {
  test("derives ordered usage geometry below the limit", () => {
    const segments = [
      { id: "first", label: "First", tokens: 25, kind: "system" },
      { id: "second", label: "Second", tokens: 15, kind: "message" },
    ] satisfies ContextSegment[];

    expect(deriveContextModel(segments, 100)).toEqual({
      segments: [
        { segment: segments[0], kind: "system", tokens: 25, start: 0, width: 25, ratio: 0.25 },
        { segment: segments[1], kind: "message", tokens: 15, start: 25, width: 15, ratio: 0.15 },
      ],
      usedTokens: 40,
      maxTokens: 100,
      remainingTokens: 60,
      overageTokens: 0,
      ratio: 0.4,
      domain: 100,
      limitPosition: 100,
      status: "normal",
    });
  });

  test("preserves uncapped over-limit usage and normalizes geometry to the used total", () => {
    const segments = [
      { id: "first", label: "First", tokens: 80 },
      { id: "second", label: "Second", tokens: 40, kind: "tool" },
    ] satisfies ContextSegment[];
    const model = deriveContextModel(segments, 100);

    expect(model).toMatchObject({
      usedTokens: 120,
      maxTokens: 100,
      remainingTokens: 0,
      overageTokens: 20,
      ratio: 1.2,
      domain: 120,
      status: "over-limit",
    });
    expect(model.limitPosition).toBeCloseTo(83.33333333333334);
    expect(model.segments[0]).toMatchObject({ kind: "other", tokens: 80, start: 0, ratio: 0.8 });
    expect(model.segments[0]?.width).toBeCloseTo(66.66666666666666);
    expect(model.segments[1]).toMatchObject({ kind: "tool", tokens: 40, ratio: 0.4 });
    expect(model.segments[1]?.start).toBeCloseTo(66.66666666666666);
    expect(model.segments[1]?.width).toBeCloseTo(33.33333333333333);
  });

  test("normalizes invalid values and limits without emitting non-finite geometry", () => {
    const segments = [
      { id: "negative", label: "Negative", tokens: -10 },
      { id: "nan", label: "NaN", tokens: Number.NaN, kind: "cache" },
      { id: "infinite", label: "Infinite", tokens: Number.POSITIVE_INFINITY },
    ] satisfies ContextSegment[];

    for (const limit of [undefined, 0, Number.NaN, Number.NEGATIVE_INFINITY]) {
      const model = deriveContextModel(segments, limit);
      expect(model).toEqual({
        segments: [
          { segment: segments[0], kind: "other", tokens: 0, start: 0, width: 0, ratio: null },
          { segment: segments[1], kind: "cache", tokens: 0, start: 0, width: 0, ratio: null },
          { segment: segments[2], kind: "other", tokens: 0, start: 0, width: 0, ratio: null },
        ],
        usedTokens: 0,
        maxTokens: null,
        remainingTokens: null,
        overageTokens: 0,
        ratio: null,
        domain: 1,
        limitPosition: null,
        status: "unavailable",
      });
      const geometry = model.segments.flatMap(({ start, width }) => [start, width]);
      expect(geometry.every(Number.isFinite)).toBe(true);
    }
  });

  test("keeps an empty limited window fully available", () => {
    expect(deriveContextModel([], 100)).toEqual({
      segments: [],
      usedTokens: 0,
      maxTokens: 100,
      remainingTokens: 100,
      overageTokens: 0,
      ratio: 0,
      domain: 100,
      limitPosition: 100,
      status: "normal",
    });
  });

  test("does not mutate caller-owned arrays or segment objects", () => {
    const segments = [
      { id: "first", label: "First", tokens: 25 },
      { id: "second", label: "Second", tokens: 15, kind: "source" },
    ] satisfies ContextSegment[];
    const before = segments.map((segment) => ({ ...segment }));

    const first = deriveContextModel(segments, 100);
    const second = deriveContextModel(segments, 100);

    expect(segments).toEqual(before);
    expect(first).toEqual(second);
    expect(first.segments[0]?.segment).toBe(segments[0]);
    expect(first.segments[1]?.segment).toBe(segments[1]);
  });

  test("rejects duplicate caller-owned ids instead of merging buckets", () => {
    const segments = [
      { id: "duplicate", label: "First", tokens: 25 },
      { id: "duplicate", label: "Second", tokens: 15 },
    ] satisfies ContextSegment[];

    expect(() => deriveContextModel(segments, 100)).toThrow('Context segment ids must be unique: "duplicate".');
  });
});
