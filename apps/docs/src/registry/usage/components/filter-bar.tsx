"use client";

import { useState } from "react";
import { DEFAULT_FILTER_OPERATORS, FilterBar, type FilterBarField, type FilterBarItem } from "@/components/control-ui/filter-bar";

const fields: readonly FilterBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["is", "is-not", "in"],
    options: [
      { value: "running", label: "Running" },
      { value: "completed", label: "Completed" },
    ],
  },
  { id: "duration", label: "Duration (ms)", type: "number", operators: ["gt", "lt"] },
];

export function FilterBarUsage() {
  const [filters, setFilters] = useState<FilterBarItem[]>([]);
  return (
    <FilterBar.Root fields={fields} operators={DEFAULT_FILTER_OPERATORS} value={filters} onValueChange={setFilters}>
      <FilterBar.Chips />
      <FilterBar.AddButton />
      <FilterBar.Clear />
    </FilterBar.Root>
  );
}
