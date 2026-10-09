import {
  type ChartLinearGradient,
  type ChartTooltipContentContext,
  type MarkRenderContext,
  ruleX,
  ruleY,
  type SceneNode,
  text,
} from "@tanstack/charts";
import { decorative } from "@tanstack/charts/mark/decorative";
import { tooltip } from "@tanstack/charts/tooltip";
import { type ChartColor, chartColor } from "@/components/control-ui/ui/chart-colors";
import type { ChartFill, ChartSeriesRow, ChartXValue } from "@/components/control-ui/ui/chart-series";

type AnyChartMark = Parameters<typeof decorative>[0];

export type ChartPart = "area" | "area-hatched" | "line" | "dot" | "reference";

type SceneNodesTransform = (nodes: readonly SceneNode[], renderContext: MarkRenderContext) => SceneNode[];

function withSceneNodes<TMark extends AnyChartMark>(mark: TMark, transform: SceneNodesTransform): TMark {
  return {
    ...mark,
    initialize(context) {
      const initialized = mark.initialize(context);
      const { resolveLayout } = initialized;
      return {
        ...initialized,
        render: (renderContext) => {
          const scene = initialized.render(renderContext);
          return { ...scene, nodes: transform(scene.nodes, renderContext) };
        },
        resolveLayout: resolveLayout
          ? (layoutContext) => {
              const layout = resolveLayout(layoutContext);
              return {
                ...layout,
                render: (renderContext) => {
                  const scene = layout.render(renderContext);
                  return { ...scene, nodes: transform(scene.nodes, renderContext) };
                },
              };
            }
          : undefined,
      };
    },
  };
}

function withClass<TNode extends SceneNode>(node: TNode, className: string): TNode {
  return { ...node, className: node.className ? `${node.className} ${className}` : className };
}

export function chartPart<TMark extends AnyChartMark>(mark: TMark, ...parts: ChartPart[]): TMark {
  const partClass = parts.map((part) => `cui-chart-${part}`).join(" ");
  return withSceneNodes(mark, (nodes) => nodes.map((node) => withClass(node, partClass)));
}

const BASELINE_TOLERANCE = 0.5;

function withNegativeBars(nodes: readonly SceneNode[], axis: "x" | "y", baseline: number): SceneNode[] {
  return nodes.map((node) => {
    if (node.kind === "group") return { ...node, children: withNegativeBars(node.children, axis, baseline) };
    if (node.kind !== "rect") return node;
    const negative = axis === "y" ? node.y >= baseline - BASELINE_TOLERANCE : node.x + node.width <= baseline + BASELINE_TOLERANCE;
    return negative ? withClass(node, "cui-chart-bar-negative") : node;
  });
}

export function chartBars<TMark extends AnyChartMark>(mark: TMark, axis: "x" | "y"): TMark {
  return withSceneNodes(mark, (nodes, renderContext) => {
    const valueScale = renderContext.scales[axis];
    const tagged = valueScale ? withNegativeBars(nodes, axis, valueScale.map(0)) : [...nodes];
    return tagged.map((node) => withClass(node, `cui-chart-bar-${axis}`));
  });
}

export type ChartGradientKind = "area" | "bar-y" | "bar-y-negative" | "bar-x" | "bar-x-negative" | "arc";

type GradientStop = [offset: number, opacity: number, lightnessLift?: number];

const BAR_STOPS: GradientStop[] = [
  [0, 1],
  [1, 0.55],
];

const GRADIENT_GEOMETRY: Record<ChartGradientKind, Omit<ChartLinearGradient, "id" | "stops"> & { stops: GradientStop[] }> = {
  area: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    stops: [
      [0, 0.5],
      [0.6, 0.12],
      [1, 0],
    ],
  },
  "bar-y": { x1: 0, y1: 0, x2: 0, y2: 1, stops: BAR_STOPS },
  "bar-y-negative": { x1: 0, y1: 1, x2: 0, y2: 0, stops: BAR_STOPS },
  "bar-x": { x1: 1, y1: 0, x2: 0, y2: 0, stops: BAR_STOPS },
  "bar-x-negative": { x1: 0, y1: 0, x2: 1, y2: 0, stops: BAR_STOPS },
  arc: {
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 1,
    stops: [
      [0, 1],
      [1, 1, 0.1],
    ],
  },
};

export function chartGradient(color: ChartColor, kind: ChartGradientKind): ChartLinearGradient {
  const { stops, ...geometry } = GRADIENT_GEOMETRY[kind];
  return {
    ...geometry,
    id: `cui-${kind}-${color}`,
    stops: stops.map(([offset, opacity, lightnessLift]) => ({
      offset,
      opacity,
      color: lightnessLift ? `oklch(from ${chartColor(color)} calc(l + ${lightnessLift}) c h)` : chartColor(color),
    })),
  };
}

export function chartGradients(colors: Iterable<ChartColor>, kind: ChartGradientKind): ChartLinearGradient[] {
  return [...new Set(colors)].map((color) => chartGradient(color, kind));
}

export function chartHatch(color: ChartColor): string {
  return `var(--_cui-chart-hatch-${color}, ${chartColor(color)})`;
}

export function chartFillPaint(color: ChartColor, fill: ChartFill, kind: ChartGradientKind): string {
  if (fill === "gradient") return `url(#cui-${kind}-${color})`;
  if (fill === "hatched") return chartHatch(color);
  return kind === "area" ? `oklch(from ${chartColor(color)} l c h / 0.2)` : chartColor(color);
}

type ChartBarPaintRow = { color: ChartColor; fill: ChartFill; value: number | null };

function barGradientKind(axis: "x" | "y", value: number | null): ChartGradientKind {
  return value !== null && value < 0 ? `bar-${axis}-negative` : `bar-${axis}`;
}

export function chartBarFill(row: ChartBarPaintRow, axis: "x" | "y"): string {
  return chartFillPaint(row.color, row.fill, barGradientKind(axis, row.value));
}

export function chartBarGradients(rows: readonly ChartBarPaintRow[], axis: "x" | "y"): ChartLinearGradient[] {
  const gradients = new Map<string, ChartLinearGradient>();
  for (const row of rows) {
    if (row.fill !== "gradient") continue;
    const gradient = chartGradient(row.color, barGradientKind(axis, row.value));
    gradients.set(gradient.id, gradient);
  }
  return [...gradients.values()];
}

export function chartOutline(color: ChartColor, fill: ChartFill): string {
  return fill === "hatched" ? chartColor(color) : "none";
}

export function quietAxis<TValue>(format: (value: TValue) => string) {
  return { line: false, ticks: { line: false, padding: 8, format } } as const;
}

export const quietGrid = { strokeDasharray: "3 3" } as const;

export const dimUnfocused = [{ when: { focus: "unmatched" }, style: { opacity: 0.4 } }] as const;

export type ChartReference = { value: number; label?: string; color?: ChartColor };

export function chartReferenceMarks(references: readonly ChartReference[], axis: "x" | "y", anchor: ChartXValue | undefined) {
  if (references.length === 0) return [];
  const paint = {
    strokeDasharray: "4 4",
    strokeOpacity: 0.7,
    stroke: (reference: ChartReference) => chartColor(reference.color ?? "neutral"),
  };
  const labelled = references.filter((reference) => reference.label);
  const labelPaint = {
    text: "label",
    fill: (reference: ChartReference) => chartColor(reference.color ?? "neutral"),
    fontSize: 11,
  } as const;
  const rules = axis === "y" ? ruleY(references, { y: "value", ...paint }) : ruleX(references, { x: "value", ...paint });
  const marks = [decorative(chartPart(rules, "reference"))];
  if (labelled.length === 0 || anchor === undefined) return marks;
  const labels =
    axis === "y"
      ? text(labelled, { ...labelPaint, x: () => anchor, y: "value", anchor: "end", dy: -6 })
      : text(labelled, { ...labelPaint, x: "value", y: () => anchor, anchor: "start", dx: 6 });
  return [...marks, decorative(labels)];
}

type SeriesPoint = { key: string; datum: ChartSeriesRow };

export function seriesTooltip(
  seriesLabels: readonly string[],
  formatX: (value: ChartXValue) => string,
  formatValue: (value: number) => string,
) {
  const seriesRank = (point: SeriesPoint) => seriesLabels.indexOf(point.datum.series);
  return {
    use: tooltip,
    content: (points: readonly SeriesPoint[], context: ChartTooltipContentContext) => ({
      title: points[0] ? formatX(points[0].datum.x) : undefined,
      rows: [...points]
        .sort((left, right) => seriesRank(left) - seriesRank(right))
        .flatMap((point) =>
          point.datum.value === null
            ? []
            : {
                label: point.datum.series,
                value: formatValue(point.datum.value),
                color: chartColor(point.datum.color),
                active: point.key === context.primaryPoint?.key,
              },
        ),
    }),
  };
}
