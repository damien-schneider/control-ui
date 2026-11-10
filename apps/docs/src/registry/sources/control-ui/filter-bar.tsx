"use client";

import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps, CSSProperties, KeyboardEvent } from "react";
import { useState } from "react";
import type { FilterBarKnobStyle } from "@/components/control-ui/knob-contracts/filter-bar-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { LiveStatus } from "@/components/control-ui/ui/live-status";
import { FilterBarContext, type FilterBarContextValue, type FilterBarExit } from "./filter-bar/context";
import { defaultFilterBarLabels, describeFilter, fieldOperators, filterNavigationKeys } from "./filter-bar/model";
import { filterMotionEnabled, useFilterBarMotion } from "./filter-bar/motion";
import { FilterBarAddButton, FilterBarChip, FilterBarChips, FilterBarClear, FilterBarInput } from "./filter-bar/parts";
import type {
  FilterBarDraft,
  FilterBarField,
  FilterBarItem,
  FilterBarLabels,
  FilterBarOperator,
  FilterBarStage,
  FilterBarValue,
} from "./filter-bar/types";

export type {
  FilterBarAddButtonProps,
  FilterBarChipProps,
  FilterBarChipsProps,
  FilterBarClearProps,
  FilterBarInputProps,
} from "./filter-bar/parts";
export type {
  FilterBarField,
  FilterBarFieldType,
  FilterBarItem,
  FilterBarLabels,
  FilterBarOperator,
  FilterBarOption,
  FilterBarQuery,
  FilterBarScalar,
  FilterBarStage,
  FilterBarValue,
} from "./filter-bar/types";

export type FilterBarRootProps = Omit<ComponentProps<"fieldset">, "onChange" | "style" | "defaultValue"> & {
  fields: readonly FilterBarField[];
  operators: readonly FilterBarOperator[];
  value?: readonly FilterBarItem[];
  defaultValue?: readonly FilterBarItem[];
  onValueChange?: (value: FilterBarItem[]) => void;
  labels?: Partial<FilterBarLabels>;
  createItemId?: () => string;
  disabled?: boolean;
  readOnly?: boolean;
  style?: CSSProperties & FilterBarKnobStyle;
};

function valueStatusMessage(field: FilterBarField | undefined, labels: FilterBarLabels): string | undefined {
  if (field?.error) return typeof field.error === "string" ? field.error : labels.loadError;
  if (field?.loading) return labels.loading;
  return undefined;
}

let fallbackItemCount = 0;

/** Swapping "is" for "is not" on a chip must not cost the value already picked; only a different arity needs a new one. */
function valuesKeptByOperator(draft: FilterBarDraft, operator: FilterBarOperator, operators: readonly FilterBarOperator[]) {
  const previous = operators.find((candidate) => candidate.id === draft.operatorId);
  return previous && (previous.arity ?? "one") === (operator.arity ?? "one") ? draft.values : [];
}

function createFilterItemId() {
  // randomUUID only exists in secure contexts; plain-http origins still need unique chip ids.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  fallbackItemCount += 1;
  return `filter-${Date.now().toString(36)}-${fallbackItemCount}`;
}

function FilterBarRoot({
  fields,
  operators,
  value,
  defaultValue = [],
  onValueChange,
  labels,
  createItemId = createFilterItemId,
  disabled = false,
  readOnly = false,
  className,
  children,
  ref,
  "aria-label": ariaLabel = "Filters",
  ...props
}: FilterBarRootProps) {
  const [uncontrolledItems, setUncontrolledItems] = useState(defaultValue);
  const items = value ?? uncontrolledItems;
  const text = { ...defaultFilterBarLabels, ...labels };
  const [draft, setDraft] = useState<FilterBarDraft | null>(null);
  const [exits, setExits] = useState<FilterBarExit[]>([]);
  const [announcement, setAnnouncement] = useState({ message: "", key: 0 });
  const [focusNodes] = useState(() => new Map<string, HTMLElement>());
  const { rootRef, ...motion } = useFilterBarMotion();

  function register(key: string, element: HTMLElement | null) {
    if (key.startsWith("chip:") || key.startsWith("entry:")) motion.register(key, element);
    if (element) focusNodes.set(key, element);
    else focusNodes.delete(key);
  }

  function setItems(next: FilterBarItem[]) {
    if (value === undefined) setUncontrolledItems(next);
    onValueChange?.(next);
  }

  // Removing the same filter twice produces the same sentence; the key makes the live region speak it again.
  function announce(message: string) {
    setAnnouncement((current) => ({ message, key: current.key + 1 }));
  }

  function transition(next: FilterBarDraft) {
    motion.capture();
    setAnnouncement((current) => ({ ...current, message: "" }));
    setDraft(next);
    if (next.stage !== "value" || !next.fieldId || !next.operatorId) return;
    const sameRequest =
      draft?.stage === "value" &&
      draft.id === next.id &&
      draft.fieldId === next.fieldId &&
      draft.operatorId === next.operatorId &&
      draft.query === next.query;
    if (sameRequest) return;
    fields
      .find((field) => field.id === next.fieldId)
      ?.onQueryChange?.({ fieldId: next.fieldId, operatorId: next.operatorId, query: next.query });
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
    setItems(next.editing ? items.map((current) => (current.id === item.id ? item : current)) : [...items, item]);
    announce((next.editing ? text.updated : text.added)(describeFilter(item, fields, operators)));
    if (next.anchor.isConnected) next.anchor.focus();
    setDraft(null);
  }

  function selectOperator(operatorId: string, next = draft) {
    const operator = operators.find((candidate) => candidate.id === operatorId);
    if (!next || !operator) return;
    const values = valuesKeptByOperator(next, operator, operators);
    const nextDraft: FilterBarDraft = { ...next, operatorId, stage: "value", values, query: "" };
    if (operator.arity === "none") commitDraft(nextDraft, null);
    else if (values.length === 0) transition(nextDraft);
    else commitDraft(nextDraft, operator.arity === "many" ? values : (values[0] ?? null));
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

  function addExits(leavingItems: readonly FilterBarItem[]) {
    const root = rootRef.current;
    if (!root || !filterMotionEnabled(root)) return;
    const rootBounds = root.getBoundingClientRect();
    const leaving = leavingItems.flatMap((item) => {
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

  function remove(item: FilterBarItem, moveFocus = true) {
    if (disabled || readOnly) return;
    motion.capture();
    addExits([item]);
    if (moveFocus) {
      const index = items.findIndex((candidate) => candidate.id === item.id);
      const neighbour = items[index + 1] ?? items[index - 1];
      const target = neighbour ? focusNodes.get(`${neighbour.id}:field`) : undefined;
      if (target) target.focus();
      else focusEntry();
    }
    if (draft?.id === item.id) setDraft(null);
    setItems(items.filter((candidate) => candidate.id !== item.id));
    announce(text.removed(describeFilter(item, fields, operators)));
  }

  function clear() {
    if (disabled || readOnly) return;
    motion.capture();
    addExits(items);
    setDraft(null);
    setItems([]);
    focusEntry();
    announce(text.cleared);
  }

  function deleteFocusedFilter(event: KeyboardEvent<HTMLElement>, itemId: string) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    event.preventDefault();
    remove(item);
  }

  function focusAdjacentFilter(event: KeyboardEvent<HTMLElement>, itemId?: string, part?: string) {
    const keys = filterNavigationKeys(items).filter((key) => focusNodes.has(key));
    const index = itemId ? keys.indexOf(`${itemId}:${part}`) : keys.length;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const direction = (event.key === "ArrowLeft") === rtl ? 1 : -1;
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
    labels: text,
    items,
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

  const draftField = draft?.stage === "value" ? fields.find((field) => field.id === draft.fieldId) : undefined;
  const liveMessage = valueStatusMessage(draftField, text) ?? announcement.message;

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
        <LiveStatus message={liveMessage} announcementKey={announcement.key} />
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
  { id: "contains", label: "contains", types: ["text"] },
  { id: "starts-with", label: "starts with", types: ["text"] },
  { id: "gt", label: ">", ariaLabel: "greater than", types: ["number"] },
  { id: "gte", label: "≥", ariaLabel: "at least", types: ["number"] },
  { id: "lt", label: "<", ariaLabel: "less than", types: ["number"] },
  { id: "lte", label: "≤", ariaLabel: "at most", types: ["number"] },
  { id: "in", label: "is any of", arity: "many", types: ["text", "number"] },
  { id: "is-empty", label: "is empty", arity: "none" },
  { id: "is-not-empty", label: "is not empty", arity: "none" },
];
