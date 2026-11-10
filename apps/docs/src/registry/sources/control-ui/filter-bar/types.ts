import type { ReactNode } from "react";

export type FilterBarScalar = string | number | boolean;
export type FilterBarValue = FilterBarScalar | FilterBarScalar[] | null;
export type FilterBarFieldType = "text" | "number" | "boolean";
export type FilterBarOperator = {
  id: string;
  label: string;
  ariaLabel?: string;
  arity?: "none" | "one" | "many";
  /** Field types this operator makes sense for; every type when omitted. A field's own `operators` list overrides it. */
  types?: readonly FilterBarFieldType[];
};
export type FilterBarOption = { value: FilterBarScalar; label: string; icon?: ReactNode; disabled?: boolean };
export type FilterBarQuery = { fieldId: string; operatorId: string; query: string };
export type FilterBarField = {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: FilterBarFieldType;
  operators?: readonly string[];
  options?: readonly FilterBarOption[];
  allowCustomValue?: boolean;
  optionsMode?: "local" | "remote";
  loading?: boolean;
  error?: ReactNode;
  onQueryChange?: (query: FilterBarQuery) => void;
  formatValue?: (value: FilterBarScalar) => string;
};
export type FilterBarItem = { id: string; fieldId: string; operatorId: string; value: FilterBarValue };
export type FilterBarStage = "field" | "operator" | "value";
export type FilterBarLabels = {
  fieldSearch: string;
  operatorSearch: string;
  valueSearch: (fieldLabel: string | undefined) => string;
  operatorPlaceholder: string;
  valuePlaceholder: string;
  editSegment: (stage: FilterBarStage, label: string) => string;
  removeFilter: (filter: string) => string;
  loading: string;
  loadError: string;
  noOptions: string;
  typeValue: string;
  invalidNumber: string;
  customValue: (value: string) => string;
  apply: string;
  added: (filter: string) => string;
  updated: (filter: string) => string;
  removed: (filter: string) => string;
  cleared: string;
};
export type FilterBarDraft = {
  id: string;
  owner: string;
  anchor: HTMLElement;
  stage: FilterBarStage;
  fieldId?: string;
  operatorId?: string;
  values: FilterBarScalar[];
  query: string;
  editing: boolean;
};
