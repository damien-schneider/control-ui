"use client";

import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { ContextProps, ContextSegmentKind } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";
import { Button } from "@/components/control-ui/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/control-ui/ui/popover";
import { ScrollArea } from "@/components/control-ui/ui/scroll-area";
import type { ContextModel } from "./context-model";
import { deriveContextModel } from "./context-model";

type ContextValue = {
  model: ContextModel;
  modelName: string | undefined;
  numberFormatter: Intl.NumberFormat;
  percentageFormatter: Intl.NumberFormat;
};

const ContextValueContext = createContext<ContextValue | null>(null);

const kindClasses = {
  system: { graph: "fill-foreground/75", indicator: "bg-foreground/75" },
  tool: { graph: "fill-primary", indicator: "bg-primary" },
  message: { graph: "fill-primary/65", indicator: "bg-primary/65" },
  source: { graph: "fill-accent-foreground/65", indicator: "bg-accent-foreground/65" },
  reasoning: { graph: "fill-foreground/50", indicator: "bg-foreground/50" },
  cache: { graph: "fill-muted-foreground/55", indicator: "bg-muted-foreground/55" },
  other: { graph: "fill-border", indicator: "bg-border" },
} satisfies Record<ContextSegmentKind, { graph: string; indicator: string }>;

function useContextValue(): ContextValue {
  const context = useContext(ContextValueContext);
  if (!context) throw new Error("Context parts must be rendered inside <Context>.");
  return context;
}

export function Context({
  segments,
  maxTokens,
  model: modelName,
  locale,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: ContextProps) {
  const model = deriveContextModel(segments, maxTokens);
  const context = {
    model,
    modelName,
    numberFormatter: new Intl.NumberFormat(locale),
    percentageFormatter: new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    }),
  } satisfies ContextValue;

  return (
    <ContextValueContext.Provider value={context}>
      <div
        {...props}
        data-control-ui="context"
        data-slot="root"
        data-status={model.status}
        className={cn("inline-flex", skinSlot("context", "root", { status: model.status }), className)}
      >
        <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {children ?? (
            <>
              <ContextTrigger />
              <ContextContent />
            </>
          )}
        </Popover>
      </div>
    </ContextValueContext.Provider>
  );
}

export type ContextTriggerProps = ComponentProps<typeof Button>;

export function ContextTrigger({
  "aria-label": ariaLabel,
  variant = "surface",
  size = "sm",
  className,
  children,
  ...props
}: ContextTriggerProps) {
  const { model, numberFormatter, percentageFormatter } = useContextValue();
  const percentage = model.ratio === null ? null : percentageFormatter.format(model.ratio);
  const visualPercentage = Math.min(100, Math.max(0, (model.ratio ?? 0) * 100));
  const shortLabel = percentage === null ? "Context unavailable" : `${percentage} context`;
  const accessibleLabel =
    model.maxTokens === null
      ? `Context window: ${numberFormatter.format(model.usedTokens)} tokens used; limit unavailable`
      : `Context window: ${numberFormatter.format(model.usedTokens)} of ${numberFormatter.format(model.maxTokens)} tokens used (${percentage})${
          model.overageTokens > 0 ? `; ${numberFormatter.format(model.overageTokens)} tokens over limit` : ""
        }`;

  return (
    <span
      data-control-ui="context"
      data-slot="trigger"
      data-status={model.status}
      className={cn("relative inline-flex", skinSlot("context", "trigger", { status: model.status }))}
    >
      <Button
        {...props}
        render={<PopoverTrigger />}
        variant={variant}
        size={size}
        aria-label={ariaLabel ?? accessibleLabel}
        className={cn("group/context after:absolute after:-inset-1.5 after:content-['']", className)}
      >
        {children ?? (
          <>
            <svg
              data-control-ui="context"
              data-slot="trigger-indicator"
              data-status={model.status}
              viewBox="0 0 16 16"
              aria-hidden="true"
              className={cn("size-4 shrink-0 -rotate-90 fill-none", skinSlot("context", "trigger-indicator", { status: model.status }))}
            >
              <circle
                cx="8"
                cy="8"
                r="6.25"
                strokeWidth="1.5"
                className={model.status === "unavailable" ? "stroke-muted" : "stroke-border/70"}
              />
              {model.status !== "unavailable" ? (
                <circle
                  cx="8"
                  cy="8"
                  r="6.25"
                  pathLength="100"
                  strokeDasharray={`${visualPercentage} 100`}
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  className={model.status === "over-limit" ? "stroke-destructive-text" : "stroke-primary"}
                />
              ) : null}
            </svg>
            <span
              data-control-ui="context"
              data-slot="trigger-label"
              className={cn(
                "max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover/context:max-w-32 group-hover/context:opacity-100 group-focus-visible/context:max-w-32 group-focus-visible/context:opacity-100",
                skinSlot("context", "trigger-label", {}),
              )}
            >
              {shortLabel}
            </span>
          </>
        )}
      </Button>
    </span>
  );
}

export type ContextContentProps = ComponentProps<typeof PopoverContent>;

export function ContextContent({
  side = "top",
  align = "end",
  sideOffset = 8,
  collisionPadding = 16,
  padding = "none",
  className,
  children,
  ...props
}: ContextContentProps) {
  return (
    <PopoverContent
      {...props}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      padding={padding}
      className={cn("w-[min(28rem,calc(100vw-2rem))] overflow-hidden", className)}
    >
      <div data-control-ui="context" data-slot="content" className={cn("overflow-hidden", skinSlot("context", "content", {}))}>
        {children ?? (
          <>
            <ContextHeader />
            <ScrollArea maxHeight="min(36rem, calc(100dvh - 8rem))" lockAxis="x">
              <div className="grid gap-4 p-4">
                <ContextSummary />
                <ContextGraph />
                <ContextLegend />
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </PopoverContent>
  );
}

export type ContextHeaderProps = ComponentProps<"div">;

export function ContextHeader({ className, children, ...props }: ContextHeaderProps) {
  return (
    <div
      {...props}
      data-control-ui="context"
      data-slot="header"
      className={cn("flex items-start gap-3 border-b border-border p-4", skinSlot("context", "header", {}), className)}
    >
      {children ?? (
        <>
          <div className="min-w-0 flex-1">
            <ContextTitle />
            <ContextDescription />
          </div>
          <ContextClose />
        </>
      )}
    </div>
  );
}

export type ContextTitleProps = ComponentProps<typeof PopoverTitle>;

export function ContextTitle({ className, children, ...props }: ContextTitleProps) {
  return (
    <PopoverTitle {...props} className={cn("text-sm font-medium", className)}>
      {children ?? "Context window"}
    </PopoverTitle>
  );
}

export type ContextDescriptionProps = ComponentProps<typeof PopoverDescription>;

export function ContextDescription({ className, children, ...props }: ContextDescriptionProps) {
  const { modelName } = useContextValue();
  return (
    <PopoverDescription {...props} className={cn("text-caption text-muted-foreground", className)}>
      {children ?? modelName ?? "Token usage by context segment"}
    </PopoverDescription>
  );
}

export type ContextSummaryProps = ComponentProps<"div">;

export function ContextSummary({ className, children, ...props }: ContextSummaryProps) {
  const { model, numberFormatter, percentageFormatter } = useContextValue();
  const percentage = model.ratio === null ? null : percentageFormatter.format(model.ratio);

  return (
    <div
      {...props}
      data-control-ui="context"
      data-slot="summary"
      data-status={model.status}
      className={cn(
        "flex items-baseline justify-between gap-3 text-sm",
        skinSlot("context", "summary", { status: model.status }),
        className,
      )}
    >
      {children ?? (
        <>
          <span>{percentage === null ? `${numberFormatter.format(model.usedTokens)} tokens used` : `${percentage} used`}</span>
          <span className="tabular-nums text-muted-foreground">
            {model.maxTokens === null
              ? "Limit unavailable"
              : `${numberFormatter.format(model.usedTokens)} / ${numberFormatter.format(model.maxTokens)} tokens`}
          </span>
        </>
      )}
    </div>
  );
}

export type ContextGraphProps = Omit<ComponentProps<"svg">, "children">;

export function ContextGraph({ className, ...props }: ContextGraphProps) {
  const { model } = useContextValue();

  return (
    <svg
      {...props}
      data-control-ui="context"
      data-slot="graph"
      data-status={model.status}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-2.5 w-full overflow-hidden rounded-full", skinSlot("context", "graph", { status: model.status }), className)}
    >
      <rect
        data-control-ui="context"
        data-slot="track"
        x="0"
        y="0"
        width="100"
        height="10"
        rx="5"
        className={cn("fill-muted", skinSlot("context", "track", {}))}
      />
      {model.segments.map((segment) => (
        <rect
          key={segment.segment.id}
          data-control-ui="context"
          data-slot="segment"
          data-kind={segment.kind}
          x={segment.start}
          y="0"
          width={segment.width}
          height="10"
          className={cn(kindClasses[segment.kind].graph, skinSlot("context", "segment", { kind: segment.kind }))}
        />
      ))}
      {model.status === "over-limit" && model.limitPosition !== null ? (
        <>
          <rect x={model.limitPosition} y="0" width={100 - model.limitPosition} height="10" className="fill-destructive-text/22" />
          <line
            data-control-ui="context"
            data-slot="limit-marker"
            x1={model.limitPosition}
            x2={model.limitPosition}
            y1="0"
            y2="10"
            vectorEffect="non-scaling-stroke"
            className={cn("stroke-destructive-text", skinSlot("context", "limit-marker", {}))}
          />
        </>
      ) : null}
    </svg>
  );
}

export type ContextLegendProps = ComponentProps<"ul">;

type ContextLegendRowProps = {
  kind: ContextSegmentKind;
  label: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  indicatorClassName: string;
};

function ContextLegendRow({ kind, label, description, value, indicatorClassName }: ContextLegendRowProps) {
  return (
    <li
      data-control-ui="context"
      data-slot="legend-item"
      data-kind={kind}
      className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-2", skinSlot("context", "legend-item", { kind }))}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span
          data-control-ui="context"
          data-slot="legend-indicator"
          data-kind={kind}
          aria-hidden="true"
          className={cn("mt-1 size-2.5 shrink-0 rounded-full", indicatorClassName, skinSlot("context", "legend-indicator", { kind }))}
        />
        <div className="min-w-0">
          <div className="text-sm">{label}</div>
          {description !== undefined && description !== null ? (
            <div className="text-caption text-muted-foreground">{description}</div>
          ) : null}
        </div>
      </div>
      {value !== undefined && value !== null ? (
        <span
          data-control-ui="context"
          data-slot="legend-value"
          className={cn("text-caption tabular-nums text-muted-foreground", skinSlot("context", "legend-value", {}))}
        >
          {value}
        </span>
      ) : null}
    </li>
  );
}

export function ContextLegend({ className, children, ...props }: ContextLegendProps) {
  const { model, numberFormatter, percentageFormatter } = useContextValue();

  return (
    <ul
      {...props}
      data-control-ui="context"
      data-slot="legend"
      className={cn("divide-y divide-border/60", skinSlot("context", "legend", {}), className)}
    >
      {children ?? (
        <>
          {model.segments.map((segment) => (
            <ContextLegendRow
              key={segment.segment.id}
              kind={segment.kind}
              label={segment.segment.label}
              description={segment.segment.description}
              indicatorClassName={kindClasses[segment.kind].indicator}
              value={`${numberFormatter.format(segment.tokens)} tokens${
                segment.ratio === null ? "" : ` · ${percentageFormatter.format(segment.ratio)}`
              }`}
            />
          ))}
          {model.status === "normal" && model.remainingTokens !== null ? (
            <ContextLegendRow
              kind="other"
              label="Available"
              indicatorClassName="bg-muted"
              value={`${numberFormatter.format(model.remainingTokens)} tokens · ${percentageFormatter.format(
                model.remainingTokens / (model.maxTokens ?? 1),
              )}`}
            />
          ) : null}
          {model.status === "over-limit" ? (
            <ContextLegendRow
              kind="other"
              label="Over limit"
              indicatorClassName="bg-destructive-text"
              value={`${numberFormatter.format(model.overageTokens)} tokens over limit`}
            />
          ) : null}
          {model.status === "unavailable" ? (
            <ContextLegendRow kind="other" label="Limit unavailable" indicatorClassName="bg-muted" />
          ) : null}
        </>
      )}
    </ul>
  );
}

export type ContextCloseProps = ComponentProps<typeof Button>;

export function ContextClose({
  variant = "ghost",
  size = "xs",
  iconOnly = true,
  "aria-label": ariaLabel = "Close context window",
  className,
  children,
  ...props
}: ContextCloseProps) {
  return (
    <Button
      {...props}
      render={<PopoverClose />}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      aria-label={ariaLabel}
      className={cn("ml-auto", className)}
    >
      {children ?? <X aria-hidden="true" className="size-4" />}
    </Button>
  );
}
