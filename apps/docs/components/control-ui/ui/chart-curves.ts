import type { ChartCurve } from "@tanstack/charts";

type Point = readonly [number, number];

export type ChartCurveName = "smooth" | "linear" | "step";

function monotoneTangents(points: readonly Point[]): number[] {
  const tangents = points.map(() => 0);
  const last = points.length - 1;
  for (let index = 1; index < last; index += 1) {
    const [x0, y0] = points[index - 1] ?? [0, 0];
    const [x1, y1] = points[index] ?? [0, 0];
    const [x2, y2] = points[index + 1] ?? [0, 0];
    const h0 = x1 - x0;
    const h1 = x2 - x1;
    const s0 = h0 ? (y1 - y0) / h0 : 0;
    const s1 = h1 ? (y2 - y1) / h1 : 0;
    const weightedSlope = (s0 * h1 + s1 * h0) / (h0 + h1);
    tangents[index] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(weightedSlope)) || 0;
  }
  if (last > 0) {
    tangents[0] = endTangent(points[0], points[1], tangents[1] ?? 0);
    tangents[last] = endTangent(points[last - 1], points[last], tangents[last - 1] ?? 0);
  }
  return tangents;
}

function endTangent(from: Point | undefined, to: Point | undefined, neighbourTangent: number): number {
  if (!(from && to)) return neighbourTangent;
  const h = to[0] - from[0];
  return h ? ((3 * (to[1] - from[1])) / h - neighbourTangent) / 2 : neighbourTangent;
}

function monotoneSegments(points: readonly Point[]): string[] {
  if (points.length < 3) return points.slice(1).map(([x, y]) => `L${x},${y}`);
  const tangents = monotoneTangents(points);
  return points.slice(1).map(([x1, y1], index) => {
    const [x0, y0] = points[index] ?? [x1, y1];
    const t0 = tangents[index] ?? 0;
    const t1 = tangents[index + 1] ?? 0;
    const dx = (x1 - x0) / 3;
    return `C${x0 + dx},${y0 + dx * t0} ${x1 - dx},${y1 - dx * t1} ${x1},${y1}`;
  });
}

function reversedMonotoneSegments(points: readonly Point[]): string[] {
  if (points.length < 3)
    return points
      .slice(0, -1)
      .map(([x, y]) => `L${x},${y}`)
      .reverse();
  const tangents = monotoneTangents(points);
  return points
    .slice(1)
    .map(([x1, y1], index) => {
      const [x0, y0] = points[index] ?? [x1, y1];
      const t0 = tangents[index] ?? 0;
      const t1 = tangents[index + 1] ?? 0;
      const dx = (x1 - x0) / 3;
      return `C${x1 - dx},${y1 - dx * t1} ${x0 + dx},${y0 + dx * t0} ${x0},${y0}`;
    })
    .reverse();
}

function closedArea(top: readonly Point[], bottom: readonly Point[], topSegments: string[], bottomSegments: string[]): string {
  const [firstX, firstY] = top[0] ?? [0, 0];
  const [lastX, lastY] = bottom.at(-1) ?? top.at(-1) ?? [0, 0];
  return `M${firstX},${firstY}${topSegments.join("")}L${lastX},${lastY}${bottomSegments.join("")}Z`;
}

export const smoothCurve: ChartCurve = {
  line(points) {
    if (points.length === 0) return "";
    const [x, y] = points[0] ?? [0, 0];
    return `M${x},${y}${monotoneSegments(points).join("")}`;
  },
  area(top, bottom) {
    if (top.length === 0) return "";
    return closedArea(top, bottom, monotoneSegments(top), reversedMonotoneSegments(bottom));
  },
};

function stepSegments(points: readonly Point[]): string[] {
  return points.slice(1).map(([x, y]) => `H${x}V${y}`);
}

function reversedStepSegments(points: readonly Point[]): string[] {
  return points
    .slice(0, -1)
    .map(([, y], index) => `V${y}H${points[index]?.[0] ?? 0}`)
    .reverse();
}

export const stepCurve: ChartCurve = {
  line(points) {
    if (points.length === 0) return "";
    const [x, y] = points[0] ?? [0, 0];
    return `M${x},${y}${stepSegments(points).join("")}`;
  },
  area(top, bottom) {
    if (top.length === 0) return "";
    return closedArea(top, bottom, stepSegments(top), reversedStepSegments(bottom));
  },
};

export function chartCurve(name: ChartCurveName): ChartCurve | undefined {
  if (name === "smooth") return smoothCurve;
  if (name === "step") return stepCurve;
  return undefined;
}
