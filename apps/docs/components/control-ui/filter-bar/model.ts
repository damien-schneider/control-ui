import type { FilterBarField, FilterBarItem, FilterBarOperator, FilterBarOption, FilterBarScalar } from "./types";

const booleanOptions = [
  { value: true, label: "True" },
  { value: false, label: "False" },
];

export function fieldOperators(field: FilterBarField, operators: readonly FilterBarOperator[]) {
  return operators.filter((operator) => !field.operators || field.operators.includes(operator.id));
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

export function filterNavigationKeys(items: readonly FilterBarItem[]) {
  return items.flatMap((item) =>
    ["field", "operator", ...(item.value === null ? [] : ["value"]), "remove"].map((segment) => `${item.id}:${segment}`),
  );
}
