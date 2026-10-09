"use client";

import type { ChartTooltipContent, ChartValue } from "@tanstack/charts";
import {
  type ChartTooltipBodyRenderContext,
  Chart as TanStackChart,
  type ChartProps as TanStackChartProps,
} from "@tanstack/charts/react/tooltip";
import { type ComponentProps, type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react";
import type { ChartKnobStyle } from "@/components/control-ui/knob-contracts/chart-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { readDurationMs } from "@/components/control-ui/lib/motion";
import { CHART_COLORS, type ChartColor, chartColor } from "@/components/control-ui/ui/chart-colors";
import type { ChartFill } from "@/components/control-ui/ui/chart-series";

const NON_ID_CHARACTERS = /[^\w-]/g;

type ChartStyle = CSSProperties & ChartKnobStyle;

export type ChartRootProps = Omit<ComponentProps<"div">, "style"> & { style?: ChartStyle };

export function Chart({ className, style, ...props }: ChartRootProps) {
  return <div data-control-ui="chart" data-control-family="chart" data-slot="root" className={cn(className)} style={style} {...props} />;
}

export type ChartPlotProps<TDatum, TXValue extends ChartValue = ChartValue, TYValue extends ChartValue = ChartValue> = Omit<
  TanStackChartProps<TDatum, TXValue, TYValue>,
  "style" | "className"
> & {
  className?: string;
  style?: ChartStyle;
  children?: ReactNode;
};

type ChartPatternStyle = Record<`--_cui-chart-hatch-${ChartColor}` | "--_cui-chart-fade", string>;

type ChartSwatchStyle = CSSProperties & { "--_cui-chart-swatch": string };

function chartPatternStyle(id: string): ChartPatternStyle {
  return {
    "--_cui-chart-hatch-blue": `url(#${id}-hatch-blue)`,
    "--_cui-chart-hatch-purple": `url(#${id}-hatch-purple)`,
    "--_cui-chart-hatch-pink": `url(#${id}-hatch-pink)`,
    "--_cui-chart-hatch-orange": `url(#${id}-hatch-orange)`,
    "--_cui-chart-hatch-green": `url(#${id}-hatch-green)`,
    "--_cui-chart-hatch-yellow": `url(#${id}-hatch-yellow)`,
    "--_cui-chart-hatch-red": `url(#${id}-hatch-red)`,
    "--_cui-chart-hatch-neutral": `url(#${id}-hatch-neutral)`,
    "--_cui-chart-fade": `url(#${id}-fade)`,
  };
}

function ChartPatterns({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="patterns"
      width="0"
      height="0"
      className="absolute size-0 overflow-hidden"
    >
      <defs>
        {CHART_COLORS.map((color) => (
          <pattern key={color} id={`${id}-hatch-${color}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect
              data-control-ui="chart"
              data-control-family="chart"
              data-slot="hatch-tint"
              width="6"
              height="6"
              fill={chartColor(color)}
            />
            <rect
              data-control-ui="chart"
              data-control-family="chart"
              data-slot="hatch-stripe"
              width="2"
              height="6"
              fill={chartColor(color)}
            />
          </pattern>
        ))}
        <linearGradient id={`${id}-fade-gradient`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(1 0 0)" />
          <stop offset="1" stopColor="oklch(1 0 0)" stopOpacity="0.15" />
        </linearGradient>
        <mask id={`${id}-fade`} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${id}-fade-gradient)`} />
        </mask>
      </defs>
    </svg>
  );
}

function renderChartTooltipBody<TDatum, TXValue extends ChartValue, TYValue extends ChartValue>(
  context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>,
) {
  return <ChartTooltipBody content={context.content} />;
}

export function ChartPlot<TDatum, TXValue extends ChartValue = ChartValue, TYValue extends ChartValue = ChartValue>({
  className,
  style,
  children,
  ...props
}: ChartPlotProps<TDatum, TXValue, TYValue>) {
  const patternId = `cui-chart-${useId().replace(NON_ID_CHARACTERS, "")}`;
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = plotRef.current;
    if (!node) return;
    let settleTimer: number | undefined;
    const observer = new ResizeObserver(() => {
      node.dataset.resizing = "";
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(
        () => {
          delete node.dataset.resizing;
        },
        readDurationMs(node, "--duration-fast"),
      );
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(settleTimer);
    };
  }, []);

  useEffect(() => {
    const node = plotRef.current;
    if (!node) return;
    let enterTimer: number | undefined;
    const observer = new MutationObserver((records) => {
      const tooltipShown = records.some(
        (record) =>
          record.oldValue !== null &&
          record.target instanceof HTMLElement &&
          record.target.classList.contains("ts-chart-tooltip") &&
          !record.target.hidden,
      );
      if (!tooltipShown) return;
      node.dataset.tooltipEntering = "";
      clearTimeout(enterTimer);
      enterTimer = window.setTimeout(
        () => {
          delete node.dataset.tooltipEntering;
        },
        readDurationMs(node, "--duration-fast"),
      );
    });
    observer.observe(node, { subtree: true, attributeFilter: ["hidden"], attributeOldValue: true });
    return () => {
      observer.disconnect();
      clearTimeout(enterTimer);
    };
  }, []);

  return (
    <div
      ref={plotRef}
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="plot"
      data-focus-ring="within"
      className={cn(className)}
      style={{ ...chartPatternStyle(patternId), ...style }}
    >
      <ChartPatterns id={patternId} />
      <TanStackChart renderTooltipBody={renderChartTooltipBody} {...props} />
      {children}
    </div>
  );
}

export function ChartCenter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="center"
      className={cn("pointer-events-none absolute inset-0 grid place-content-center text-center", className)}
      {...props}
    />
  );
}

export function ChartLegend({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="legend"
      className={cn("text-label text-muted-foreground", className)}
      {...props}
    />
  );
}

export type ChartLegendItemProps = Omit<ComponentProps<"li">, "color"> & {
  color: ChartColor;
  fill?: ChartFill;
  hidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
};

function ChartSwatch({ color }: { color: string }) {
  const style: ChartSwatchStyle = { "--_cui-chart-swatch": color };
  return <span aria-hidden="true" data-control-ui="chart" data-control-family="chart" data-slot="swatch" style={style} />;
}

export function ChartLegendItem({
  color,
  fill = "solid",
  hidden = false,
  onHiddenChange,
  children,
  className,
  style,
  ...props
}: ChartLegendItemProps) {
  const legendStyle: ChartSwatchStyle = { "--_cui-chart-swatch": chartColor(color), ...style };
  const content = (
    <>
      <span aria-hidden="true" data-control-ui="chart" data-control-family="chart" data-slot="swatch" />
      {children}
    </>
  );
  return (
    <li
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="legend-item"
      data-fill={fill}
      data-hidden={hidden ? "true" : undefined}
      className={cn(className)}
      style={legendStyle}
      {...props}
    >
      {onHiddenChange ? (
        <button
          type="button"
          data-control-ui="chart"
          data-control-family="chart"
          data-slot="legend-toggle"
          aria-pressed={!hidden}
          onClick={() => onHiddenChange(!hidden)}
        >
          {content}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1.5">{content}</span>
      )}
    </li>
  );
}

export type ChartTooltipBodyProps = Omit<ComponentProps<"div">, "content"> & { content: string | ChartTooltipContent };

export function ChartTooltipBody({ content, className, ...props }: ChartTooltipBodyProps) {
  return (
    <div
      data-control-ui="chart"
      data-control-family="chart"
      data-slot="tooltip"
      className={cn("grid min-w-32 gap-1.5", className)}
      {...props}
    >
      {typeof content === "string" ? (
        <p className="text-label">{content}</p>
      ) : (
        <>
          {content.title ? (
            <p data-control-ui="chart" data-control-family="chart" data-slot="tooltip-title" className="font-medium text-label">
              {content.title}
            </p>
          ) : null}
          {content.rows.map((row) => (
            <div
              key={row.label}
              data-control-ui="chart"
              data-control-family="chart"
              data-slot="tooltip-row"
              data-active={row.active ? "true" : undefined}
              className="flex items-center gap-2 text-label"
            >
              <ChartSwatch color={row.color ?? "currentColor"} />
              <span className={row.active ? undefined : "text-muted-foreground"}>{row.label}</span>
              <span className="ms-auto font-medium tabular-nums">{row.value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
