"use client";

import { useRender } from "@base-ui/react/use-render";
import { PlusIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import type { FilterBarKnobStyle } from "@/components/control-ui/knob-contracts/filter-bar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { Button, type ButtonProps } from "@/components/control-ui/ui/button";
import { useFilterBarContext } from "./context";
import { FilterBarEditor, FilterBarInlineInput } from "./editor";
import { formatFilterValue } from "./model";
import type { FilterBarField, FilterBarItem, FilterBarOperator, FilterBarStage } from "./types";

export type FilterBarChipProps = ComponentProps<"div"> & {
  item: FilterBarItem;
  readOnly?: boolean;
  style?: CSSProperties & FilterBarKnobStyle;
};

type FilterBarSegmentData = { stage: FilterBarStage; label: string; icon?: ReactNode };

function chipSegments(item: FilterBarItem, field: FilterBarField | undefined, operator: FilterBarOperator | undefined, draft: boolean) {
  const segments: FilterBarSegmentData[] = [{ stage: "field", label: field?.label ?? item.fieldId, icon: field?.icon }];
  if (operator || draft) segments.push({ stage: "operator", label: operator?.label ?? "Operator…" });
  if (item.value !== null || (draft && operator))
    segments.push({ stage: "value", label: item.value === null ? "Value…" : formatFilterValue(item, field) });
  return segments;
}

function FilterBarChipContent({ item, readOnly = false, className, ref, ...props }: FilterBarChipProps) {
  const context = useFilterBarContext();
  const field = context.fields.find((candidate) => candidate.id === item.fieldId);
  const operator = context.operators.find((candidate) => candidate.id === item.operatorId);
  const draft = Boolean(context.draft?.id === item.id && !context.draft.editing);
  const locked = readOnly || context.readOnly;
  const segments = chipSegments(item, field, operator, draft);

  return useRender({
    ref: [ref ?? null, locked ? null : (element: HTMLDivElement | null) => context.register(`chip:${item.id}`, element)],
    render: (
      <div
        data-control-ui="filter-bar"
        data-control-family="filter-bar"
        data-slot="chip"
        data-draft={draft || undefined}
        className={cn("inline-flex max-w-full min-w-0 items-stretch overflow-hidden", className)}
        {...props}
      >
        {segments.map((segment) => (
          <FilterBarSegment key={segment.stage} item={item} segment={segment} locked={locked} draft={draft} />
        ))}
        {!locked && !draft && (
          <Button
            ref={(element) => context.register(`${item.id}:remove`, element)}
            variant="ghost"
            size="sm"
            iconOnly
            data-control-ui="filter-bar"
            data-control-family="filter-bar"
            data-slot="remove"
            aria-label={`Remove ${field?.label ?? item.fieldId} filter`}
            disabled={context.disabled}
            onClick={() => context.remove(item)}
            onKeyDown={(event) => context.navigate(event, item.id, "remove")}
          >
            <XIcon aria-hidden="true" className="size-3" />
          </Button>
        )}
      </div>
    ),
  });
}

function FilterBarSegment({
  item,
  segment,
  locked,
  draft,
}: {
  item: FilterBarItem;
  segment: FilterBarSegmentData;
  locked: boolean;
  draft: boolean;
}) {
  const context = useFilterBarContext();
  if (locked)
    return (
      <span data-control-ui="filter-bar" data-control-family="filter-bar" data-slot="segment" className="inline-flex min-w-0 items-center">
        <span className="flex min-w-0 items-center gap-1.5">
          {segment.icon}
          <span className="truncate">{segment.label}</span>
        </span>
      </span>
    );
  return (
    <Button
      ref={(element) => context.register(`${item.id}:${segment.stage}`, element)}
      variant="ghost"
      size="sm"
      data-control-ui="filter-bar"
      data-control-family="filter-bar"
      data-slot="segment"
      className="shrink"
      aria-label={`Edit ${segment.stage}: ${segment.label}`}
      aria-haspopup="listbox"
      aria-expanded={context.draft?.owner === item.id && context.draft.stage === segment.stage}
      disabled={context.disabled || draft}
      onClick={(event) => context.start(item.id, event.currentTarget, segment.stage, item)}
      onKeyDown={(event) => context.navigate(event, item.id, segment.stage)}
    >
      {segment.icon}
      <span className="truncate">{segment.label}</span>
    </Button>
  );
}

export function FilterBarChip(props: FilterBarChipProps) {
  return (
    <FilterBarEditor owner={props.item.id} mode="button">
      <FilterBarChipContent {...props} />
    </FilterBarEditor>
  );
}

function ExitingChip({ item, style }: { item: FilterBarItem; style: CSSProperties }) {
  const context = useFilterBarContext();
  const ref = useRef<HTMLDivElement>(null);
  const releaseExit = context.releaseExit;
  useEffect(() => {
    const animations = ref.current?.getAnimations({ subtree: true }) ?? [];
    let mounted = true;
    const release = () => {
      if (mounted) releaseExit(item.id);
    };
    if (animations.length === 0) release();
    else Promise.all(animations.map((animation) => animation.finished)).then(release, release);
    return () => {
      mounted = false;
    };
  }, [item.id, releaseExit]);
  return (
    <div ref={ref} style={style} data-control-ui="filter-bar" data-control-family="filter-bar" data-slot="exit" aria-hidden="true" inert>
      <FilterBarChipContent item={item} readOnly />
    </div>
  );
}

export function FilterBarChips({ renderChip }: { renderChip?: (item: FilterBarItem) => ReactNode }) {
  const context = useFilterBarContext();
  const items = [...context.items];
  const draft = context.draft;
  if (draft?.fieldId && !draft.editing)
    items.push({
      id: draft.id,
      fieldId: draft.fieldId,
      operatorId: draft.operatorId ?? "",
      value: draft.values.length > 0 ? draft.values : null,
    });
  return (
    <>
      {items.map((item) => (
        <FilterBarChipContentWithEditor key={item.id} item={item} renderChip={renderChip} />
      ))}
      {context.exits.map((exit) => (
        <ExitingChip key={exit.item.id} {...exit} />
      ))}
    </>
  );
}

function FilterBarChipContentWithEditor({ item, renderChip }: { item: FilterBarItem; renderChip?: (item: FilterBarItem) => ReactNode }) {
  const context = useFilterBarContext();
  return renderChip && item.id !== context.draft?.id ? renderChip(item) : <FilterBarChip item={item} />;
}

export function FilterBarAddButton({ className, children = "Add filter", onClick, onKeyDown, ref, ...props }: ButtonProps) {
  const context = useFilterBarContext();
  const owner = useId();
  const button = useRender({
    ref: [ref ?? null, (element: HTMLButtonElement | null) => context.register(`entry:${owner}`, element)],
    render: (
      <Button
        variant="ghost"
        size="sm"
        className={className}
        aria-haspopup="listbox"
        aria-expanded={context.draft?.owner === owner}
        disabled={context.disabled || context.readOnly}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context.start(owner, event.currentTarget);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          context.navigate(event);
        }}
      >
        <PlusIcon aria-hidden="true" className="size-3.5" />
        {children}
      </Button>
    ),
  });
  return (
    <FilterBarEditor owner={owner} mode="button">
      {button}
    </FilterBarEditor>
  );
}

export function FilterBarInput({ className, ...props }: Omit<Parameters<typeof FilterBarInlineInput>[0], "owner" | "inputRef">) {
  const context = useFilterBarContext();
  const owner = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <FilterBarEditor owner={owner} mode="input" anchorRef={inputRef}>
      <div
        ref={(element) => context.register(`entry:${owner}`, element ? inputRef.current : null)}
        className={cn("min-w-0 max-w-full flex-[1_1_10rem]", className)}
      >
        <FilterBarInlineInput
          owner={owner}
          inputRef={inputRef}
          aria-label="Add filter"
          placeholder="Filter…"
          disabled={context.disabled}
          readOnly={context.readOnly}
          {...props}
        />
      </div>
    </FilterBarEditor>
  );
}

export function FilterBarClear({ children = "Clear", onClick, ...props }: ButtonProps) {
  const context = useFilterBarContext();
  if (context.items.length === 0 && !context.draft) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Clear filters"
      disabled={context.disabled || context.readOnly}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.clear();
      }}
    >
      {children}
    </Button>
  );
}
