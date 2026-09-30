"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, KeyboardEvent } from "react";
import { useState } from "react";
import type { FilterBarKnobStyle } from "@/components/control-ui/knob-contracts/filter-bar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { FilterBarContext, type FilterBarContextValue, type FilterBarExit } from "./filter-bar/context";
import { fieldOperators, filterNavigationKeys } from "./filter-bar/model";
import { filterMotionEnabled, useFilterBarMotion } from "./filter-bar/motion";
import { FilterBarAddButton, FilterBarChip, FilterBarChips, FilterBarClear, FilterBarInput } from "./filter-bar/parts";
import type { FilterBarDraft, FilterBarField, FilterBarItem, FilterBarOperator, FilterBarStage, FilterBarValue } from "./filter-bar/types";

export type { FilterBarChipProps } from "./filter-bar/parts";
export type {
  FilterBarField,
  FilterBarItem,
  FilterBarOperator,
  FilterBarOption,
  FilterBarQuery,
  FilterBarScalar,
  FilterBarValue,
} from "./filter-bar/types";

export type FilterBarRootProps = Omit<ComponentProps<"fieldset">, "onChange" | "style"> & {
  fields: readonly FilterBarField[];
  operators: readonly FilterBarOperator[];
  value: readonly FilterBarItem[];
  onValueChange: (value: FilterBarItem[]) => void;
  createItemId?: () => string;
  disabled?: boolean;
  readOnly?: boolean;
  style?: CSSProperties & FilterBarKnobStyle;
};

function FilterBarRoot({
  fields,
  operators,
  value,
  onValueChange,
  createItemId = () => crypto.randomUUID(),
  disabled = false,
  readOnly = false,
  className,
  children,
  ref,
  "aria-label": ariaLabel = "Filters",
  ...props
}: FilterBarRootProps) {
  const [draft, setDraft] = useState<FilterBarDraft | null>(null);
  const [exits, setExits] = useState<FilterBarExit[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [focusNodes] = useState(() => new Map<string, HTMLElement>());
  const { rootRef, ...motion } = useFilterBarMotion();

  function register(key: string, element: HTMLElement | null) {
    if (key.startsWith("chip:") || key.startsWith("entry:")) motion.register(key, element);
    if (element) focusNodes.set(key, element);
    else focusNodes.delete(key);
  }

  function transition(next: FilterBarDraft) {
    motion.capture();
    setDraft(next);
    if (next.stage === "value" && next.fieldId && next.operatorId) {
      fields
        .find((field) => field.id === next.fieldId)
        ?.onQueryChange?.({ fieldId: next.fieldId, operatorId: next.operatorId, query: next.query });
    }
  }

  function start(owner: string, anchor: HTMLElement, stage: FilterBarStage = "field", item?: FilterBarItem, initialQuery?: string) {
    if (disabled || readOnly) return;
    if (draft?.owner === owner && draft.stage === stage) return;
    const values = item?.value === null || item?.value === undefined ? [] : [item.value].flat();
    const query = initialQuery ?? "";
    transition({
      id: item?.id ?? createItemId(),
      owner,
      anchor,
      stage,
      fieldId: item?.fieldId,
      operatorId: item?.operatorId,
      values,
      query,
      editing: Boolean(item),
    });
  }

  function close(restoreFocus = true) {
    motion.capture();
    if (restoreFocus && draft?.anchor.isConnected) draft.anchor.focus();
    setDraft(null);
  }

  function back() {
    if (!draft) return;
    if (draft.stage === "field") return close();
    if (draft.stage === "operator") return transition({ ...draft, stage: "field", operatorId: undefined, values: [], query: "" });
    const field = fields.find((candidate) => candidate.id === draft.fieldId);
    const stage = field && fieldOperators(field, operators).length === 1 ? "field" : "operator";
    transition({ ...draft, stage, values: [], query: "" });
  }

  function setQuery(query: string) {
    if (!draft) return;
    setDraft({ ...draft, query });
    if (draft.stage === "value" && draft.fieldId && draft.operatorId) {
      fields.find((field) => field.id === draft.fieldId)?.onQueryChange?.({ fieldId: draft.fieldId, operatorId: draft.operatorId, query });
    }
  }

  function commitDraft(next: FilterBarDraft, nextValue: FilterBarValue) {
    if (disabled || readOnly) return;
    if (!next.fieldId || !next.operatorId) return;
    const item: FilterBarItem = { id: next.id, fieldId: next.fieldId, operatorId: next.operatorId, value: nextValue };
    motion.capture();
    onValueChange(next.editing ? value.map((current) => (current.id === item.id ? item : current)) : [...value, item]);
    setAnnouncement(next.editing ? "Filter updated." : "Filter added.");
    if (next.anchor.isConnected) next.anchor.focus();
    setDraft(null);
  }

  function selectOperator(operatorId: string, next = draft) {
    if (!next) return;
    const operator = operators.find((candidate) => candidate.id === operatorId);
    if (!operator) return;
    const nextDraft: FilterBarDraft = { ...next, operatorId, stage: "value", values: [], query: "" };
    if (operator.arity === "none") commitDraft(nextDraft, null);
    else transition(nextDraft);
  }

  function selectField(fieldId: string) {
    if (!draft) return;
    const field = fields.find((candidate) => candidate.id === fieldId);
    if (!field) return;
    const available = fieldOperators(field, operators);
    const next: FilterBarDraft = { ...draft, fieldId, operatorId: undefined, stage: "operator", values: [], query: "" };
    if (available.length === 1 && available[0]) selectOperator(available[0].id, next);
    else transition(next);
  }

  function addExits(items: readonly FilterBarItem[]) {
    const root = rootRef.current;
    if (!root || !filterMotionEnabled(root)) return;
    const rootBounds = root.getBoundingClientRect();
    const leaving = items.flatMap((item) => {
      const node = focusNodes.get(`chip:${item.id}`);
      if (!node) return [];
      const bounds = node.getBoundingClientRect();
      return [
        {
          item,
          style: {
            position: "absolute",
            left: bounds.left - rootBounds.left,
            top: bounds.top - rootBounds.top,
            width: bounds.width,
            height: bounds.height,
          },
        } satisfies FilterBarExit,
      ];
    });
    setExits((current) => [...current, ...leaving]);
  }

  function focusEntry() {
    const entry = [...focusNodes].find(([key]) => key.startsWith("entry:"));
    entry?.[1].focus();
  }

  function remove(item: FilterBarItem) {
    if (disabled || readOnly) return;
    motion.capture();
    addExits([item]);
    const index = value.findIndex((candidate) => candidate.id === item.id);
    const neighbour = value[index + 1] ?? value[index - 1];
    if (neighbour) focusNodes.get(`${neighbour.id}:field`)?.focus();
    else focusEntry();
    if (draft?.id === item.id) setDraft(null);
    onValueChange(value.filter((candidate) => candidate.id !== item.id));
    setAnnouncement("Filter removed.");
  }

  function clear() {
    if (disabled || readOnly) return;
    motion.capture();
    addExits(value);
    setDraft(null);
    onValueChange([]);
    focusEntry();
    setAnnouncement("Filters cleared.");
  }

  function deleteFocusedFilter(event: KeyboardEvent<HTMLElement>, itemId: string) {
    const item = value.find((candidate) => candidate.id === itemId);
    if (!item) return;
    event.preventDefault();
    remove(item);
  }

  function focusAdjacentFilter(event: KeyboardEvent<HTMLElement>, itemId?: string, part?: string) {
    const keys = filterNavigationKeys(value);
    const index = itemId ? keys.indexOf(`${itemId}:${part}`) : keys.length;
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    const target = keys[index + direction];
    event.preventDefault();
    if (target) focusNodes.get(target)?.focus();
    else if (itemId) focusEntry();
  }

  function navigate(event: KeyboardEvent<HTMLElement>, itemId?: string, part?: string) {
    if (event.defaultPrevented) return;
    const removing = event.key === "Delete" || event.key === "Backspace";
    if (itemId && removing) return deleteFocusedFilter(event, itemId);
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") focusAdjacentFilter(event, itemId, part);
  }

  const context: FilterBarContextValue = {
    fields,
    operators,
    items: value,
    draft,
    exits,
    disabled,
    readOnly,
    register,
    start,
    close,
    back,
    setQuery,
    selectField,
    selectOperator,
    selectValues: (values) => {
      if (draft) transition({ ...draft, values, query: "" });
    },
    commit: (nextValue) => {
      if (draft) commitDraft(draft, nextValue);
    },
    remove,
    clear,
    releaseExit: (id) => setExits((current) => current.filter((exit) => exit.item.id !== id)),
    navigate,
  };

  const rootElement = useRender({
    ref: [rootRef, ref ?? null],
    render: (
      <fieldset
        aria-label={ariaLabel}
        data-control-ui="filter-bar"
        data-control-family="filter-bar"
        data-slot="root"
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        className={cn("relative flex min-w-0 flex-wrap items-center", className)}
        {...props}
      >
        {children}
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </fieldset>
    ),
  });
  return <FilterBarContext.Provider value={context}>{rootElement}</FilterBarContext.Provider>;
}

export const FilterBar = {
  Root: FilterBarRoot,
  Chips: FilterBarChips,
  Chip: FilterBarChip,
  AddButton: FilterBarAddButton,
  Input: FilterBarInput,
  Clear: FilterBarClear,
};

export const DEFAULT_FILTER_OPERATORS: readonly FilterBarOperator[] = [
  { id: "is", label: "is" },
  { id: "is-not", label: "is not" },
  { id: "contains", label: "contains" },
  { id: "starts-with", label: "starts with" },
  { id: "gt", label: ">" },
  { id: "gte", label: "≥" },
  { id: "lt", label: "<" },
  { id: "lte", label: "≤" },
  { id: "in", label: "is any of", arity: "many" },
  { id: "is-empty", label: "is empty", arity: "none" },
  { id: "is-not-empty", label: "is not empty", arity: "none" },
];
