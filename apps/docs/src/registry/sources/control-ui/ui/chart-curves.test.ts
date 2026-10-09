import { describe, expect, test } from "bun:test";
import { smoothCurve, stepCurve } from "./chart-curves";

type Point = [number, number];

type Cubic = { from: Point; c1: Point; c2: Point; to: Point };

const CUBIC = /C([-\d.e]+),([-\d.e]+) ([-\d.e]+),([-\d.e]+) ([-\d.e]+),([-\d.e]+)/g;
const MOVE = /^M([-\d.e]+),([-\d.e]+)/;

function cubicSegments(path: string): Cubic[] {
  const start = path.match(MOVE);
  let from: Point = [Number(start?.[1]), Number(start?.[2])];
  return [...path.matchAll(CUBIC)].map((match) => {
    const [c1x = 0, c1y = 0, c2x = 0, c2y = 0, x = 0, y = 0] = match.slice(1).map(Number);
    const segment: Cubic = { from, c1: [c1x, c1y], c2: [c2x, c2y], to: [x, y] };
    from = segment.to;
    return segment;
  });
}

function sampleY(segment: Cubic, t: number): number {
  const u = 1 - t;
  return u ** 3 * segment.from[1] + 3 * u ** 2 * t * segment.c1[1] + 3 * u * t ** 2 * segment.c2[1] + t ** 3 * segment.to[1];
}
describe("smoothCurve", () => {
  const points: Point[] = [
    [0, 0],
    [1, 10],
    [2, 10],
    [3, 0],
  ];

  test("never overshoots a flat or monotone run", () => {
    const segments = cubicSegments(smoothCurve.line(points));
    expect(segments).toHaveLength(3);
    for (const segment of segments) {
      for (const t of [0.25, 0.5, 0.75]) {
        const y = sampleY(segment, t);
        expect(y).toBeLessThanOrEqual(10);
        expect(y).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("passes through every input point", () => {
    const segments = cubicSegments(smoothCurve.line(points));
    expect([segments[0]?.from, ...segments.map((segment) => segment.to)]).toEqual(points);
  });

  test("closes an area through each bottom point", () => {
    const bottom: Point[] = [
      [0, 20],
      [1, 20],
      [2, 20],
      [3, 20],
    ];
    const path = smoothCurve.area(points, bottom);
    expect(path.endsWith("Z")).toBe(true);
    for (const [x, y] of bottom) expect(path).toContain(`${x},${y}`);
  });

  test("draws straight segments below three points", () => {
    expect(
      smoothCurve.line([
        [0, 0],
        [4, 2],
      ]),
    ).toBe("M0,0L4,2");
  });
});

describe("stepCurve", () => {
  test("holds each value until the next x", () => {
    expect(
      stepCurve.line([
        [0, 5],
        [2, 1],
        [4, 3],
      ]),
    ).toBe("M0,5H2V1H4V3");
  });
});
