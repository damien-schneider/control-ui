import type { ReactNode } from "react";

export type FilterBarScalar = string | number | boolean;
export type FilterBarValue = FilterBarScalar | FilterBarScalar[] | null;
export type FilterBarOperator = { id: string; label: string; ariaLabel?: string; arity?: "none" | "one" | "many" };
export type FilterBarOption = { value: FilterBarScalar; label: string; icon?: ReactNode; disabled?: boolean };
export type FilterBarQuery = { fieldId: string; operatorId: string; query: string };
export type FilterBarField = {
  id: string;
  label: string;
  icon?: ReactNode;
  type?: "text" | "number" | "boolean";
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
