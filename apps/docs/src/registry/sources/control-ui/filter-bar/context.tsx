"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { createContext, use } from "react";
import type {
  FilterBarDraft,
  FilterBarField,
  FilterBarItem,
  FilterBarOperator,
  FilterBarScalar,
  FilterBarStage,
  FilterBarValue,
} from "./types";

export type FilterBarExit = { item: FilterBarItem; style: CSSProperties };

export type FilterBarContextValue = {
  fields: readonly FilterBarField[];
  operators: readonly FilterBarOperator[];
  items: readonly FilterBarItem[];
  draft: FilterBarDraft | null;
  exits: FilterBarExit[];
  disabled: boolean;
  readOnly: boolean;
  register: (key: string, element: HTMLElement | null) => void;
  start: (owner: string, anchor: HTMLElement, stage?: FilterBarStage, item?: FilterBarItem, query?: string) => void;
  close: (restoreFocus?: boolean) => void;
  back: () => void;
  setQuery: (query: string) => void;
  selectField: (fieldId: string) => void;
  selectOperator: (operatorId: string) => void;
  selectValues: (values: FilterBarScalar[]) => void;
  commit: (value: FilterBarValue) => void;
  remove: (item: FilterBarItem) => void;
  clear: () => void;
  releaseExit: (id: string) => void;
  navigate: (event: KeyboardEvent<HTMLElement>, itemId?: string, part?: string) => void;
};

export const FilterBarContext = createContext<FilterBarContextValue | null>(null);

export function useFilterBarContext() {
  const context = use(FilterBarContext);
  if (!context) throw new Error("FilterBar parts must be used inside FilterBar.Root.");
  return context;
}
