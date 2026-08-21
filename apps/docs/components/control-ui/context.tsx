"use client";

import { X } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { ContextSegment, ContextSegmentKind } from "@/components/control-ui/context-model";
import type { OpenChangeEventDetails } from "@/components/control-ui/control-props";
import type { ButtonKnobStyle } from "@/components/control-ui/knob-contracts/button-knobs";
import type { ContextKnobStyle } from "@/components/control-ui/knob-contracts/context-knobs";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import { cn } from "@/components/control-ui/lib/cn";
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

export type ContextProps = Omit<ComponentProps<"div">, "children"> & {
  segments: readonly ContextSegment[];
  maxTokens?: number | null;
  model?: string;
  locale?: Intl.LocalesArgument;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, eventDetails: OpenChangeEventDetails) => void;
  children?: ReactNode;
} & { style?: CSSProperties & ContextKnobStyle };

type ContextStyleProps<Props, Style> = Omit<Props, "style"> & { style?: CSSProperties & Style };

type ContextValue = {
  model: ContextModel;
  modelName: string | undefined;
  numberFormatter: Intl.NumberFormat;
  percentageFormatter: Intl.NumberFormat;
};

const ContextValueContext = createContext<ContextValue | null>(null);

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
        data-control-family="context"
        data-slot="root"
        data-status={model.status}
        className={cn("inline-flex", className)}
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

export type ContextTriggerProps = ContextStyleProps<ComponentProps<typeof Button>, ButtonKnobStyle & ContextKnobStyle>;

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
      data-control-family="context"
      data-slot="trigger"
      data-status={model.status}
      className="relative inline-flex"
    >
      <Button
        data-context-trigger-button="true"
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
              data-control-family="context"
              data-slot="trigger-indicator"
              data-status={model.status}
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="size-4 shrink-0 -rotate-90"
            >
              <circle
                cx="8"
                cy="8"
                r="6.25"
                strokeWidth="1.5"
                data-control-ui="context"
                data-control-family="context"
                data-slot="trigger-track"
                data-status={model.status}
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
                  data-control-ui="context"
                  data-control-family="context"
                  data-slot="trigger-value"
                  data-status={model.status}
                />
              ) : null}
            </svg>
            <span
              data-control-ui="context"
              data-control-family="context"
              data-slot="trigger-label"
              className="max-w-0 overflow-hidden group-hover/context:max-w-32 group-focus-visible/context:max-w-32 group-data-[popup-open]/context:max-w-32"
            >
              {shortLabel}
            </span>
          </>
        )}
      </Button>
    </span>
  );
}

export type ContextContentProps = ContextStyleProps<ComponentProps<typeof PopoverContent>, PopupKnobStyle & ContextKnobStyle>;

export function ContextContent({
  "aria-label": ariaLabel,
  side = "top",
  align = "end",
  sideOffset = 8,
  collisionPadding = 16,
  padding = "none",
  className,
  children,
  ...props
}: ContextContentProps) {
  const { modelName } = useContextValue();

  return (
    <PopoverContent
      {...props}
      // default panel carries no title, so popup needs name of its own
      aria-label={ariaLabel ?? (modelName ? `Context window · ${modelName}` : "Context window")}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      padding={padding}
      className={cn("w-[min(28rem,calc(100vw-2rem))] overflow-hidden", className)}
    >
      <div data-control-ui="context" data-control-family="context" data-slot="content" className="overflow-hidden">
        {children ?? (
          <ScrollArea maxHeight="min(36rem, calc(100dvh - 8rem))" lockAxis="x">
            <div className="grid gap-4 p-4">
              <ContextSummary />
              <ContextGraph />
              <ContextLegend />
            </div>
          </ScrollArea>
        )}
      </div>
    </PopoverContent>
  );
}

export type ContextHeaderProps = ComponentProps<"div"> & { style?: CSSProperties & ContextKnobStyle };

export function ContextHeader({ className, children, ...props }: ContextHeaderProps) {
  return (
    <div
      {...props}
      data-control-ui="context"
      data-control-family="context"
      data-slot="header"
      className={cn("flex items-start gap-3 p-4 pb-0", className)}
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

export type ContextTitleProps = ContextStyleProps<ComponentProps<typeof PopoverTitle>, ContextKnobStyle>;

export function ContextTitle({ className, children, ...props }: ContextTitleProps) {
  return (
    <PopoverTitle {...props} data-control-ui="context" data-control-family="context" data-slot="title" className={className}>
      {children ?? "Context window"}
    </PopoverTitle>
  );
}

export type ContextDescriptionProps = ContextStyleProps<ComponentProps<typeof PopoverDescription>, ContextKnobStyle>;

export function ContextDescription({ className, children, ...props }: ContextDescriptionProps) {
  const { modelName } = useContextValue();
  return (
    <PopoverDescription {...props} data-control-ui="context" data-control-family="context" data-slot="description" className={className}>
      {children ?? modelName ?? "Token usage by context segment"}
    </PopoverDescription>
  );
}

export type ContextSummaryProps = ContextStyleProps<ComponentProps<"div">, ContextKnobStyle>;

export function ContextSummary({ className, children, ...props }: ContextSummaryProps) {
  const { model, numberFormatter, percentageFormatter } = useContextValue();
  const percentage = model.ratio === null ? null : percentageFormatter.format(model.ratio);

  return (
    <div
      {...props}
      data-control-ui="context"
      data-control-family="context"
      data-slot="summary"
      data-status={model.status}
      className={cn("flex items-baseline justify-between gap-3", className)}
    >
      {children ?? (
        <>
          <span>{percentage === null ? `${numberFormatter.format(model.usedTokens)} tokens used` : `${percentage} used`}</span>
          <span data-control-ui="context" data-control-family="context" data-slot="summary-value">
            {model.maxTokens === null
              ? "Limit unavailable"
              : `${numberFormatter.format(model.usedTokens)} / ${numberFormatter.format(model.maxTokens)} tokens`}
          </span>
        </>
      )}
    </div>
  );
}

export type ContextGraphProps = ContextStyleProps<Omit<ComponentProps<"svg">, "children">, ContextKnobStyle>;

export function ContextGraph({ className, ...props }: ContextGraphProps) {
  const { model } = useContextValue();

  return (
    <svg
      {...props}
      data-control-ui="context"
      data-control-family="context"
      data-slot="graph"
      data-status={model.status}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-2.5 w-full overflow-hidden", className)}
    >
      <rect data-control-ui="context" data-control-family="context" data-slot="track" x="0" y="0" width="100" height="10" rx="5" />
      {model.segments.map((segment) => (
        <rect
          key={segment.segment.id}
          data-control-ui="context"
          data-control-family="context"
          data-slot="segment"
          data-kind={segment.kind}
          x={segment.start}
          y="0"
          width={segment.width}
          height="10"
        />
      ))}
      {model.status === "over-limit" && model.limitPosition !== null ? (
        <>
          <rect
            data-control-ui="context"
            data-control-family="context"
            data-slot="overage"
            x={model.limitPosition}
            y="0"
            width={100 - model.limitPosition}
            height="10"
          />
          <line
            data-control-ui="context"
            data-control-family="context"
            data-slot="limit-marker"
            x1={model.limitPosition}
            x2={model.limitPosition}
            y1="0"
            y2="10"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
    </svg>
  );
}

export type ContextLegendProps = ContextStyleProps<ComponentProps<"ul">, ContextKnobStyle>;

type ContextLegendRowProps = {
  kind: ContextSegmentKind;
  label: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  tone?: "available" | "over-limit";
};

function ContextLegendRow({ kind, label, description, value, tone }: ContextLegendRowProps) {
  return (
    <li
      data-control-ui="context"
      data-control-family="context"
      data-slot="legend-item"
      data-kind={kind}
      data-tone={tone}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-1.5"
    >
      <div className="flex min-w-0 items-start gap-2">
        <span
          data-control-ui="context"
          data-control-family="context"
          data-slot="legend-indicator"
          data-kind={kind}
          aria-hidden="true"
          className="mt-1 size-2.5 shrink-0"
        />
        <div className="min-w-0">
          <div data-control-ui="context" data-control-family="context" data-slot="legend-label">
            {label}
          </div>
          {description !== undefined && description !== null ? (
            <div data-control-ui="context" data-control-family="context" data-slot="legend-description">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {value !== undefined && value !== null ? (
        <span data-control-ui="context" data-control-family="context" data-slot="legend-value">
          {value}
        </span>
      ) : null}
    </li>
  );
}

export function ContextLegend({ className, children, ...props }: ContextLegendProps) {
  const { model, numberFormatter, percentageFormatter } = useContextValue();

  return (
    <ul {...props} data-control-ui="context" data-control-family="context" data-slot="legend" className={cn("grid", className)}>
      {children ?? (
        <>
          {model.segments.map((segment) => (
            <ContextLegendRow
              key={segment.segment.id}
              kind={segment.kind}
              label={segment.segment.label}
              description={segment.segment.description}
              value={`${numberFormatter.format(segment.tokens)} tokens${
                segment.ratio === null ? "" : ` · ${percentageFormatter.format(segment.ratio)}`
              }`}
            />
          ))}
          {model.status === "normal" && model.remainingTokens !== null ? (
            <ContextLegendRow
              kind="other"
              label="Available"
              tone="available"
              value={`${numberFormatter.format(model.remainingTokens)} tokens · ${percentageFormatter.format(
                model.remainingTokens / (model.maxTokens ?? 1),
              )}`}
            />
          ) : null}
          {model.status === "over-limit" ? (
            <ContextLegendRow
              kind="other"
              label="Over limit"
              tone="over-limit"
              value={`${numberFormatter.format(model.overageTokens)} tokens over limit`}
            />
          ) : null}
          {model.status === "unavailable" ? <ContextLegendRow kind="other" label="Limit unavailable" /> : null}
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
