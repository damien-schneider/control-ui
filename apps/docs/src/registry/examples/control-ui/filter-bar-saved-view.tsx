"use client";

import { useState } from "react";
import {
  DEFAULT_FILTER_OPERATORS,
  FilterBar,
  type FilterBarField,
  type FilterBarItem,
  type FilterBarLabels,
} from "@/components/control-ui/filter-bar";
import { Text } from "@/components/control-ui/ui/typography";

const fields: readonly FilterBarField[] = [
  {
    id: "status",
    label: "Status",
    operators: ["is", "is-not", "in"],
    options: [
      { value: "open", label: "Open" },
      { value: "in-progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
  },
  {
    id: "team",
    label: "Team",
    operators: ["is", "in"],
    options: [
      { value: "design", label: "Design" },
      { value: "platform", label: "Platform" },
      { value: "growth", label: "Growth" },
    ],
  },
  { id: "estimate", label: "Estimate (days)", type: "number", operators: ["gt", "lt"] },
];

const savedView: readonly FilterBarItem[] = [
  { id: "saved-status", fieldId: "status", operatorId: "is", value: "open" },
  { id: "saved-team", fieldId: "team", operatorId: "in", value: ["design", "platform"] },
];

const viewLabels: Partial<FilterBarLabels> = {
  fieldSearch: "Search issue properties",
  operatorSearch: "Search conditions",
  valueSearch: (fieldLabel) => (fieldLabel ? `Search ${fieldLabel.toLowerCase()} values` : "Search values"),
  operatorPlaceholder: "Condition…",
  valuePlaceholder: "Pick or type a value…",
  noOptions: "Nothing in this workspace matches.",
  apply: "Add to view",
  removeFilter: (filter) => `Remove ${filter} from this view`,
  added: (filter) => `${filter} added to this view`,
  removed: (filter) => `${filter} removed from this view`,
  cleared: "This view now shows every issue",
};

export function FilterBarSavedViewExample() {
  const [filterCount, setFilterCount] = useState(savedView.length);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <div className="flex items-center justify-between">
        <Text size="label" weight="semibold">
          Open design and platform work
        </Text>
        <Text size="caption" tone="muted" role="status">
          {filterCount === 1 ? "1 filter in this view" : `${filterCount} filters in this view`}
        </Text>
      </div>
      <FilterBar.Root
        fields={fields}
        operators={DEFAULT_FILTER_OPERATORS}
        defaultValue={savedView}
        onValueChange={(filters) => setFilterCount(filters.length)}
        labels={viewLabels}
        aria-label="Saved view filters"
      >
        <FilterBar.Chips />
        <FilterBar.AddButton />
        <FilterBar.Clear />
      </FilterBar.Root>
    </div>
  );
}
