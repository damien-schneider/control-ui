import type { FilterBarField, FilterBarItem, FilterBarLabels, FilterBarOperator, FilterBarOption, FilterBarScalar } from "./types";

export const defaultFilterBarLabels: FilterBarLabels = {
  fieldSearch: "Filter field",
  operatorSearch: "Filter operator",
  valueSearch: (fieldLabel) => `${fieldLabel ?? "Filter"} value`,
  operatorPlaceholder: "Operator…",
  valuePlaceholder: "Value…",
  editSegment: (stage, label) => `Edit ${stage}: ${label}`,
  removeFilter: (filter) => `Remove filter: ${filter}`,
  loading: "Loading values…",
  loadError: "Couldn’t load values.",
  noOptions: "No matching options.",
  typeValue: "Type a value.",
  invalidNumber: "Enter a number, like 42 or 3.5.",
  customValue: (value) => `Use “${value}”`,
  apply: "Apply",
  added: (filter) => `Added filter: ${filter}`,
  updated: (filter) => `Updated filter: ${filter}`,
  removed: (filter) => `Removed filter: ${filter}`,
  cleared: "Cleared all filters",
};

const booleanOptions = [
  { value: true, label: "True" },
  { value: false, label: "False" },
];

export function fieldOperators(field: FilterBarField, operators: readonly FilterBarOperator[]) {
  const allowed = field.operators;
  if (allowed) return operators.filter((operator) => allowed.includes(operator.id));
  const type = field.type ?? "text";
  return operators.filter((operator) => !operator.types || operator.types.includes(type));
}

export function fieldOptions(field: FilterBarField): readonly FilterBarOption[] {
  return field.options ?? (field.type === "boolean" ? booleanOptions : []);
}

export function parseCustomValue(field: FilterBarField, query: string): FilterBarScalar | undefined {
  if (!query.trim()) return undefined;
  if (field.type === "number") {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(query.trim())) return undefined;
    const number = Number(query);
    return Number.isFinite(number) ? number : undefined;
  }
  if (field.type === "boolean") {
    if (query.toLowerCase() === "true") return true;
    if (query.toLowerCase() === "false") return false;
    return undefined;
  }
  return query.trim();
}

export function allowsCustomValue(field: FilterBarField) {
  return field.allowCustomValue ?? (field.options === undefined && field.type !== "boolean" && field.optionsMode !== "remote");
}

export function formatFilterValue(item: FilterBarItem, field: FilterBarField | undefined) {
  if (item.value === null) return "";
  const values = Array.isArray(item.value) ? item.value : [item.value];
  return values.map((value) => field?.formatValue?.(value) ?? fieldOptionsForLabel(field, value)).join(", ");
}

function fieldOptionsForLabel(field: FilterBarField | undefined, value: FilterBarScalar) {
  return (field ? fieldOptions(field).find((option) => option.value === value)?.label : undefined) ?? String(value);
}

export function describeFilter(item: FilterBarItem, fields: readonly FilterBarField[], operators: readonly FilterBarOperator[]) {
  const field = fields.find((candidate) => candidate.id === item.fieldId);
  const operator = operators.find((candidate) => candidate.id === item.operatorId);
  return [field?.label ?? item.fieldId, operator?.ariaLabel ?? operator?.label, formatFilterValue(item, field)].filter(Boolean).join(" ");
}

export function filterNavigationKeys(items: readonly FilterBarItem[]) {
  return items.flatMap((item) =>
    ["field", "operator", ...(item.value === null ? [] : ["value"]), "remove"].map((segment) => `${item.id}:${segment}`),
  );
}
